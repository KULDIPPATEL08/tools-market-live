from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.database import get_db
from backend.app.models.automation import AutomationRule
from backend.app.models.source import Source
from backend.app.schemas.all_schemas import AutomationRuleCreate, AutomationRuleResponse
from backend.app.services.collection_engine import run_collection_job
from backend.app.services.gap_detector import analyze_and_generate_gaps

router = APIRouter(prefix="/automation", tags=["Automation & Scheduler"])

@router.get("/rules", response_model=List[AutomationRuleResponse])
def list_rules(db: Session = Depends(get_db)):
    return db.query(AutomationRule).order_by(desc(AutomationRule.created_at)).all()

@router.post("/rules", response_model=AutomationRuleResponse)
def create_rule(rule_in: AutomationRuleCreate, db: Session = Depends(get_db)):
    rule = AutomationRule(
        name=rule_in.name,
        trigger_type=rule_in.trigger_type,
        schedule_interval_minutes=rule_in.schedule_interval_minutes or 60,
        action_type=rule_in.action_type,
        config_json=rule_in.config_json or "{}",
        is_active=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/rules/{rule_id}/run")
async def run_rule_now(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    result = {}
    if rule.action_type == "sync_sources":
        sources = db.query(Source).filter(Source.status == "active").all()
        synced = []
        for s in sources:
            try:
                job = await run_collection_job(db=db, source_id=s.id, trigger_type="automation")
                synced.append({"source": s.name, "saved": job.records_saved})
            except Exception as e:
                synced.append({"source": s.name, "error": str(e)})
        result["synced_sources"] = synced

    elif rule.action_type == "run_gap_detection":
        gaps = analyze_and_generate_gaps(db)
        result["gaps_detected"] = len(gaps)

    rule.last_run_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "executed_at": rule.last_run_at, "details": result}

@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Automation rule deleted"}

