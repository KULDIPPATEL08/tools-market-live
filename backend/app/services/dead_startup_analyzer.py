from datetime import datetime
import json
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.record import CollectedRecord
from backend.app.models.gap import Gap
from backend.app.models.notification import Notification

# Curated High-Impact Dead Startups & Product Post-Mortems
CURATED_DEAD_STARTUP_GAPS = [
    {
        "title": "Mint.com Shutdown: The Independent Privacy-First Personal Budgeting Vacuum",
        "dead_entity": "Mint (Intuit)",
        "sunset_year": 2024,
        "failure_reason": "Acquired by Intuit, eventually shuttered in favor of Credit Karma, degrading user experience to promote credit card loans and ads.",
        "unmet_need": "Millions of households lost their automated, clean net-worth and cashflow dashboard without being bombarded by aggressive financial upselling.",
        "opportunity_blueprint": "A local-first, privacy-respecting personal finance dashboard with direct bank sync (Plaid/Teller) or local CSV drag-drop, flat-rate $5/mo pricing, and zero data selling.",
        "opportunity_score": 95,
        "difficulty": "Medium",
        "category": "Dead Startup Gap",
        "priority": "critical",
        "moat": "Zero data selling, open sync protocol, local SQLite encryption",
        "suggested_actions": "1. Build lightweight local-first cashflow tracker.\n2. Support standard bank CSV imports + automated categorization.\n3. Market on r/personalfinance and Hacker News.",
        "related_tags": "Fintech, Personal Finance, Privacy, Local-First, Mint Alternative"
    },
    {
        "title": "Sunrise Calendar Sunset: Clean Multi-Calendar & Project Scheduler Void",
        "dead_entity": "Sunrise Calendar",
        "sunset_year": 2016,
        "failure_reason": "Acquired by Microsoft, cannibalized into Outlook mobile, stripping away third-party integrations and lightweight design.",
        "unmet_need": "A joyful, lightning-fast calendar that seamlessly combines Google Calendar, Outlook, Asana, GitHub milestones, and personal to-dos.",
        "opportunity_blueprint": "A modern desktop & mobile calendar with keyboard shortcuts, bidirectional GitHub PR / Linear issue syncing, and zero-latency time blocking.",
        "opportunity_score": 89,
        "difficulty": "Medium",
        "category": "Dead Startup Gap",
        "priority": "high",
        "moat": "Developer-centric integrations (GitHub/Linear/Slack) and keyboard-first UI",
        "suggested_actions": "1. Prototype 60FPS keyboard-first calendar interface.\n2. Add GitHub and Google Calendar bidirectional webhooks.\n3. Target developer & technical PM niches.",
        "related_tags": "Productivity, Calendar, Developer Tools, Scheduling, Workflows"
    },
    {
        "title": "Artifact News Reader: Niche Vertical Intelligence vs Broad Consumer Trap",
        "dead_entity": "Artifact (by Instagram co-founders)",
        "sunset_year": 2024,
        "failure_reason": "Consumer news aggregators face steep user acquisition costs and insufficient engagement without sensationalism; shut down despite stellar AI summarization tech.",
        "unmet_need": "Founders, investors, and researchers need focused, high-signal vertical intelligence readers that rewrite clickbait and filter out corporate fluff.",
        "opportunity_blueprint": "Pivot from generic consumer news to high-ticket B2B intelligence reader for specific verticals (e.g. AI hardware, Biotech, Cybersecurity) with Slack/Discord export.",
        "opportunity_score": 92,
        "difficulty": "Low",
        "category": "Dead Startup Gap",
        "priority": "critical",
        "moat": "Proprietary high-signal filtering and team collaboration dossiers",
        "suggested_actions": "1. Target specific high-budget niches (e.g., Hedge Funds, AI researchers).\n2. Deliver daily actionable briefings via API and email.\n3. Monetize via team enterprise seats.",
        "related_tags": "AI Intelligence, News Reader, LLM Summarization, Vertical B2B"
    },
    {
        "title": "Skiff Workspace: The Sovereign End-to-End Encrypted Knowledge Base Vacuum",
        "dead_entity": "Skiff (Acquired & Killed by Notion)",
        "sunset_year": 2024,
        "failure_reason": "Acquired by Notion to absorb talent and proprietary tech; gave users a 6-month forced migration window, infuriating privacy communities.",
        "unmet_need": "Lawyers, healthcare professionals, investigative journalists, and privacy-conscious teams require end-to-end encrypted collaborative docs, email, and drive.",
        "opportunity_blueprint": "An open-source or self-hostable zero-knowledge team workspace with cryptographic access controls, markdown editing, and offline-first peer sync.",
        "opportunity_score": 96,
        "difficulty": "High",
        "category": "Dead Startup Gap",
        "priority": "critical",
        "moat": "Open-source zero-knowledge cryptography and self-hosting assurance",
        "suggested_actions": "1. Fork or build on Automerge/Yjs CRDTs with libsodium encryption.\n2. Target privacy-critical verticals (Legal, Healthcare, Crypto).\n3. Offer single-click Docker/Cloud deployment.",
        "related_tags": "Security, E2EE, Privacy, Notion Alternative, Knowledge Base"
    },
    {
        "title": "Pebble Smartwatch: The Distraction-Free Long-Battery Companion Void",
        "dead_entity": "Pebble",
        "sunset_year": 2016,
        "failure_reason": "Overextended hardware manufacturing inventory cycles and venture debt; acquired by Fitbit.",
        "unmet_need": "Users desire a 7-10 day battery life, always-on reflective screen, distraction-free notification and health device that doesn't demand attention like an Apple Watch.",
        "opportunity_blueprint": "A lean, open-spec e-ink wearable or desk companion with an open Python/Lua API and zero subscriptions.",
        "opportunity_score": 83,
        "difficulty": "High",
        "category": "Dead Startup Gap",
        "priority": "medium",
        "moat": "Open hacker ecosystem, 10-day battery, e-ink readability",
        "suggested_actions": "1. Build low-cost prototype using Nordic nRF52 and Sharp Memory LCD.\n2. Release open-source companion app for Android/iOS.\n3. Launch via crowdfunding with pre-orders.",
        "related_tags": "Hardware, E-Ink, Wearables, Open Source, Distraction-Free"
    },
    {
        "title": "Google Reader / RSS Aggregator: Modern AI-Augmented Research Synthesis",
        "dead_entity": "Google Reader",
        "sunset_year": 2013,
        "failure_reason": "Killed by Google due to lack of monetization, sparking perpetual user nostalgia and fragmented RSS tools.",
        "unmet_need": "Information overload makes reading raw RSS feeds tedious; users need an intelligent ingestion engine that deduplicates, clusters, and detects emerging trends.",
        "opportunity_blueprint": "An automated feed aggregator that clusters related stories into single topic threads, tags sentiment, and generates audio podcast summaries.",
        "opportunity_score": 90,
        "difficulty": "Low",
        "category": "Dead Startup Gap",
        "priority": "high",
        "moat": "Algorithmic topic deduplication and multi-modal audio summaries",
        "suggested_actions": "1. Implement multi-source clustering for news feeds.\n2. Add on-demand TTS audio briefing generation.\n3. Package as Scoutboard intelligence extension.",
        "related_tags": "RSS, Aggregator, Topic Clustering, Information Extraction"
    }
]

