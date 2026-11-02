from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.job import CollectionJob
from backend.app.schemas.all_schemas import CollectionJobResponse
from backend.app.services.collection_engine import run_collection_job

router = APIRouter(prefix="/collection", tags=["Collection Jobs"])

@router.get("/jobs", response_model=List[CollectionJobResponse])
def list_jobs(
    status: Optional[str] = None,
    source_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CollectionJob)
    if status:
        query = query.filter(CollectionJob.status == status)
    if source_id:
        query = query.filter(CollectionJob.source_id == source_id)
    return query.order_by(desc(CollectionJob.created_at)).limit(limit).all()

@router.get("/jobs/{job_id}", response_model=CollectionJobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(CollectionJob).filter(CollectionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Collection job not found")
    return job

@router.post("/jobs/{job_id}/retry", response_model=CollectionJobResponse)
async def retry_job(job_id: int, db: Session = Depends(get_db)):
    old_job = db.query(CollectionJob).filter(CollectionJob.id == job_id).first()
    if not old_job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_job = await run_collection_job(db=db, source_id=old_job.source_id, trigger_type="retry")
    return new_job
