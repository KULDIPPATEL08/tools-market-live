from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.models.record import CollectedRecord
from backend.app.models.source import Source
from backend.app.models.job import CollectionJob
from backend.app.models.research import ResearchProject
from backend.app.models.gap import Gap
from backend.app.schemas.all_schemas import OverviewMetricsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & Health"])

@router.get("/overview", response_model=OverviewMetricsResponse)
def get_overview_metrics(db: Session = Depends(get_db)):
    total_records = db.query(CollectedRecord).count()
    active_sources = db.query(Source).filter(Source.status == "active").count()
    total_jobs = db.query(CollectionJob).count()
    saved_research = db.query(ResearchProject).count()
    
    completed_jobs = db.query(CollectionJob).filter(CollectionJob.status == "completed").count()
    success_rate = round((completed_jobs / total_jobs * 100), 1) if total_jobs > 0 else 100.0

    # Total duplicates recorded across jobs
    total_dupes = db.query(func.sum(CollectionJob.duplicates_detected)).scalar() or 0
    total_gaps = db.query(Gap).count()

    return OverviewMetricsResponse(
        total_records=total_records,
        active_sources=active_sources,
        total_jobs=total_jobs,
        saved_research=saved_research,
        collection_success_rate=success_rate,
        duplicate_count=int(total_dupes),
        gaps_count=total_gaps
    )

@router.get("/charts")
def get_charts_data(db: Session = Depends(get_db)):
    """
    Returns concrete data-backed timeseries and distributions for Recharts:
    1. Category distribution
    2. Source distribution
    3. Job status breakdown
    4. Quality distribution
    """
    # 1. Category distribution
    cats = (
        db.query(CollectedRecord.category, func.count(CollectedRecord.id))
        .group_by(CollectedRecord.category)
        .all()
    )
    category_data = [{"name": c[0] or "General", "value": c[1]} for c in cats]

    # 2. Source distribution
    sources = (
        db.query(Source.name, Source.records_count)
        .order_by(Source.records_count.desc())
        .limit(6)
        .all()
    )
    source_data = [{"name": s[0], "records": s[1] or 0} for s in sources]

    # 3. Job status breakdown
    job_statuses = (
        db.query(CollectionJob.status, func.count(CollectionJob.id))
        .group_by(CollectionJob.status)
        .all()
    )
    job_data = [{"status": j[0], "count": j[1]} for j in job_statuses]

    # 4. Quality score tiers
    high_q = db.query(CollectedRecord).filter(CollectedRecord.quality_score >= 0.7).count()
    med_q = db.query(CollectedRecord).filter(CollectedRecord.quality_score >= 0.4, CollectedRecord.quality_score < 0.7).count()
    low_q = db.query(CollectedRecord).filter(CollectedRecord.quality_score < 0.4).count()

    quality_data = [
        {"tier": "High Quality (0.7 - 1.0)", "count": high_q},
        {"tier": "Standard Quality (0.4 - 0.7)", "count": med_q},
        {"tier": "Basic Metadata (< 0.4)", "count": low_q},
    ]

    return {
        "category_distribution": category_data,
        "source_breakdown": source_data,
        "job_status_breakdown": job_data,
        "quality_distribution": quality_data
    }

