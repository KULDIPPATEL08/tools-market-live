from datetime import datetime
import time
import feedparser
import httpx
from typing import List, Dict, Any
from backend.app.core.ssrf import is_safe_url

async def fetch_rss_feed(url: str) -> List[Dict[str, Any]]:
    """
    Fetches and parses an RSS or Atom feed.
    Validates URL against SSRF before connecting.
    """
    is_safe, error = is_safe_url(url)
    if not is_safe:
        raise ValueError(f"SSRF check failed: {error}")

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        headers = {"User-Agent": "Scoutboard-Intelligence-Bot/1.0 (+https://scoutboard.local)"}
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        content = resp.text

    feed = feedparser.parse(content)
    if feed.bozo and not feed.entries:
        raise ValueError(f"Failed to parse RSS/Atom feed: {feed.get('bozo_exception', 'Malformed XML')}")

    records = []
    feed_title = feed.feed.get("title", "RSS Feed")

    for entry in feed.entries:
        link = entry.get("link", "")
        title = entry.get("title", "Untitled")
        description = entry.get("summary", entry.get("description", ""))
        author = entry.get("author", entry.get("author_detail", {}).get("name", ""))
        
        # Parse published date
        published_at = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published_at = datetime.fromtimestamp(time.mktime(entry.published_parsed))
        elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
            published_at = datetime.fromtimestamp(time.mktime(entry.updated_parsed))

        tags = []
        if hasattr(entry, "tags"):
            tags = [t.term for t in entry.tags if hasattr(t, "term") and t.term]

        records.append({
            "title": title.strip(),
            "description": description.strip() if description else "",
            "content": entry.get("content", [{}])[0].get("value", "") if hasattr(entry, "content") and entry.content else description,
            "original_url": link.strip(),
            "author": author.strip() if author else "",
            "published_at": published_at,
            "tags": ", ".join(tags[:5]) if tags else "",
            "category": "RSS Feed",
            "metadata": {
                "feed_title": feed_title,
                "feed_link": feed.feed.get("link", ""),
                "guid": entry.get("id", link)
            }
        })

    return records
