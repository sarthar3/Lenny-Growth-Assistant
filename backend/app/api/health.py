from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.services.rag_engine import rag_engine
from app.utils.security import get_security_policy

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    System Health Endpoint.
    Checks database connectivity, RAG index status, loaded chunk counts, current model provider, and security policies.
    """
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    rag_engine.ensure_indexed()

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local_sqlite"
        },
        "rag_knowledge_base": {
            "is_indexed": rag_engine.is_indexed,
            "total_chunks": len(rag_engine.chunks_cache),
            "total_episodes": len(rag_engine.transcripts_cache)
        },
        "active_llm_provider": settings.LLM_PROVIDER,
        "security_policy": get_security_policy()
    }
