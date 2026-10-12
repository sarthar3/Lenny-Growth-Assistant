from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.schema import (
    MessageCreate, MessageSchema, SessionModel, MessageModel, ArtifactModel, Ship30Request
)
from app.services.rag_engine import rag_engine
from app.services.llm_factory import LLMFactory
from app.services.ship30_skill import ship30_skill
from app.services.artifact_generator import artifact_generator
from app.config import settings
from app.utils.logger import logger

router = APIRouter(prefix="/api/chat", tags=["Chat & Agent"])

@router.post("", response_model=MessageSchema)
async def chat_interaction(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    """
    Main conversational agent endpoint with AI Mode routing:
    - ask_lenny: standard grounded Q&A
    - deep_research: multi-guest comparative deep dive
    - ship30: 1,250-word atomic essay generation
    - strategy_canvas: interactive visual canvas generation
    """
    # 1. Resolve or create session
    session_id = payload.session_id
    provider_name = payload.model_provider or settings.LLM_PROVIDER
    mode = (payload.mode or "ask_lenny").lower()

    if not session_id:
        new_sess = SessionModel(
            title=payload.content[:32] + "...",
            model_provider=provider_name
        )
        db.add(new_sess)
        await db.commit()
        await db.refresh(new_sess)
        session_id = new_sess.id
    else:
        stmt = select(SessionModel).where(SessionModel.id == session_id)
        res = await db.execute(stmt)
        sess_obj = res.scalar_one_or_none()
        if not sess_obj:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    # 2. Save user message to DB
    user_msg = MessageModel(
        session_id=session_id,
        role="user",
        content=payload.content
    )
    db.add(user_msg)
    await db.commit()

    # 3. Mode Handling: Direct Ship30 Shortcut
    if mode == "ship30":
        essay_res = await ship30_skill.generate_essay(
            topic=payload.content,
            provider_name=provider_name
        )
        artifact_obj = ArtifactModel(
            session_id=session_id,
            title=essay_res["title"],
            artifact_type="ship30_essay",
            content=essay_res["content"]
        )
        db.add(artifact_obj)
        await db.commit()
        await db.refresh(artifact_obj)

        asst_msg = MessageModel(
            session_id=session_id,
            role="assistant",
            content=f"Here is your **Ship 30 for 30 essay** on **{payload.content}** grounded in Lenny's Podcast transcripts.\n\nYou can review, copy, or export the full 1,250-word essay in the **Artifact Workspace** to the right!",
            citations=essay_res.get("citations", []),
            artifact_id=artifact_obj.id
        )
        db.add(asst_msg)
        await db.commit()

        full_stmt = select(MessageModel).options(selectinload(MessageModel.artifact)).where(MessageModel.id == asst_msg.id)
        full_res = await db.execute(full_stmt)
        return full_res.scalar_one()

    # 4. Mode Handling: Direct Strategy Canvas Shortcut
    elif mode == "strategy_canvas":
        rag_engine.ensure_indexed()
        context_chunks = rag_engine.retrieve(payload.content, top_k=6)
        guest_ref = context_chunks[0]["guest"] if context_chunks else "Growth Expert"

        html_content = artifact_generator.generate_growth_canvas_html(
            topic=payload.content[:40],
            guest_name=guest_ref,
            context_text=""
        )
        artifact_obj = ArtifactModel(
            session_id=session_id,
            title=f"Strategy Canvas: {payload.content[:30]}",
            artifact_type="html_doc",
            content=html_content
        )
        db.add(artifact_obj)
        await db.commit()
        await db.refresh(artifact_obj)

        citations = [
            {
                "guest": c.get("guest", ""),
                "episode_title": c.get("episode_title", ""),
                "timestamp": c.get("timestamp", ""),
                "youtube_url": c.get("youtube_url", ""),
                "text_snippet": c.get("content", "")[:200]
            }
            for c in context_chunks[:4]
        ]

        asst_msg = MessageModel(
            session_id=session_id,
            role="assistant",
            content=f"Generated an interactive **Growth Strategy Canvas** for **{payload.content}** based on insights from **{guest_ref}**.\n\nYou can view the visual layout in the **Artifact Workspace**!",
            citations=citations,
            artifact_id=artifact_obj.id
        )
        db.add(asst_msg)
        await db.commit()

        full_stmt = select(MessageModel).options(selectinload(MessageModel.artifact)).where(MessageModel.id == asst_msg.id)
        full_res = await db.execute(full_stmt)
        return full_res.scalar_one()

    # 5. Standard Q&A or Deep Research
    top_k = 8 if mode == "deep_research" else settings.TOP_K_RETRIEVAL
    rag_engine.ensure_indexed()
    context_chunks = rag_engine.retrieve(payload.content, top_k=top_k)

    # Multi-turn history
    hist_stmt = select(MessageModel).where(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc())
    hist_res = await db.execute(hist_stmt)
    history_msgs = hist_res.scalars().all()

    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in history_msgs[-6:]
    ]

    provider = LLMFactory.get_provider(provider_name)

    system_prompt = None
    if mode == "deep_research":
        system_prompt = (
            "You are in DEEP RESEARCH MODE for The Lenny Growth Assistant. Conduct an exhaustive, rigorous, multi-guest comparative analysis strictly using the transcript excerpts below. "
            "Synthesize contrasting viewpoints across guests, evaluate trade-offs, and cite every single claim with [Guest Name - Episode Title @ Timestamp]."
        )

    llm_res = await provider.generate_chat_response(
        messages=formatted_history,
        context_chunks=context_chunks,
        system_prompt=system_prompt
    )

    reply_content = llm_res.get("content", "")
    citations = llm_res.get("citations", [])

    # Check for implicit artifact intent
    artifact_id = None
    artifact_intent = artifact_generator.detect_artifact_intent(payload.content)
    if artifact_intent:
        guest_ref = citations[0]["guest"] if citations else "Growth Expert"
        html_content = artifact_generator.generate_growth_canvas_html(
            topic=payload.content[:40],
            guest_name=guest_ref,
            context_text=reply_content
        )
        art_obj = ArtifactModel(
            session_id=session_id,
            title=f"Strategy Canvas: {payload.content[:30]}",
            artifact_type="html_doc",
            content=html_content
        )
        db.add(art_obj)
        await db.commit()
        await db.refresh(art_obj)
        artifact_id = art_obj.id

    asst_msg = MessageModel(
        session_id=session_id,
        role="assistant",
        content=reply_content,
        citations=citations,
        artifact_id=artifact_id
    )
    db.add(asst_msg)
    await db.commit()

    full_stmt = select(MessageModel).options(selectinload(MessageModel.artifact)).where(MessageModel.id == asst_msg.id)
    full_res = await db.execute(full_stmt)
    return full_res.scalar_one()

