from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from backend.app.core.database import Base

class AIModelRecord(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    organization = Column(String(100), nullable=False, index=True)
    release_date = Column(DateTime, nullable=True)
    
    is_open_weights = Column(Boolean, default=False, index=True)
    license = Column(String(100), default="Proprietary")
    context_window = Column(Integer, default=128000)
    parameter_count = Column(String(50), default="N/A")
    modalities = Column(String(100), default="Text, Code")
    
    benchmarks_json = Column(Text, default="{}")  # {"MMLU": 88.5, "Arena_Elo": 1335, "HumanEval": 92.0}
    pricing_input_per_m = Column(Float, nullable=True)
    pricing_output_per_m = Column(Float, nullable=True)
    
    overview = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    external_url = Column(String(1024), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
