from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from backend.app.core.database import Base

class SearchQueryLog(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(512), nullable=False, index=True)
    mode = Column(String(50), default="quick", index=True)
    provider = Column(String(50), default="duckduckgo")
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
