import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings
from app.utils.logger import logger

Base = declarative_base()

SQLITE_URL = "sqlite+aiosqlite:///./lenny_growth_assistant.db"

def make_engine(url: str):
    if "sqlite" in url:
        return create_async_engine(url, echo=False, connect_args={"check_same_thread": False})
    return create_async_engine(url, echo=False, pool_pre_ping=True)

engine = make_engine(settings.DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def _migrate_columns(conn):
    """Safely add newly introduced columns to existing tables if needed."""
    try:
        await conn.execute(text("ALTER TABLE sessions ADD COLUMN is_pinned INTEGER DEFAULT 0"))
    except Exception:
        pass
    try:
        await conn.execute(text("ALTER TABLE sessions ADD COLUMN workspace VARCHAR(100) DEFAULT 'General'"))
    except Exception:
        pass

async def init_db():
    """Initialize database tables with automatic SQLite fallback if PostgreSQL host is unreachable"""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _migrate_columns(conn)
        logger.info("Database tables created / verified successfully.")
    except Exception as e:
        logger.warning(f"Primary DB failed ({e}). Falling back to local SQLite engine.")
        engine = make_engine(SQLITE_URL)
        AsyncSessionLocal.configure(bind=engine)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await _migrate_columns(conn)
        logger.info("SQLite fallback database initialized successfully.")

async def get_db():
    """Dependency for API endpoints to get a DB session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
