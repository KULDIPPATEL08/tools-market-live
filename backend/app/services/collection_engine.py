import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.app.models.source import Source
from backend.app.models.job import CollectionJob
from backend.app.models.record import CollectedRecord
from backend.app.models.notification import Notification
from backend.app.services.deduplication import generate_fingerprint, calculate_quality_score, normalize_text
from backend.app.services.connectors.rss import fetch_rss_feed
from backend.app.services.connectors.github import fetch_github_repositories
from backend.app.services.connectors.hackernews import fetch_hn_stories
from backend.app.services.connectors.webpage import fetch_webpage
from backend.app.services.connectors.reddit import fetch_reddit_posts
from backend.app.services.connectors.huggingface import fetch_huggingface_trending_models, fetch_huggingface_daily_papers
from backend.app.services.connectors.tech_news import fetch_live_tech_news
from backend.app.services.fast_scraper import fast_batch_scrape

logger = logging.getLogger("scoutboard.collection")

async def run_collection_job(
    db: Session,
    source_id: int,
    trigger_type: str = "manual",
    custom_query: Optional[str] = None
) -> CollectionJob:
    """
    Executes the complete 12-stage collection lifecycle for a given Source.
    """
    # Stage 1: Job Creation
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise ValueError(f"Source with id {source_id} not found.")

    job = CollectionJob(
        source_id=source.id,
        status="running",
        trigger_type=trigger_type,
        started_at=datetime.utcnow()
    )
    db.add(job)
    source.status = "syncing"
    db.commit()
    db.refresh(job)

    try:
        # Stage 2: Source Validation
        if not source.url and source.type in ("rss", "webpage"):
            raise ValueError(f"Source '{source.name}' missing URL.")

        raw_items: List[Dict[str, Any]] = []

        # Stage 3 & 4: Retrieval & Parsing
        if source.type == "rss":
            raw_items = await fetch_rss_feed(source.url)
        elif source.type == "github":
            query = custom_query or "stars:>1000"
            if source.url and "github.com" in source.url:
                # Specific repo or org
                parts = source.url.rstrip("/").split("/")
                if len(parts) >= 2:
                    query = f"repo:{parts[-2]}/{parts[-1]}"
            elif source.config_json:
                try:
                    cfg = json.loads(source.config_json)
                    query = cfg.get("query", query)
                except Exception:
                    pass
            raw_items = await fetch_github_repositories(query=query)
        elif source.type == "hackernews":
            story_type = "topstories"
            if source.config_json:
                try:
                    cfg = json.loads(source.config_json)
                    story_type = cfg.get("story_type", "topstories")
                except Exception:
                    pass
            raw_items = await fetch_hn_stories(story_type=story_type)
        elif source.type == "reddit":
            sub = "LocalLLaMA"
            if source.url and "reddit.com/r/" in source.url:
                sub = source.url.split("/r/")[-1].strip("/").split("/")[0]
            elif source.config_json:
                try:
                    cfg = json.loads(source.config_json)
                    sub = cfg.get("subreddit", sub)
                except Exception:
                    pass
            raw_items = await fetch_reddit_posts(subreddit=sub)
        elif source.type == "huggingface":
            sub_type = "models"
            if source.config_json:
                try:
                    cfg = json.loads(source.config_json)
                    sub_type = cfg.get("type", "models")
                except Exception:
                    pass
            if sub_type == "papers" or (source.url and "papers" in source.url):
                raw_items = await fetch_huggingface_daily_papers(limit=20)
            else:
                raw_items = await fetch_huggingface_trending_models(limit=25)
        elif source.type == "technews":
            raw_items = await fetch_live_tech_news(limit_per_feed=6)
        elif source.type == "webpage":
            single_record = await fetch_webpage(source.url)
            raw_items = [single_record]
        else:
            raise ValueError(f"Unsupported source type: {source.type}")

        job.records_retrieved = len(raw_items)
        records_saved = 0
        duplicates_detected = 0

        # Stages 5 through 10: Processing items
        for raw in raw_items:
            # Stage 5: Normalization
            title = raw.get("title", "").strip()
            desc = raw.get("description", "").strip()
            url = raw.get("original_url", "").strip()
            content = raw.get("content", "")

            if not title or not url:
                continue

            # Stage 6: Duplicate Detection via Fingerprint
            fingerprint = generate_fingerprint(url, title, content)
            existing = db.query(CollectedRecord).filter(
                CollectedRecord.content_fingerprint == fingerprint
            ).first()

            if existing:
                duplicates_detected += 1
                continue

            # Stage 7: Metadata Enrichment & Quality Scoring
            quality = calculate_quality_score(raw)
            meta_json = json.dumps(raw.get("metadata", {}), ensure_ascii=False)

            # Stage 8: Validation
            record = CollectedRecord(
                source_id=source.id,
                source_name=source.name,
                source_type=source.type,
                title=title[:512],
                description=desc,
                content=content,
                original_url=url[:2048],
                author=raw.get("author", "")[:255] if raw.get("author") else "",
                published_at=raw.get("published_at"),
                collected_at=datetime.utcnow(),
                tags=raw.get("tags", "")[:512],
                category=source.category or raw.get("category", "General"),
                language=raw.get("language", "en"),
                content_fingerprint=fingerprint,
                quality_score=quality,
                relevance_score=round(quality * 10.0, 1),
                metadata_json=meta_json
            )

            # Stage 9: Database Storage
            db.add(record)
            records_saved += 1

        # Stage 11: Analytics & Source State Update
        source.status = "active"
        source.last_synced_at = datetime.utcnow()
        source.records_count = (source.records_count or 0) + records_saved
        source.error_message = None

        # Stage 12: Job Completion
        job.status = "completed"
        job.records_saved = records_saved
        job.duplicates_detected = duplicates_detected
        job.completed_at = datetime.utcnow()

        # Create system notification
        notif = Notification(
            type="job_completed",
            title=f"Collection Sync Finished: {source.name}",
            message=f"Retrieved {job.records_retrieved} items. Saved {records_saved} new records ({duplicates_detected} duplicates skipped).",
            link="/collection"
        )
        db.add(notif)
        db.commit()
        db.refresh(job)

    except Exception as e:
        logger.error(f"Error in collection job for source {source_id}: {e}", exc_info=True)
        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        source.status = "failed"
        source.error_message = str(e)
        
        # Create failure notification
        notif = Notification(
            type="job_failed",
            title=f"Collection Failed: {source.name}",
            message=str(e)[:300],
            link="/sources"
        )
        db.add(notif)
        db.commit()
        db.refresh(job)

    return job

