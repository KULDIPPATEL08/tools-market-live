from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from backend.app.core.database import Base

class Startup(Base):
    __tablename__ = "startups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    tagline = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(1024), nullable=True)
    
    founding_year = Column(Integer, nullable=True)
    stage = Column(String(50), default="Seed", index=True)  # Bootstrap, Pre-seed, Seed, Series A, Series B+, Growth, Acquired, Shut Down
    funding_status = Column(String(100), default="Bootstrapped")
    total_raised_usd = Column(Float, nullable=True)
    
    country = Column(String(100), default="Global", index=True)
    city = Column(String(100), nullable=True)
    is_india = Column(Boolean, default=False, index=True)
    is_gujarat = Column(Boolean, default=False, index=True)
    
    industry = Column(String(100), default="AI / ML", index=True)
    founders = Column(String(255), nullable=True)
    products = Column(Text, nullable=True)
    batch = Column(String(100), nullable=True)
    
    sources_citing = Column(String(512), nullable=True)
    opportunity_score = Column(Integer, default=85)
    
    # Post-mortem & Market Opportunity detection
    is_dead = Column(Boolean, default=False, index=True)
    dead_reason = Column(Text, nullable=True)
    gap_opportunity = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
