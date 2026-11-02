from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.services.search.orchestrator import SearchOrchestrator
from backend.app.services.search.base import SearchResponse
from backend.app.models.search_history import SearchQueryLog
from backend.app.models.research import ResearchEvidence, ResearchProject

router = APIRouter(prefix="/search", tags=["Universal Web Search"])

class SearchRequest(BaseModel):
    query: str
    mode: str = "quick"  # quick, deep, startup, ai, market, technology
    provider: Optional[str] = None  # auto, duckduckgo, brave, tavily, local
    max_results: int = 10

class SaveSearchResultRequest(BaseModel):
    project_id: int
    title: str
    url: str
    snippet: str
    source: str
    notes: Optional[str] = ""

@router.post("", response_model=SearchResponse)
async def perform_search(payload: SearchRequest, db: Session = Depends(get_db)):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    orchestrator = SearchOrchestrator(db)
    return await orchestrator.execute_search(
        query=payload.query.strip(),
        mode=payload.mode,
        provider_name=payload.provider,
        max_results=payload.max_results
    )

@router.get("/history")
def get_search_history(limit: int = 20, db: Session = Depends(get_db)):
    history = db.query(SearchQueryLog).order_by(SearchQueryLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": h.id,
            "query": h.query,
            "mode": h.mode,
            "provider": h.provider,
            "results_count": h.results_count,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in history
    ]

@router.delete("/history")
def clear_search_history(db: Session = Depends(get_db)):
    db.query(SearchQueryLog).delete()
    db.commit()
    return {"message": "Search history cleared successfully"}

@router.post("/save-to-research")
def save_search_result_to_research(payload: SaveSearchResultRequest, db: Session = Depends(get_db)):
    project = db.query(ResearchProject).filter(ResearchProject.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found")

    evidence = ResearchEvidence(
        project_id=payload.project_id,
        notes=f"Citation: {payload.title}\nSource: {payload.source}\nURL: {payload.url}\n\n{payload.snippet}\n\nNotes: {payload.notes or ''}"
    )
    db.add(evidence)
    db.commit()
    return {"status": "saved", "evidence_id": evidence.id}
