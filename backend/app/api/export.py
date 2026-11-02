from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.record import CollectedRecord
from backend.app.models.research import ResearchProject
from backend.app.services.export_service import (
    export_records_to_csv,
    export_records_to_json,
    export_project_to_markdown,
)

router = APIRouter(prefix="/export", tags=["Export Center"])

@router.get("/records/csv")
def download_records_csv(
    category: Optional[str] = None,
    source_type: Optional[str] = None,
    is_saved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CollectedRecord)
    if category:
        query = query.filter(CollectedRecord.category == category)
    if source_type:
        query = query.filter(CollectedRecord.source_type == source_type)
    if is_saved is not None:
        query = query.filter(CollectedRecord.is_saved == is_saved)

    records = query.limit(500).all()
    csv_str = export_records_to_csv(records)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scoutboard_records.csv"}
    )

@router.get("/records/json")
def download_records_json(
    category: Optional[str] = None,
    source_type: Optional[str] = None,
    is_saved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CollectedRecord)
    if category:
        query = query.filter(CollectedRecord.category == category)
    if source_type:
        query = query.filter(CollectedRecord.source_type == source_type)
    if is_saved is not None:
        query = query.filter(CollectedRecord.is_saved == is_saved)

    records = query.limit(500).all()
    json_str = export_records_to_json(records)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=scoutboard_records.json"}
    )

@router.get("/projects/{project_id}/markdown")
def download_project_markdown(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Research project not found")

    md_str = export_project_to_markdown(proj)
    filename = f"research_{proj.id}_{proj.title[:20].lower().replace(' ', '_')}.md"
    return Response(
        content=md_str,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
