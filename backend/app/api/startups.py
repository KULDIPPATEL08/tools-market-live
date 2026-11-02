from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.models.startup import Startup
from backend.app.services.startup_radar import seed_default_startups

router = APIRouter(prefix="/startups", tags=["Startup Radar"])

class StartupCreate(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    founding_year: Optional[int] = None
    stage: str = "Seed"
    funding_status: Optional[str] = "Bootstrapped"
    total_raised_usd: Optional[float] = None
    country: str = "Global"
    city: Optional[str] = None
    is_india: bool = False
    is_gujarat: bool = False
    industry: str = "AI / ML"
    founders: Optional[str] = None
    products: Optional[str] = None
    batch: Optional[str] = None
    opportunity_score: int = 80
    is_dead: bool = False
    dead_reason: Optional[str] = None
    gap_opportunity: Optional[str] = None

class StartupUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    stage: Optional[str] = None
    funding_status: Optional[str] = None
    total_raised_usd: Optional[float] = None
    country: Optional[str] = None
    city: Optional[str] = None
    is_india: Optional[bool] = None
    is_gujarat: Optional[bool] = None
    industry: Optional[str] = None
    founders: Optional[str] = None
    opportunity_score: Optional[int] = None
    is_dead: Optional[bool] = None
    dead_reason: Optional[str] = None
    gap_opportunity: Optional[str] = None

@router.get("")
def list_startups(
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    country: Optional[str] = None,
    is_india: Optional[bool] = None,
    is_gujarat: Optional[bool] = None,
    is_dead: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    # Ensure starter records exist
    seed_default_startups(db)

    query = db.query(Startup)

    if industry and industry != "All":
        query = query.filter(Startup.industry.ilike(f"%{industry}%"))
    if stage and stage != "All":
        query = query.filter(Startup.stage == stage)
    if country and country != "All":
        query = query.filter(Startup.country == country)
    if is_india is not None:
        query = query.filter(Startup.is_india == is_india)
    if is_gujarat is not None:
        query = query.filter(Startup.is_gujarat == is_gujarat)
    if is_dead is not None:
        query = query.filter(Startup.is_dead == is_dead)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Startup.name.ilike(term)) |
            (Startup.tagline.ilike(term)) |
            (Startup.description.ilike(term)) |
            (Startup.founders.ilike(term)) |
            (Startup.city.ilike(term))
        )

    total = query.count()
    startups = query.order_by(Startup.opportunity_score.desc(), Startup.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": s.id,
                "name": s.name,
                "tagline": s.tagline,
                "description": s.description,
                "website": s.website,
                "founding_year": s.founding_year,
                "stage": s.stage,
                "funding_status": s.funding_status,
                "total_raised_usd": s.total_raised_usd,
                "country": s.country,
                "city": s.city,
                "is_india": s.is_india,
                "is_gujarat": s.is_gujarat,
                "industry": s.industry,
                "founders": s.founders,
                "products": s.products,
                "batch": s.batch,
                "opportunity_score": s.opportunity_score,
                "is_dead": s.is_dead,
                "dead_reason": s.dead_reason,
                "gap_opportunity": s.gap_opportunity,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in startups
        ]
    }

@router.get("/metrics/overview")
def get_startup_metrics(db: Session = Depends(get_db)):
    seed_default_startups(db)

    total_startups = db.query(Startup).count()
    india_count = db.query(Startup).filter(Startup.is_india == True).count()
    gujarat_count = db.query(Startup).filter(Startup.is_gujarat == True).count()
    dead_count = db.query(Startup).filter(Startup.is_dead == True).count()
    active_count = total_startups - dead_count
    total_funding = db.query(func.sum(Startup.total_raised_usd)).scalar() or 0.0

    return {
        "total_startups": total_startups,
        "active_startups": active_count,
        "india_startups": india_count,
        "gujarat_startups": gujarat_count,
        "post_mortems": dead_count,
        "total_funding_tracked_usd": total_funding
    }

@router.get("/{startup_id}")
def get_startup(startup_id: int, db: Session = Depends(get_db)):
    s = db.query(Startup).filter(Startup.id == startup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Startup not found")
    return {
        "id": s.id,
        "name": s.name,
        "tagline": s.tagline,
        "description": s.description,
        "website": s.website,
        "founding_year": s.founding_year,
        "stage": s.stage,
        "funding_status": s.funding_status,
        "total_raised_usd": s.total_raised_usd,
        "country": s.country,
        "city": s.city,
        "is_india": s.is_india,
        "is_gujarat": s.is_gujarat,
        "industry": s.industry,
        "founders": s.founders,
        "products": s.products,
        "batch": s.batch,
        "opportunity_score": s.opportunity_score,
        "is_dead": s.is_dead,
        "dead_reason": s.dead_reason,
        "gap_opportunity": s.gap_opportunity,
        "created_at": s.created_at.isoformat() if s.created_at else None
    }

@router.post("")
def create_startup(payload: StartupCreate, db: Session = Depends(get_db)):
    new_startup = Startup(**payload.dict())
    db.add(new_startup)
    db.commit()
    db.refresh(new_startup)
    return {"message": "Startup profile created", "id": new_startup.id}

@router.put("/{startup_id}")
def update_startup(startup_id: int, payload: StartupUpdate, db: Session = Depends(get_db)):
    s = db.query(Startup).filter(Startup.id == startup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Startup not found")
    
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(s, k, v)
    
    db.commit()
    return {"message": "Startup profile updated", "id": s.id}

@router.delete("/{startup_id}")
def delete_startup(startup_id: int, db: Session = Depends(get_db)):
    s = db.query(Startup).filter(Startup.id == startup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Startup not found")
    db.delete(s)
    db.commit()
    return {"message": "Startup removed from radar"}
