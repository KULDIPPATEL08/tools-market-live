import asyncio
from datetime import datetime
import feedparser
import httpx
from typing import List, Dict, Any

TECH_NEWS_FEEDS = [
    {
        "name": "TechCrunch AI & Startups",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "category": "Tech News & Startups"
    },
    {
        "name": "The Verge Tech",
        "url": "https://www.theverge.com/rss/index.xml",
        "category": "Tech News & Startups"
    },
    {
        "name": "Ars Technica",
        "url": "https://feeds.arstechnica.com/arstechnica/index",
        "category": "Technology"
    },
    {
        "name": "Dev.to Top Tech",
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

                        feed_records.append({
                            "title": title,
                            "description": clean_summary or f"Breaking coverage via {feed_meta['name']}",
                            "content": clean_summary,
                            "original_url": link,
                            "author": author,
                            "published_at": datetime.utcnow(),
                            "tags": f"Breaking, {feed_meta['name']}, TechNews",
                            "category": feed_meta["category"],
                            "metadata": {
                                "publication": feed_meta["name"]
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

