import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./lenny_growth_assistant.db"

    # LLM Settings
    LLM_PROVIDER: str = "groq"  # 'groq', 'ollama', 'anthropic', 'openai', 'mock_local'

    # Groq Cloud Settings (Ultra-fast cloud inference)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Local Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Other Cloud Providers
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Knowledge Base
    TRANSCRIPT_DIR: str = "./data/transcripts_repo/episodes"
    TOP_K_RETRIEVAL: int = 5
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
