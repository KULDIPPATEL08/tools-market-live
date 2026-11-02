from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.job import CollectionJob
from backend.app.schemas.all_schemas import CollectionJobResponse, CollectedRecordResponse
from backend.app.models.record import CollectedRecord
from backend.app.services.collection_engine import run_collection_job, fast_sync_all_active_sources
from backend.app.services.fast_scraper import fast_batch_scrape
from backend.app.services.deduplication import generate_fingerprint, calculate_quality_score
import json
from datetime import datetime

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

@router.post("/fast-sync-all")
async def trigger_fast_sync_all(db: Session = Depends(get_db)):
    """
    Rapidly polls all active internet sources (Reddit, Hugging Face, Tech News, RSS, GitHub) concurrently.
    """
    res = await fast_sync_all_active_sources(db=db)
    return res

@router.get("/live-stream", response_model=List[CollectedRecordResponse])
def get_live_stream_records(limit: int = 25, db: Session = Depends(get_db)):
    """
    High-frequency endpoint for live second-by-second updates.
    Returns latest ingested records ordered by collection timestamp.
    """
    return db.query(CollectedRecord).order_by(desc(CollectedRecord.collected_at)).limit(limit).all()

@router.post("/scrape-batch")
async def scrape_batch_endpoint(urls: List[str], db: Session = Depends(get_db)):
    """
    Accepts arbitrary list of URLs to scrape concurrently in parallel and index.
    """
    if not urls:
        raise HTTPException(status_code=400, detail="URL list cannot be empty.")

    scraped_items = await fast_batch_scrape(urls=urls, max_concurrency=10)
    saved_count = 0
    duplicate_count = 0

    for item in scraped_items:
        fp = generate_fingerprint(item["original_url"], item["title"], item.get("content", ""))
        existing = db.query(CollectedRecord).filter(CollectedRecord.content_fingerprint == fp).first()
        if existing:
            duplicate_count += 1
            continue

        rec = CollectedRecord(
            title=item["title"][:512],
            description=item["description"],
            content=item["content"],
            original_url=item["original_url"],
            author=item["author"],
            published_at=item["published_at"],
            tags=item["tags"],
            category=item["category"],
            content_fingerprint=fp,
            quality_score=calculate_quality_score(item),
            metadata_json=json.dumps(item.get("metadata", {}))
        )
        db.add(rec)
        saved_count += 1

    db.commit()
    return {
        "status": "success",
        "scraped_count": len(scraped_items),
        "saved_count": saved_count,
        "duplicates_skipped": duplicate_count
    }


