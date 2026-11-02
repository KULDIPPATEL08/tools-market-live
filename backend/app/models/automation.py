from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.core.database import Base

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    trigger_type = Column(String(50), nullable=False)  # interval, keyword_match, source_completed
    schedule_interval_minutes = Column(Integer, default=60)
    action_type = Column(String(50), nullable=False)  # sync_sources, auto_tag, generate_digest, run_gap_detection
    config_json = Column(Text, default="{}")
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
