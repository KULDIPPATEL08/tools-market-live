from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from backend.app.core.database import Base

class Gap(Base):
    __tablename__ = "intelligence_gaps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Research Gap", index=True)
    priority = Column(String(50), default="medium", index=True)  # low, medium, high, critical
    status = Column(String(50), default="new", index=True)  # new, investigating, in_progress, resolved, archived
    evidence_summary = Column(Text, nullable=True)
    suggested_actions = Column(Text, nullable=True)
    related_tags = Column(String(512), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

