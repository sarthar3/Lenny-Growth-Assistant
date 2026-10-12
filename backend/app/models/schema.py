import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, ConfigDict

from app.database import Base

# =====================================================================
# SQLAlchemy ORM Models
# =====================================================================

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    model_provider = Column(String(50), default="groq")
    is_pinned = Column(Integer, default=0)
    workspace = Column(String(100), default="General")
    user_metadata = Column(JSON, nullable=True)

    messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan")
    artifacts = relationship("ArtifactModel", back_populates="session", cascade="all, delete-orphan")

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True)  # List of citation objects
    artifact_id = Column(String(36), ForeignKey("artifacts.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="messages")
    artifact = relationship("ArtifactModel", back_populates="message")

class TranscriptModel(Base):
    __tablename__ = "transcripts"

    id = Column(String(255), primary_key=True)  # e.g., slug 'brian-chesky'
    guest = Column(String(255), nullable=False)
    title = Column(String(500), nullable=False)
    publish_date = Column(String(50), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    video_id = Column(String(100), nullable=True)
    duration = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    keywords = Column(JSON, nullable=True)

    chunks = relationship("TranscriptChunkModel", back_populates="transcript", cascade="all, delete-orphan")

class TranscriptChunkModel(Base):
    __tablename__ = "transcript_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transcript_id = Column(String(255), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False)
    speaker = Column(String(255), nullable=False)
    timestamp = Column(String(50), nullable=False)  # e.g. "00:01:27"
    timestamp_sec = Column(Integer, default=0)  # e.g. 87
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)

    transcript = relationship("TranscriptModel", back_populates="chunks")

class ArtifactModel(Base):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    artifact_type = Column(String(50), nullable=False)  # 'ship30_essay', 'html_doc', 'markdown_doc', 'canvas'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="artifacts")
    message = relationship("MessageModel", back_populates="artifact", uselist=False)

class SystemConfigModel(Base):
    __tablename__ = "system_config"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# =====================================================================
# Pydantic Schemas
# =====================================================================

class CitationSchema(BaseModel):
    guest: str
    episode_title: str
    timestamp: str
    youtube_url: Optional[str] = None
    text_snippet: str

class MessageCreate(BaseModel):
    session_id: Optional[str] = None
    content: str
    model_provider: Optional[str] = None
    mode: Optional[str] = "ask_lenny"  # 'ask_lenny', 'deep_research', 'ship30', 'strategy_canvas'

class ArtifactSchema(BaseModel):
    id: str
    session_id: str
    title: str
    artifact_type: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageSchema(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: Optional[List[CitationSchema]] = None
    artifact_id: Optional[str] = None
    artifact: Optional[ArtifactSchema] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SessionSchema(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    model_provider: str
    is_pinned: Optional[int] = 0
    workspace: Optional[str] = "General"
    messages: List[MessageSchema] = []

    model_config = ConfigDict(from_attributes=True)

class SessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model_provider: Optional[str] = "groq"
    workspace: Optional[str] = "General"
    is_pinned: Optional[int] = 0

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[int] = None
    workspace: Optional[str] = None

class ConfigUpdate(BaseModel):
    provider: str
    ollama_model: Optional[str] = None
    ollama_url: Optional[str] = None

class Ship30Request(BaseModel):
    session_id: Optional[str] = None
    topic: str
    target_guest: Optional[str] = None
