from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.research import ResearchProject, ResearchNote, ResearchEvidence
from backend.app.models.record import CollectedRecord
from backend.app.schemas.all_schemas import (
    ResearchProjectCreate,
    ResearchProjectResponse,
    ResearchNoteCreate,
    ResearchNoteResponse,
    ResearchEvidenceCreate,
    ResearchEvidenceResponse,
)

router = APIRouter(prefix="/research", tags=["Research Workspace"])

@router.get("/projects", response_model=List[ResearchProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(ResearchProject).order_by(desc(ResearchProject.updated_at)).all()

@router.post("/projects", response_model=ResearchProjectResponse)
def create_project(project_in: ResearchProjectCreate, db: Session = Depends(get_db)):
    proj = ResearchProject(
        title=project_in.title,
        description=project_in.description,
        research_question=project_in.research_question,
        tags=project_in.tags or ""
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.get("/projects/{project_id}", response_model=ResearchProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Research project not found")
    return proj

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Research project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Research project deleted"}

@router.post("/projects/{project_id}/notes", response_model=ResearchNoteResponse)
def add_note_to_project(project_id: int, note_in: ResearchNoteCreate, db: Session = Depends(get_db)):
    proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Research project not found")

    note = ResearchNote(
        project_id=proj.id,
        title=note_in.title,
        content_markdown=note_in.content_markdown
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(ResearchNote).filter(ResearchNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}

@router.post("/projects/{project_id}/evidence", response_model=ResearchEvidenceResponse)
def attach_evidence_to_project(project_id: int, ev_in: ResearchEvidenceCreate, db: Session = Depends(get_db)):
    proj = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Research project not found")

    rec = db.query(CollectedRecord).filter(CollectedRecord.id == ev_in.record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Collected record not found")

    existing = db.query(ResearchEvidence).filter(
        ResearchEvidence.project_id == project_id,
        ResearchEvidence.record_id == ev_in.record_id
    ).first()
    if existing:
        return existing

    evidence = ResearchEvidence(
        project_id=proj.id,
        record_id=rec.id,
        notes=ev_in.notes
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence

@router.delete("/evidence/{evidence_id}")
def remove_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ev = db.query(ResearchEvidence).filter(ResearchEvidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    db.delete(ev)
    db.commit()
    return {"message": "Evidence removed from project"}

