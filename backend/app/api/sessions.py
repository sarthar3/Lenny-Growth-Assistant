from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.schema import SessionModel, SessionSchema, SessionCreate, SessionUpdate, MessageModel
from app.utils.logger import logger

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("", response_model=SessionSchema, status_code=status.HTTP_201_CREATED)
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Starts a new independent chat session."""
    session_obj = SessionModel(
        title=payload.title or "New Conversation",
        model_provider=payload.model_provider or "groq",
        workspace=payload.workspace or "General",
        is_pinned=payload.is_pinned or 0
    )
    db.add(session_obj)
    await db.commit()
    await db.refresh(session_obj)

    stmt = select(SessionModel).options(selectinload(SessionModel.messages)).where(SessionModel.id == session_obj.id)
    res = await db.execute(stmt)
    full_session = res.scalar_one()

    logger.info(f"Created new chat session: {full_session.id}")
    return full_session

@router.get("", response_model=List[SessionSchema])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """Returns all active user chat sessions."""
    stmt = select(SessionModel).options(selectinload(SessionModel.messages)).order_by(
        SessionModel.is_pinned.desc(),
        SessionModel.updated_at.desc()
    )
    res = await db.execute(stmt)
    sessions = res.scalars().all()
    return sessions

@router.get("/{session_id}", response_model=SessionSchema)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves session details and full message history."""
    stmt = select(SessionModel).options(
        selectinload(SessionModel.messages).selectinload(MessageModel.artifact)
    ).where(SessionModel.id == session_id)

    res = await db.execute(stmt)
    session_obj = res.scalar_one_or_none()

    if not session_obj:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
    return session_obj

@router.patch("/{session_id}", response_model=SessionSchema)
async def update_session(session_id: str, payload: SessionUpdate, db: AsyncSession = Depends(get_db)):
    """Updates session title, pinned status, or workspace folder."""
    stmt = select(SessionModel).options(selectinload(SessionModel.messages)).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    sess_obj = res.scalar_one_or_none()
    if not sess_obj:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    if payload.title is not None:
        sess_obj.title = payload.title
    if payload.is_pinned is not None:
        sess_obj.is_pinned = payload.is_pinned
    if payload.workspace is not None:
        sess_obj.workspace = payload.workspace

    await db.commit()
    await db.refresh(sess_obj)
    return sess_obj

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes a chat session and associated messages/artifacts."""
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session_obj = res.scalar_one_or_none()

    if not session_obj:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    await db.delete(session_obj)
    await db.commit()
    logger.info(f"Deleted session: {session_id}")
    return None
