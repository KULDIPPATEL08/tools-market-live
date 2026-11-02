import logging
from datetime import datetime
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.source import Source
from backend.app.models.record import CollectedRecord
from backend.app.models.research import ResearchProject, ResearchNote, ResearchEvidence
from backend.app.models.gap import Gap
from backend.app.models.automation import AutomationRule
from backend.app.models.notification import Notification
from backend.app.services.deduplication import generate_fingerprint

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scoutboard.init_db")

def init_database():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create Default Demo User
        demo_user = db.query(User).filter(User.email == "demo@scoutboard.local").first()
        if not demo_user:
            demo_user = User(
                email="demo@scoutboard.local",
                hashed_password=get_password_hash("scoutboard123"),
                full_name="Lead Intelligence Researcher",
                is_active=True,
                is_superuser=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            logger.info("Demo user created.")

        # 2. Seed Default Real Sources
        if db.query(Source).count() == 0:
            sources = [
                Source(
                    name="Hacker News Top Stories",
                    type="hackernews",
                    category="Community",
                    url="https://news.ycombinator.com",
                    description="Official Hacker News Firebase API for curated tech and startup discussions.",
                    fetch_interval_minutes=30,
                    status="active"
                ),
                Source(
                    name="ArXiv AI & Machine Learning",
                    type="rss",
                    category="Research Papers",
                    url="https://rss.arxiv.org/rss/cs.AI",
                    description="Fresh preprints and academic publications from ArXiv Computer Science / Artificial Intelligence.",
                    fetch_interval_minutes=120,
                    status="active"
                ),
                Source(
                    name="GitHub Trending AI & Systems",
                    type="github",
                    category="Open-Source",
                    url="https://github.com",
                    description="Public repositories with high star velocity and active commits across AI and developer tools.",
                    config_json='{"query": "topic:machine-learning stars:>5000"}',
                    fetch_interval_minutes=60,
                    status="active"
                ),
                Source(
                    name="Ars Technica Science & IT",
                    type="rss",
                    category="Technology",
                    url="https://feeds.arstechnica.com/arstechnica/index",
                    description="In-depth analysis of technology policy, enterprise architecture, and computing hardware.",
                    fetch_interval_minutes=60,
                    status="active"
                ),
            ]
            db.add_all(sources)
            db.commit()
            logger.info("Initial sources created.")

        # 3. Seed Starter Verified Records
        if db.query(CollectedRecord).count() == 0:
            source1 = db.query(Source).first()
            starter_records = [
                {
                    "title": "Local-First Software: You Own Your Data, in spite of the Cloud",
                    "description": "Exploration of CRDTs, offline capability, encryption, and local storage architectures that give users agency while retaining collaboration.",
                    "url": "https://www.inkandswitch.com/local-first/",
                    "author": "Ink & Switch Research",
                    "category": "Technology",
                    "tags": "LocalFirst, Architecture, CRDT, Privacy",
                    "quality_score": 0.95,
                    "relevance_score": 9.5
                },
                {
                    "title": "Attention Is All You Need — Foundational Architecture",
                    "description": "Seminal paper introducing the Transformer architecture based entirely on self-attention mechanisms, dispensing with recurrence and convolutions.",
                    "url": "https://arxiv.org/abs/1706.03762",
                    "author": "Vaswani et al.",
                    "category": "Research Papers",
                    "tags": "AI, Transformers, DeepLearning, NLP",
                    "quality_score": 0.98,
                    "relevance_score": 9.8
                },
                {
                    "title": "SQLite as an Application File Format",
                    "description": "Technical rationale for using SQLite as a robust, single-file desktop and embedded container format across operating systems.",
                    "url": "https://www.sqlite.org/appfileformat.html",
                    "author": "D. Richard Hipp",
                    "category": "Open-Source",
                    "tags": "SQLite, Database, Storage, Engineering",
                    "quality_score": 0.92,
                    "relevance_score": 9.2
                },
                {
                    "title": "Show HN: Modern Open Source Threat Intelligence Feed",
                    "description": "Aggregator of CVE feeds, security advisories, and malicious IP indicators normalized for instant developer consumption.",
                    "url": "https://news.ycombinator.com/item?id=3891024",
                    "author": "sec_analyst_01",
                    "category": "Community",
                    "tags": "Security, HackerNews, OpenSource",
                    "quality_score": 0.88,
                    "relevance_score": 8.8
                }
            ]

            records_to_insert = []
            for item in starter_records:
                fp = generate_fingerprint(item["url"], item["title"])
                rec = CollectedRecord(
                    source_id=source1.id if source1 else None,
                    source_name=source1.name if source1 else "Curated",
                    source_type=source1.type if source1 else "webpage",
                    title=item["title"],
                    description=item["description"],
                    content=item["description"],
                    original_url=item["url"],
                    author=item["author"],
                    published_at=datetime.utcnow(),
                    tags=item["tags"],
                    category=item["category"],
                    content_fingerprint=fp,
                    quality_score=item["quality_score"],
                    relevance_score=item["relevance_score"],
                    is_saved=True,
                    is_bookmarked=True
                )
                records_to_insert.append(rec)
            db.add_all(records_to_insert)
            db.commit()
            logger.info("Starter records seeded.")

        # 4. Seed Starter Research Project
        if db.query(ResearchProject).count() == 0:
            project = ResearchProject(
                user_id=demo_user.id,
                title="Next-Generation Autonomous Intelligence Platforms",
                description="Investigating how modern open-source intelligence collection engines reconcile rate limiting, SSRF security, and automated gap detection.",
                research_question="How can research teams monitor 100+ public sources without triggering rate-limits or leaking infrastructure metadata?",
                tags="Research, Intelligence, Architecture, Security"
            )
            db.add(project)
            db.commit()
            db.refresh(project)

            note1 = ResearchNote(
                project_id=project.id,
                title="SSRF Defensive Measures in Web Scrapers",
                content_markdown="""### SSRF Defensive Checklist
1. **Never resolve user URLs without DNS validation.** Check for RFC1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
2. **Block cloud metadata services:** Explicitly deny `169.254.169.254` and `metadata.google.internal`.
3. **Follow redirect limits:** Track redirects and re-validate IP address on every intermediate hop.
4. **Enforce response size ceilings:** Cut off downloads after 5MB to prevent memory exhaustion attacks.
"""
            )
            db.add(note1)

            first_rec = db.query(CollectedRecord).first()
            if first_rec:
                ev = ResearchEvidence(
                    project_id=project.id,
                    record_id=first_rec.id,
                    notes="Core reference paper for local-first architectural requirements."
                )
                db.add(ev)
            db.commit()
            logger.info("Starter research project seeded.")

        # 5. Seed Starter Intelligence Gaps
        if db.query(Gap).count() == 0:
            gaps = [
                Gap(
                    title="Fragmented Tooling for Self-Hosted Embeddings in Air-Gapped Environments",
                    description="Multiple teams report significant configuration friction when running vector search entirely disconnected from external cloud APIs.",
                    category="Infrastructure Gap",
                    priority="high",
                    status="investigating",
                    evidence_summary="Identified in developer forum threads and local AI deployment issues.",
                    suggested_actions="1. Benchmark Ollama + pgvector vs LanceDB.\n2. Create unified offline documentation dossier.\n3. Publish reproducible docker-compose recipe.",
                    related_tags="Embeddings, VectorDB, Privacy, Airgap"
                ),
                Gap(
                    title="Absence of Standardized Attribution Formats for Multi-Modal Datasets",
                    description="Researchers frequently cannot determine whether academic datasets permit derivative commercial fine-tuning without manual inspection.",
                    category="Licensing & Compliance",
                    priority="medium",
                    status="new",
                    evidence_summary="Synthesized across ArXiv paper disclosures and HuggingFace licensing discussions.",
                    suggested_actions="Catalog top 20 vision and text datasets with clear SPDX license identifiers.",
                    related_tags="Datasets, Compliance, OpenSource"
                )
            ]
            db.add_all(gaps)
            db.commit()

        # 6. Seed Starter Automation Rule
        if db.query(AutomationRule).count() == 0:
            rule = AutomationRule(
                name="Hourly Intelligence Ingestion & Gap Scan",
                trigger_type="interval",
                schedule_interval_minutes=60,
                action_type="sync_sources",
                config_json='{"auto_detect_gaps": true}',
                is_active=True
            )
            db.add(rule)
            db.commit()

        # 7. Seed Initial Welcome Notification
        if db.query(Notification).count() == 0:
            notif = Notification(
                type="system",
                title="Welcome to Scoutboard",
                message="Your intelligence workspace is initialized and ready. Sources and sample dossiers have been provisioned.",
                link="/overview"
            )
            db.add(notif)
            db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    init_database()
