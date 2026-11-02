from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.core.database import Base

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # rss, github, hackernews, webpage, file, api
    url = Column(String(1024), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Technology", index=True)
    status = Column(String(50), default="active", index=True)  # active, paused, syncing, failed, disconnected
    fetch_interval_minutes = Column(Integer, default=60)
    last_synced_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    records_count = Column(Integer, default=0)
    config_json = Column(Text, default="{}")  # Extra config like headers, queries, credentials
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

