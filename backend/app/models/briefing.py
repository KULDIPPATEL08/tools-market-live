from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from backend.app.core.database import Base

class IntelligenceBriefing(Base):
    __tablename__ = "intelligence_briefings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    briefing_type = Column(String(50), default="daily", index=True)  # daily, weekly, startup, ai, market, security
    date = Column(DateTime, default=datetime.utcnow, index=True)
    
    executive_summary = Column(Text, nullable=False)
    key_developments_json = Column(Text, default="[]")  # list of key developments
    strategic_takeaways_json = Column(Text, default="[]")  # list of actionable takeaways
    sources_cited_json = Column(Text, default="[]")  # list of citation URLs and titles
    
    created_at = Column(DateTime, default=datetime.utcnow)
