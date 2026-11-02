from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.all_schemas import AskAssistantRequest, AssistantResponse
from backend.app.services.ai_service import ask_research_assistant

router = APIRouter(prefix="/ai", tags=["AI Research Assistant"])

@router.post("/ask", response_model=AssistantResponse)
async def ask_assistant(req: AskAssistantRequest, db: Session = Depends(get_db)):
    result = await ask_research_assistant(
        db=db,
        question=req.question,
        mode=req.mode or "collection_aware",
        context_record_ids=req.context_record_ids
    )
    return result