async def fast_sync_all_active_sources(db: Session) -> Dict[str, Any]:
    """
    Rapid parallel sync across all active sources simultaneously.
    """
    import asyncio
    sources = db.query(Source).filter(Source.status == "active").all()
    if not sources:
        return {"status": "no_active_sources", "synced_count": 0, "results": []}

    tasks = [run_collection_job(db=db, source_id=s.id, trigger_type="fast_sync_all") for s in sources]
    completed_jobs = await asyncio.gather(*tasks, return_exceptions=True)

    summary = []
    total_saved = 0
    for idx, res in enumerate(completed_jobs):
        src = sources[idx]
        if isinstance(res, Exception):
            summary.append({"source": src.name, "status": "failed", "error": str(res)})
        else:
            total_saved += res.records_saved
            summary.append({
                "source": src.name,
                "status": res.status,
                "records_retrieved": res.records_retrieved,
                "records_saved": res.records_saved,
                "duplicates_skipped": res.duplicates_detected
            })

    pruned_count = prune_rolling_records(db, max_age_hours=48, max_total_records=1500)

    return {
        "status": "success",
        "synced_sources_count": len(sources),
        "total_new_records_saved": total_saved,
        "pruned_stale_records": pruned_count,
        "details": summary
    }

def prune_rolling_records(db: Session, max_age_hours: int = 48, max_total_records: int = 1500) -> int:
    """
    Dynamic Rolling Retention Policy:
    Preserves all pinned research evidence, while pruning stale records older than max_age_hours
    or beyond max_total_records to keep SQLite memory and disk footprint <15MB on free-tier containers.
    """
    from datetime import timedelta
    from backend.app.models.research import ResearchEvidence
    
    try:
        # 1. Protect all records saved as research evidence
        pinned_ids = [e.record_id for e in db.query(ResearchEvidence.record_id).all() if e.record_id]
        
        # 2. Prune records older than max_age_hours that are not pinned
        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        query = db.query(CollectedRecord).filter(
            CollectedRecord.collected_at < cutoff
        )
        if pinned_ids:
            query = query.filter(~CollectedRecord.id.in_(pinned_ids))
        deleted_count = query.delete(synchronize_session=False)

        # 3. If total records still exceed max_total_records, delete oldest unpinned records
        total_count = db.query(CollectedRecord).count()
        if total_count > max_total_records:
            excess = total_count - max_total_records
            oldest_records = (
                db.query(CollectedRecord.id)
                .filter(~CollectedRecord.id.in_(pinned_ids) if pinned_ids else True)
                .order_by(CollectedRecord.collected_at.asc())
                .limit(excess)
                .all()
            )
            oldest_ids = [r[0] for r in oldest_records]
            if oldest_ids:
                db.query(CollectedRecord).filter(CollectedRecord.id.in_(oldest_ids)).delete(synchronize_session=False)
                deleted_count += len(oldest_ids)

        db.commit()
        return deleted_count
    except Exception as e:
        logger.warning(f"Error during rolling record pruning: {e}")
        db.rollback()
        return 0



