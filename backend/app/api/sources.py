from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.source import Source
from backend.app.models.job import CollectionJob
from backend.app.schemas.all_schemas import SourceCreate, SourceUpdate, SourceResponse, CollectionJobResponse
from backend.app.services.collection_engine import run_collection_job
from backend.app.core.ssrf import is_safe_url

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.get("", response_model=List[SourceResponse])
def list_sources(
    q: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Source)
    if q:
        query = query.filter(Source.name.ilike(f"%{q}%") | Source.description.ilike(f"%{q}%"))
    if type:
        query = query.filter(Source.type == type)
    if status:
        query = query.filter(Source.status == status)
    return query.order_by(desc(Source.created_at)).all()

@router.post("", response_model=SourceResponse)
def create_source(source_in: SourceCreate, db: Session = Depends(get_db)):
    if source_in.url and source_in.type in ("rss", "webpage"):
        is_safe, error = is_safe_url(source_in.url)
        if not is_safe:
            raise HTTPException(status_code=400, detail=f"URL Security check failed: {error}")

    source = Source(
        name=source_in.name,
        type=source_in.type,
        url=source_in.url,
        description=source_in.description,
        category=source_in.category or "Technology",
        fetch_interval_minutes=source_in.fetch_interval_minutes or 60,
        config_json=source_in.config_json or "{}",
        status="active"
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source

@router.get("/{source_id}", response_model=SourceResponse)
def get_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source

@router.put("/{source_id}", response_model=SourceResponse)
def update_source(source_id: int, source_in: SourceUpdate, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    update_data = source_in.dict(exclude_unset=True)
    if "url" in update_data and update_data["url"] and source.type in ("rss", "webpage"):
        is_safe, error = is_safe_url(update_data["url"])
        if not is_safe:
            raise HTTPException(status_code=400, detail=f"URL Security check failed: {error}")

    for field, value in update_data.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)
    return source

@router.delete("/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(source)
    db.commit()
    return {"message": f"Source '{source.name}' deleted successfully"}

@router.post("/{source_id}/sync", response_model=CollectionJobResponse)
async def sync_source_now(source_id: int, db: Session = Depends(get_db)):
    """Triggers an immediate collection job for this source."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    job = await run_collection_job(db=db, source_id=source_id, trigger_type="manual")
    return job

@router.get("/{source_id}/jobs", response_model=List[CollectionJobResponse])
def get_source_jobs(source_id: int, limit: int = 10, db: Session = Depends(get_db)):
    jobs = db.query(CollectionJob).filter(CollectionJob.source_id == source_id).order_by(desc(CollectionJob.created_at)).limit(limit).all()
    return jobs

