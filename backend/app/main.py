import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.api.router import api_router
from app.services.rag_engine import rag_engine
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing The Lenny Growth Assistant FastAPI Application...")
    # Initialize Database tables
    await init_db()
    # Pre-index transcripts
    try:
        rag_engine.ensure_indexed()
    except Exception as e:
        logger.error(f"Background transcript pre-indexing warning: {e}")
    yield
    logger.info("Shutting down application...")

app = FastAPI(
    title="The Lenny Growth Assistant API",
    description="Grounded AI Conversational & Artifact Generation Engine based on Lenny's Podcast Transcripts",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and containerized frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "message": "An unexpected error occurred. Please check server logs."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