def analyze_dead_startup_gaps(db: Session) -> List[Gap]:
    """
    Scans for dead startup post-mortems and market voids.
    Identifies high-value opportunities left behind by acquired, sunsetted, or failed products.
    """
    created_gaps = []

    for item in CURATED_DEAD_STARTUP_GAPS:
        existing = db.query(Gap).filter(Gap.title == item["title"]).first()
        if not existing:
            evidence = (
                f"DEAD ENTITY: {item['dead_entity']} (Sunset {item['sunset_year']})\n"
                f"WHY IT FAILED: {item['failure_reason']}\n"
                f"UNMET MARKET NEED: {item['unmet_need']}\n"
                f"COMPETITIVE MOAT: {item['moat']}\n"
                f"OPPORTUNITY SCORE: {item['opportunity_score']}/100 | DIFFICULTY: {item['difficulty']}\n"
                f"REBOOT BLUEPRINT: {item['opportunity_blueprint']}"
            )
            gap = Gap(
                title=item["title"],
                description=f"Market void created by the collapse/sunset of {item['dead_entity']}: {item['unmet_need']}",
                category=item["category"],
                priority=item["priority"],
                status="new",
                evidence_summary=evidence,
                suggested_actions=item["suggested_actions"],
                related_tags=item["related_tags"],
                created_at=datetime.utcnow()
            )
            db.add(gap)
            created_gaps.append(gap)

    # Also scan collected records for recent post-mortem discussions
    post_mortem_records = db.query(CollectedRecord).filter(
        (CollectedRecord.title.ilike("%post-mortem%") |
         CollectedRecord.title.ilike("%postmortem%") |
         CollectedRecord.title.ilike("%shutting down%") |
         CollectedRecord.title.ilike("%sunset%") |
         CollectedRecord.title.ilike("%why we failed%") |
         CollectedRecord.title.ilike("%killed by%"))
    ).limit(10).all()

    for rec in post_mortem_records:
        clean_title = re.sub(r"[^\w\s-]", "", rec.title).strip()
        gap_title = f"Post-Mortem Analysis: {clean_title[:80]}"
        existing = db.query(Gap).filter(Gap.title.ilike(f"%{clean_title[:40]}%")).first()
        if not existing:
            gap = Gap(
                title=gap_title,
                description=f"Opportunity derived from recent community discussion on sunset or project failure: {rec.title}",
                category="Dead Startup Gap",
                priority="high",
                status="new",
                evidence_summary=f"Source: {rec.original_url}\nPublished: {rec.published_at}\n\nSummary:\n{rec.description}\n\n{rec.content[:500]}...",
                suggested_actions="1. Map the underlying customer segment.\n2. Identify unit economics or distribution flaws.\n3. Prototype a lean, focused alternative.",
                related_tags=f"Post-Mortem, Market Void, {rec.tags}",
                created_at=datetime.utcnow()
            )
            db.add(gap)
            created_gaps.append(gap)

    if created_gaps:
        notif = Notification(
            type="gap_detected",
            title=f"Dead Startup Gaps Uncovered ({len(created_gaps)} new)",
            message=f"Scoutboard identified high-confidence market opportunities from failed or discontinued products: {created_gaps[0].title[:60]}...",
            link="/gaps?category=Dead%20Startup%20Gap"
        )
        db.add(notif)
        db.commit()

    return created_gaps
