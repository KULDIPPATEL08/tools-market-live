from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.gap import Gap
from backend.app.schemas.all_schemas import GapCreate, GapUpdate, GapResponse
from backend.app.services.gap_detector import analyze_and_generate_gaps

router = APIRouter(prefix="/gaps", tags=["Intelligence Gap Detection"])

@router.get("", response_model=List[GapResponse])
def list_gaps(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Gap)
    if status:
        query = query.filter(Gap.status == status)
    if priority:
        query = query.filter(Gap.priority == priority)
    return query.order_by(desc(Gap.created_at)).all()

@router.post("/detect", response_model=List[GapResponse])
def detect_gaps_now(db: Session = Depends(get_db)):
    """Runs automated rule-based analysis on collected records to identify intelligence gaps."""
    new_gaps = analyze_and_generate_gaps(db)
    return db.query(Gap).order_by(desc(Gap.created_at)).all()

@router.post("", response_model=GapResponse)
def create_gap(gap_in: GapCreate, db: Session = Depends(get_db)):
    gap = Gap(
        title=gap_in.title,
        description=gap_in.description,
        category=gap_in.category or "Research Gap",
        priority=gap_in.priority or "medium",
        status="new",
        evidence_summary=gap_in.evidence_summary,
        suggested_actions=gap_in.suggested_actions,
        related_tags=gap_in.related_tags or ""
    )
    db.add(gap)
    db.commit()
    db.refresh(gap)
    return gap

@router.patch("/{gap_id}", response_model=GapResponse)
def update_gap(gap_id: int, gap_in: GapUpdate, db: Session = Depends(get_db)):
    gap = db.query(Gap).filter(Gap.id == gap_id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Gap not found")

    for field, val in gap_in.dict(exclude_unset=True).items():
        setattr(gap, field, val)

    db.commit()
    db.refresh(gap)
    return gap

@router.delete("/{gap_id}")
def delete_gap(gap_id: int, db: Session = Depends(get_db)):
    gap = db.query(Gap).filter(Gap.id == gap_id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Gap not found")
    db.delete(gap)
    db.commit()
    return {"message": "Gap deleted"}

