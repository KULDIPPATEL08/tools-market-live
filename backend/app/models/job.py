from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class CollectionJob(Base):
    __tablename__ = "collection_jobs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="pending", index=True)  # pending, running, completed, failed, cancelled, partial
    records_retrieved = Column(Integer, default=0)
    records_saved = Column(Integer, default=0)
    duplicates_detected = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    trigger_type = Column(String(50), default="manual")  # manual, scheduled, webhook, bulk
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", backref="jobs")
