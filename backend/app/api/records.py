from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from backend.app.core.database import get_db
from backend.app.models.record import CollectedRecord
from backend.app.schemas.all_schemas import CollectedRecordResponse

router = APIRouter(prefix="/records", tags=["Records & Discovery"])

@router.get("", response_model=List[CollectedRecordResponse])
def list_records(
    q: Optional[str] = None,
    category: Optional[str] = None,
    source_type: Optional[str] = None,
    source_id: Optional[int] = None,
    is_saved: Optional[bool] = None,
    is_bookmarked: Optional[bool] = None,
    sort_by: str = Query("recent"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(CollectedRecord)

    if q:
        query = query.filter(
            or_(
                CollectedRecord.title.ilike(f"%{q}%"),
                CollectedRecord.description.ilike(f"%{q}%"),
                CollectedRecord.tags.ilike(f"%{q}%"),
                CollectedRecord.author.ilike(f"%{q}%")
            )
        )

    if category:
        query = query.filter(CollectedRecord.category == category)
    if source_type:
        query = query.filter(CollectedRecord.source_type == source_type)
    if source_id:
        query = query.filter(CollectedRecord.source_id == source_id)
    if is_saved is not None:
        query = query.filter(CollectedRecord.is_saved == is_saved)
    if is_bookmarked is not None:
        query = query.filter(CollectedRecord.is_bookmarked == is_bookmarked)

    if sort_by == "recent":
        query = query.order_by(desc(CollectedRecord.collected_at))
    elif sort_by == "quality":
        query = query.order_by(desc(CollectedRecord.quality_score), desc(CollectedRecord.collected_at))
    elif sort_by == "relevance":
        query = query.order_by(desc(CollectedRecord.relevance_score), desc(CollectedRecord.collected_at))
    elif sort_by == "oldest":
        query = query.order_by(asc(CollectedRecord.collected_at))

    return query.offset(offset).limit(limit).all()

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """Returns unique categories and counts."""
    records = db.query(CollectedRecord.category).all()
    counts = {}
    for r in records:
        cat = r[0] or "General"
        counts[cat] = counts.get(cat, 0) + 1
    return [{"category": k, "count": v} for k, v in counts.items()]

@router.get("/{record_id}", response_model=CollectedRecordResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(CollectedRecord).filter(CollectedRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    return rec

@router.post("/{record_id}/toggle-save")
def toggle_save_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(CollectedRecord).filter(CollectedRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    rec.is_saved = not rec.is_saved
    db.commit()
    return {"id": rec.id, "is_saved": rec.is_saved}

@router.post("/{record_id}/toggle-bookmark")
def toggle_bookmark_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(CollectedRecord).filter(CollectedRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    rec.is_bookmarked = not rec.is_bookmarked
    db.commit()
    return {"id": rec.id, "is_bookmarked": rec.is_bookmarked}

@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(CollectedRecord).filter(CollectedRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(rec)
    db.commit()
    return {"message": "Record deleted"}
