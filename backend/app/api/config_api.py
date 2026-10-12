from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.config import settings
from app.utils.logger import logger

router = APIRouter(prefix="/api/config", tags=["Configuration"])

class ProviderConfigRequest(BaseModel):
    provider: str  # 'groq', 'ollama', 'anthropic', 'openai', 'mock_local'
    ollama_model: Optional[str] = None
    ollama_base_url: Optional[str] = None
    groq_model: Optional[str] = None

@router.get("")
async def get_config():
    """Returns active LLM configuration and available providers."""
    return {
        "active_provider": settings.LLM_PROVIDER,
        "available_providers": ["groq", "ollama", "mock_local", "anthropic", "openai"],
        "groq": {
            "configured": bool(settings.GROQ_API_KEY),
            "model": settings.GROQ_MODEL
        },
        "ollama": {
            "base_url": settings.OLLAMA_BASE_URL,
            "model": settings.OLLAMA_MODEL
        },
        "cloud_providers": {
            "groq_configured": bool(settings.GROQ_API_KEY),
            "groq_model": settings.GROQ_MODEL,
            "anthropic_configured": bool(settings.ANTHROPIC_API_KEY),
            "anthropic_model": settings.ANTHROPIC_MODEL,
            "openai_configured": bool(settings.OPENAI_API_KEY),
            "openai_model": settings.OPENAI_MODEL
        }
    }

@router.post("")
async def update_config(payload: ProviderConfigRequest):
    """Dynamically switches active LLM provider without code modifications."""
    valid_providers = ["groq", "ollama", "anthropic", "openai", "mock_local"]
    p_lower = payload.provider.lower()

    if p_lower not in valid_providers:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid provider '{payload.provider}'. Must be one of {valid_providers}"
        )

    settings.LLM_PROVIDER = p_lower

    if payload.ollama_model:
        settings.OLLAMA_MODEL = payload.ollama_model
    if payload.ollama_base_url:
        settings.OLLAMA_BASE_URL = payload.ollama_base_url
    if payload.groq_model:
        settings.GROQ_MODEL = payload.groq_model

    logger.info(f"Switched LLM Provider to: {settings.LLM_PROVIDER}")
    return {
        "message": f"Successfully updated LLM provider to {settings.LLM_PROVIDER}",
        "active_provider": settings.LLM_PROVIDER,
        "ollama_model": settings.OLLAMA_MODEL,
        "groq_model": settings.GROQ_MODEL
    }
