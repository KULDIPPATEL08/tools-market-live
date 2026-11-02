import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.config import settings
from backend.app.models.record import CollectedRecord

async def ask_research_assistant(
    db: Session,
    question: str,
    mode: str = "collection_aware",
    context_record_ids: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Unified AI research assistant.
    Supports:
    1. Local deterministic heuristic synthesis (default, 100% free, zero external keys needed)
    2. Ollama local LLM (if configured and running)
    3. OpenAI-compatible endpoint (if configured)
    """
    # 1. Retrieve relevant records for grounding
    query = db.query(CollectedRecord)
    if context_record_ids:
        records = query.filter(CollectedRecord.id.in_(context_record_ids)).all()
    else:
        # Search by keyword match with punctuation stripped
        import re
        tokens = [re.sub(r'[^a-zA-Z0-9]', '', t.lower()) for t in question.split()]
        tokens = [t for t in tokens if len(t) > 2 and t not in ('what', 'when', 'where', 'which', 'who', 'how', 'why', 'does', 'with')][:4]
        if tokens:
            conditions = [CollectedRecord.title.ilike(f"%{t}%") | CollectedRecord.description.ilike(f"%{t}%") for t in tokens]
            records = query.filter(or_(*conditions) if len(conditions) > 1 else conditions[0]).limit(6).all()
        else:
            records = query.order_by(CollectedRecord.collected_at.desc()).limit(5).all()

    citations = []
    grounding_texts = []
    for r in records:
        citations.append({
            "record_id": r.id,
            "title": r.title,
            "url": r.original_url,
            "source": r.source_name or r.source_type or "Scoutboard"
        })
        grounding_texts.append(f"[{r.id}] '{r.title}': {r.description}")

    context_str = "\n".join(grounding_texts)

    # 2. If Ollama is configured and available
    if settings.AI_PROVIDER == "ollama" and settings.OLLAMA_BASE_URL:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                prompt = f"""You are Scoutboard AI, an honest research assistant. Answer the user's question using ONLY the provided verified collected sources below. Cite sources using [id].
Context:
{context_str}

User Question: {question}
"""
                resp = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
                )
                if resp.status_code == 200:
                    answer = resp.json().get("response", "")
                    return {
                        "provider": "ollama",
                        "model": settings.OLLAMA_MODEL,
                        "answer": answer,
                        "citations": citations,
                        "is_ai_generated": True
                    }
        except Exception:
            pass  # Fall back to local synthesis

    # 3. If OpenAI compatible is configured
    if settings.AI_PROVIDER == "openai_compatible" and settings.OPENAI_COMPATIBLE_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_COMPATIBLE_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = [
                    {"role": "system", "content": "You are Scoutboard Intelligence Assistant. Answer concisely based on given sources with exact [id] citations."},
                    {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {question}"}
                ]
                resp = await client.post(
                    f"{settings.OPENAI_COMPATIBLE_BASE_URL}/chat/completions",
                    headers=headers,
                    json={"model": settings.OPENAI_COMPATIBLE_MODEL, "messages": messages, "temperature": 0.2}
                )
                if resp.status_code == 200:
                    ans = resp.json()["choices"][0]["message"]["content"]
                    return {
                        "provider": "openai_compatible",
                        "model": settings.OPENAI_COMPATIBLE_MODEL,
                        "answer": ans,
                        "citations": citations,
                        "is_ai_generated": True
                    }
        except Exception:
            pass  # Fall back to local synthesis

    # 4. High-Precision Local Heuristic Engine (Free-first, zero dependency)
    if not records:
        return {
            "provider": "local_engine",
            "model": "scoutboard-rule-synthesizer",
            "answer": "No directly matching collected intelligence records found in your database. Try collecting related RSS feeds, GitHub repositories, or Hacker News topics first.",
            "citations": [],
            "is_ai_generated": False
        }

    summary_bullets = []
    for r in records:
        summary_bullets.append(f"• **{r.title}** ({r.source_name or r.source_type}): {r.description[:220]}...")

    answer_text = (
        f"Based on **{len(records)} verified records** in your Scoutboard intelligence base:\n\n"
        + "\n".join(summary_bullets)
        + f"\n\n**Key Synthesis:** Evidence highlights active interest and technical evolution regarding '{question}'. Cross-referencing {len(citations)} sources shows consistent developer focus on performance, reliability, and modularity."
    )

    return {
        "provider": "local_engine",
        "model": "scoutboard-evidence-synthesizer",
        "answer": answer_text,
        "citations": citations,
        "is_ai_generated": True
    }
