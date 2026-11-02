from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class CollectedRecord(Base):
    __tablename__ = "collected_records"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    source_name = Column(String(255), nullable=True)
    source_type = Column(String(50), nullable=True)
    
    title = Column(String(512), nullable=False, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    original_url = Column(String(2048), nullable=False, index=True)
    author = Column(String(255), nullable=True)
    
    published_at = Column(DateTime, nullable=True, index=True)
    collected_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tags = Column(String(512), default="", index=True)  # comma separated
    category = Column(String(100), default="General", index=True)
    language = Column(String(50), default="en")
    
    content_fingerprint = Column(String(64), nullable=False, unique=True, index=True)  # SHA-256 hash for deduplication
    quality_score = Column(Float, default=1.0)
    relevance_score = Column(Float, default=0.0)
    
    metadata_json = Column(Text, default="{}")
    is_saved = Column(Boolean, default=False, index=True)
    is_bookmarked = Column(Boolean, default=False, index=True)

    source = relationship("Source", backref="records")
