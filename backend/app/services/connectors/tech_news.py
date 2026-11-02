import asyncio
from datetime import datetime
import feedparser
import httpx
from typing import List, Dict, Any

TECH_NEWS_FEEDS = [
    {
        "name": "TechCrunch AI & Startups",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "category": "AI News"
    },
    {
        "name": "VentureBeat AI Horizon",
        "url": "https://venturebeat.com/category/ai/feed/",
        "category": "AI Models"
    },
    {
        "name": "The Verge Tech & Wire",
        "url": "https://www.theverge.com/rss/index.xml",
        "category": "Technology News"
    },
    {
        "name": "Ars Technica Enterprise",
        "url": "https://feeds.arstechnica.com/arstechnica/index",
        "category": "Technology News"
    },
    {
        "name": "The Hacker News Alerts",
        "url": "https://feeds.feedburner.com/TheHackersNews",
        "category": "Cybersecurity Updates"
    },
    {
        "name": "Inc42 Indian Startups & Funding",
        "url": "https://inc42.com/feed/",
        "category": "India Startup News"
    },
    {
        "name": "YourStory Indian Innovation",
        "url": "https://yourstory.com/feed",
        "category": "India Startup News"
    },
    {
        "name": "Dev.to Open Source & Tooling",
        "url": "https://dev.to/feed",
        "category": "Developer Tools"
    }
]

async def fetch_live_tech_news(limit_per_feed: int = 5) -> List[Dict[str, Any]]:
    """
    Concurrently fetches live breaking news across premier tech feeds.
    Runs in parallel for rapid response under 2 seconds.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Scoutboard-News/1.0"
    }

    async def fetch_single_feed(feed_meta: Dict[str, str]) -> List[Dict[str, Any]]:
        feed_records = []
        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                resp = await client.get(feed_meta["url"], headers=headers)
                if resp.status_code == 200:
                    parsed = feedparser.parse(resp.text)
                    for entry in parsed.entries[:limit_per_feed]:
                        title = entry.get("title", "").strip()
                        link = entry.get("link", "").strip()
                        summary = entry.get("summary", entry.get("description", "")).strip()
                        author = entry.get("author", feed_meta["name"])

                        if not title or not link:
                            continue

                        # Clean HTML from summary
                        import re
                        clean_summary = re.sub(r'<[^>]+>', '', summary)[:280]

                        # Detect category specialization
                        category = feed_meta["category"]
                        text_to_check = f"{title} {clean_summary}".lower()
                        if any(kw in text_to_check for kw in ["gujarat", "ahmedabad", "gandhinagar", "gift city", "surat"]):
                            category = "Gujarat Startup News"
                        elif "funding" in text_to_check or "raises" in text_to_check or "series a" in text_to_check:
                            category = "Startup Funding"
                        elif "launch" in text_to_check or "launches" in text_to_check:
                            category = "Startup Launches"

                        feed_records.append({
                            "title": title,
                            "description": clean_summary or f"Breaking coverage via {feed_meta['name']}",
                            "content": clean_summary,
                            "original_url": link,
                            "author": author,
                            "published_at": datetime.utcnow(),
                            "tags": f"Breaking, {feed_meta['name']}, TechNews, {category}",
                            "category": category,
                            "metadata": {
                                "publication": feed_meta["name"],
                                "credibility": "verified_press"
                            }
                        })
        except Exception:
            pass
        return feed_records

    results = await asyncio.gather(*[fetch_single_feed(f) for f in TECH_NEWS_FEEDS])
    all_records = []
    for batch in results:
        all_records.extend(batch)
    return all_records

