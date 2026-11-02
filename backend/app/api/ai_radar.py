import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.models.ai_model import AIModelRecord
from backend.app.models.record import CollectedRecord
from backend.app.services.ai_radar_service import seed_default_ai_models

router = APIRouter(prefix="/ai-radar", tags=["AI Radar"])

class AIModelCreate(BaseModel):
    name: str
    organization: str
    is_open_weights: bool = False
    license: str = "Proprietary"
    context_window: int = 128000
    parameter_count: str = "N/A"
    modalities: str = "Text, Code"
    benchmarks_json: Optional[str] = "{}"
    pricing_input_per_m: Optional[float] = None
    pricing_output_per_m: Optional[float] = None
    overview: Optional[str] = None
    strengths: Optional[str] = None
    external_url: Optional[str] = None

@router.get("/models")
def get_ai_models(
    organization: Optional[str] = None,
    is_open_weights: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    seed_default_ai_models(db)
    query = db.query(AIModelRecord)

    if organization and organization != "All":
        query = query.filter(AIModelRecord.organization == organization)
    if is_open_weights is not None:
        query = query.filter(AIModelRecord.is_open_weights == is_open_weights)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (AIModelRecord.name.ilike(term)) |
            (AIModelRecord.organization.ilike(term)) |
            (AIModelRecord.overview.ilike(term))
        )

    models = query.order_by(AIModelRecord.release_date.desc()).all()
    
    result = []
    for m in models:
        bm = {}
        try:
            bm = json.loads(m.benchmarks_json or "{}")
        except Exception:
            pass

        result.append({
            "id": m.id,
            "name": m.name,
            "organization": m.organization,
            "release_date": m.release_date.isoformat() if m.release_date else None,
            "is_open_weights": m.is_open_weights,
            "license": m.license,
            "context_window": m.context_window,
            "parameter_count": m.parameter_count,
            "modalities": m.modalities,
            "benchmarks": bm,
            "pricing_input_per_m": m.pricing_input_per_m,
            "pricing_output_per_m": m.pricing_output_per_m,
            "overview": m.overview,
            "strengths": m.strengths,
            "external_url": m.external_url
        })
    return result

@router.get("/models/{model_id}")
def get_ai_model(model_id: int, db: Session = Depends(get_db)):
    m = db.query(AIModelRecord).filter(AIModelRecord.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="AI Model not found")
    bm = {}
    try:
        bm = json.loads(m.benchmarks_json or "{}")
    except Exception:
        pass
    return {
        "id": m.id,
        "name": m.name,
        "organization": m.organization,
        "release_date": m.release_date.isoformat() if m.release_date else None,
        "is_open_weights": m.is_open_weights,
        "license": m.license,
        "context_window": m.context_window,
        "parameter_count": m.parameter_count,
        "modalities": m.modalities,
        "benchmarks": bm,
        "pricing_input_per_m": m.pricing_input_per_m,
        "pricing_output_per_m": m.pricing_output_per_m,
        "overview": m.overview,
        "strengths": m.strengths,
        "external_url": m.external_url
    }

@router.get("/papers")
def get_ai_papers(limit: int = 25, db: Session = Depends(get_db)):
    """Retrieve indexed research papers from ArXiv and Hugging Face."""
    papers = db.query(CollectedRecord).filter(
        (CollectedRecord.category == "Research Papers") |
        (CollectedRecord.tags.ilike("%paper%")) |
        (CollectedRecord.tags.ilike("%arxiv%"))
    ).order_by(CollectedRecord.published_at.desc()).limit(limit).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "summary": p.description or p.content or "",
            "url": p.original_url,
            "authors": p.author or "ArXiv / HF Community",
            "published_at": p.published_at.isoformat() if p.published_at else None,
            "quality_score": p.quality_score,
            "tags": p.tags.split(",") if p.tags else []
        }
        for p in papers
    ]

@router.get("/benchmarks")
def get_benchmark_matrix(db: Session = Depends(get_db)):
    seed_default_ai_models(db)
    models = db.query(AIModelRecord).all()
    matrix = []
    for m in models:
        bm = {}
        try:
            bm = json.loads(m.benchmarks_json or "{}")
        except Exception:
            pass
        matrix.append({
            "name": m.name,
            "organization": m.organization,
            "is_open_weights": m.is_open_weights,
            "context_window": m.context_window,
            "mmlu": bm.get("MMLU", 0.0),
            "arena_elo": bm.get("Arena_Elo", 0),
            "humaneval": bm.get("HumanEval", 0.0),
            "math": bm.get("Math", 0.0),
            "license": m.license
        })
    matrix.sort(key=lambda x: x["arena_elo"], reverse=True)
    return matrix
