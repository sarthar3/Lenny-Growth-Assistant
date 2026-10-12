from typing import Optional
from fastapi import APIRouter
from app.services.rag_engine import rag_engine
from app.config import settings
from app.utils.logger import logger

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

@router.post("")
async def trigger_ingestion():
    """Triggers loading and indexing of transcript Markdown files."""
    rag_engine.ensure_indexed(settings.TRANSCRIPT_DIR)
    return {
        "status": "success",
        "message": "Transcript ingestion completed successfully.",
        "episodes_indexed": len(rag_engine.transcripts_cache),
        "total_chunks": len(rag_engine.chunks_cache)
    }

@router.get("/status")
async def get_ingestion_status():
    """Retrieves ingestion index status."""
    return {
        "is_indexed": rag_engine.is_indexed,
        "episodes_count": len(rag_engine.transcripts_cache),
        "total_chunks": len(rag_engine.chunks_cache),
        "transcript_dir": settings.TRANSCRIPT_DIR
    }

@router.get("/episodes")
async def list_episodes(query: Optional[str] = "", limit: int = 50):
    """Lists indexed podcast episodes with search filtering for the Knowledge Dashboard."""
    rag_engine.ensure_indexed(settings.TRANSCRIPT_DIR)
    episodes = list(rag_engine.transcripts_cache.values())
    if query:
        q = query.lower().strip()
        episodes = [
            e for e in episodes
            if q in e.get("guest", "").lower()
            or q in e.get("title", "").lower()
            or any(q in str(k).lower() for k in e.get("keywords", []))
        ]
    return {
        "total": len(episodes),
        "episodes": episodes[:limit]
    }
