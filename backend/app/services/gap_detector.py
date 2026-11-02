from datetime import datetime
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.record import CollectedRecord
from backend.app.models.gap import Gap
from backend.app.models.notification import Notification

QUESTION_PATTERNS = [
    r"how (can|do|should|to)\b",
    r"why (is|does|are|isn't)\b",
    r"what is the best way to\b",
    r"anyone know how to\b",
    r"alternative to\b",
    r"is there any tool for\b",
    r"problem with\b",
    r"benchmark for\b",
    r"limitations of\b",
]

def analyze_and_generate_gaps(db: Session) -> List[Gap]:
    """
    Analyzes collected records to detect intelligence gaps, unanswered developer questions,
    uncovered topics, and high-frequency problem areas.
    """
    records = db.query(CollectedRecord).order_by(CollectedRecord.collected_at.desc()).limit(200).all()
    if not records:
        return []

    identified_gaps = []

    # 1. Detect "Ask HN" and question patterns
    question_records = []
    for rec in records:
        combined = f"{rec.title} {rec.description}".lower()
        for pat in QUESTION_PATTERNS:
            if re.search(pat, combined):
                question_records.append(rec)
                break

    # Group by key recurring themes
    themes: Dict[str, List[CollectedRecord]] = {}
    for q in question_records:
        title_lower = q.title.lower()
        if "ai" in title_lower or "llm" in title_lower or "model" in title_lower:
            themes.setdefault("AI & LLM Workflows", []).append(q)
        elif "deploy" in title_lower or "docker" in title_lower or "cloud" in title_lower:
            themes.setdefault("Infrastructure & Deployment", []).append(q)
        elif "security" in title_lower or "auth" in title_lower or "leak" in title_lower:
            themes.setdefault("Security & Privacy", []).append(q)
        elif "database" in title_lower or "sql" in title_lower or "vector" in title_lower:
            themes.setdefault("Data Architecture", []).append(q)
        else:
            themes.setdefault("Developer Experience & Tooling", []).append(q)

    for theme_name, theme_recs in themes.items():
        if len(theme_recs) >= 1:
            sample_titles = [f"• {r.title}" for r in theme_recs[:3]]
            evidence_text = f"Identified across {len(theme_recs)} collected discussions:\n" + "\n".join(sample_titles)
            
            # Check if gap already exists
            existing = db.query(Gap).filter(Gap.title.ilike(f"%{theme_name}%")).first()
            if not existing:
                gap = Gap(
                    title=f"Unresolved Challenge in {theme_name}",
                    description=f"Multiple community queries and discussions indicate friction or unmet tooling needs in {theme_name}.",
                    category="Developer Need",
                    priority="high" if len(theme_recs) > 3 else "medium",
                    status="new",
                    evidence_summary=evidence_text,
                    suggested_actions=f"1. Conduct deep benchmark on top solutions.\n2. Synthesize comparison in a new Research Project.\n3. Track weekly changes in source coverage.",
                    related_tags=theme_name.replace(" & ", ", "),
                    created_at=datetime.utcnow()
                )
                db.add(gap)
                identified_gaps.append(gap)

    if identified_gaps:
        notif = Notification(
            type="gap_detected",
            title=f"Intelligence Gap Detected ({len(identified_gaps)} new)",
            message=f"Scoutboard identified recurring community challenges in: {', '.join([g.title for g in identified_gaps[:2]])}",
            link="/tools?tab=gap-board"
        )
        db.add(notif)
        db.commit()

    return identified_gaps