@router.post("/ship30", response_model=MessageSchema)
async def generate_ship30_essay(payload: Ship30Request, db: AsyncSession = Depends(get_db)):
    """
    Dedicated product skill endpoint for Ship 30 for 30 essay generation.
    """
    session_id = payload.session_id
    if not session_id:
        new_sess = SessionModel(title=f"Ship 30: {payload.topic[:25]}", model_provider=settings.LLM_PROVIDER)
        db.add(new_sess)
        await db.commit()
        await db.refresh(new_sess)
        session_id = new_sess.id

    essay_res = await ship30_skill.generate_essay(
        topic=payload.topic,
        target_guest=payload.target_guest,
        provider_name=settings.LLM_PROVIDER
    )

    artifact_obj = ArtifactModel(
        session_id=session_id,
        title=essay_res["title"],
        artifact_type="ship30_essay",
        content=essay_res["content"]
    )
    db.add(artifact_obj)
    await db.commit()
    await db.refresh(artifact_obj)

    asst_msg = MessageModel(
        session_id=session_id,
        role="assistant",
        content=f"Here is your 1,250-word Ship 30 for 30 essay on **{payload.topic}** grounded in Lenny's Podcast transcripts.\n\nYou can view and edit the rendered essay in the **Artifact Workspace** to the right!",
        citations=essay_res.get("citations", []),
        artifact_id=artifact_obj.id
    )
    db.add(asst_msg)
    await db.commit()

    full_stmt = select(MessageModel).options(selectinload(MessageModel.artifact)).where(MessageModel.id == asst_msg.id)
    full_res = await db.execute(full_stmt)
    return full_res.scalar_one()
