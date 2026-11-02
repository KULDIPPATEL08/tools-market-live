from typing import List
from sqlalchemy.orm import Session
from backend.app.models.record import CollectedRecord
from backend.app.models.startup import Startup
from backend.app.models.gap import Gap
from backend.app.services.search.base import BaseSearchProvider, SearchResultItem

class LocalSearchProvider(BaseSearchProvider):
    """
    Local search provider indexing ingested records, startups, and intelligence gaps.
    Works fully offline and instantly without internet.
    """
    def __init__(self, db: Session):
        self.db = db

    async def search(self, query: str, mode: str = "quick", max_results: int = 10) -> List[SearchResultItem]:
        results: List[SearchResultItem] = []
        term = f"%{query}%"

        # Search Collected Records
        recs = self.db.query(CollectedRecord).filter(
            (CollectedRecord.title.ilike(term)) | 
            (CollectedRecord.description.ilike(term)) |
            (CollectedRecord.tags.ilike(term))
        ).order_by(CollectedRecord.collected_at.desc()).limit(max_results).all()

        for r in recs:
            results.append(SearchResultItem(
                title=r.title,
                url=r.original_url,
                snippet=r.description or r.content or "",
                source=f"Internal: {r.source_name or 'Scoutboard Ingest'}",
                published_date=r.published_at.strftime("%Y-%m-%d") if r.published_at else None,
                category=r.category,
                relevance_score=0.99,
                metadata={"record_id": r.id, "engine": "local_sqlite"}
            ))

        # Search Startups if mode is startup or all
        if mode in ("startup", "quick", "deep") and len(results) < max_results:
            startups = self.db.query(Startup).filter(
                (Startup.name.ilike(term)) | 
                (Startup.tagline.ilike(term)) |
                (Startup.industry.ilike(term))
            ).limit(max_results - len(results)).all()

            for s in startups:
                results.append(SearchResultItem(
                    title=f"{s.name} — {s.tagline or s.industry}",
                    url=s.website or "",
                    snippet=s.description or f"Stage: {s.stage} | Funding: {s.funding_status} | Location: {s.city}, {s.country}",
                    source=f"Startup Radar: {s.industry}",
                    category="Startup",
                    relevance_score=0.98,
                    metadata={"startup_id": s.id, "engine": "local_sqlite"}
                ))

        # Search Gaps
        if len(results) < max_results:
            gaps = self.db.query(Gap).filter(
                (Gap.title.ilike(term)) | (Gap.description.ilike(term))
            ).limit(max_results - len(results)).all()

            for g in gaps:
                results.append(SearchResultItem(
                    title=f"[Market Gap] {g.title}",
                    url="/gaps",
                    snippet=g.description or g.evidence_summary or "",
                    source="Scoutboard Opportunity Engine",
                    category="Market Gap",
                    relevance_score=0.95,
                    metadata={"gap_id": g.id, "engine": "local_sqlite"}
                ))

        return results
