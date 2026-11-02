from datetime import datetime
import asyncio
import httpx
from typing import List, Dict, Any

HN_BASE_URL = "https://hacker-news.firebaseio.com/v0"

async def fetch_hn_stories(story_type: str = "topstories", limit: int = 15) -> List[Dict[str, Any]]:
    """
    Fetches stories from the official Hacker News Firebase API.
    story_type can be 'topstories', 'newstories', 'askstories', 'showstories'.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Fetch story IDs
        endpoint = f"{HN_BASE_URL}/{story_type}.json"
        resp = await client.get(endpoint)
        resp.raise_for_status()
        story_ids = resp.json()[:limit]

        # 2. Fetch individual items concurrently
        async def fetch_item(item_id: int):
            try:
                r = await client.get(f"{HN_BASE_URL}/item/{item_id}.json")
                if r.status_code == 200:
                    return r.json()
            except Exception:
                return None
            return None

        items = await asyncio.gather(*[fetch_item(sid) for sid in story_ids])

    records = []
    for item in items:
        if not item or item.get("deleted") or item.get("dead"):
            continue

        item_id = item.get("id")
        title = item.get("title", "Untitled HN Story")
        url = item.get("url") or f"https://news.ycombinator.com/item?id={item_id}"
        author = item.get("by", "anonymous")
        score = item.get("score", 0)
        descendants = item.get("descendants", 0)
        timestamp = item.get("time")
        published_at = datetime.fromtimestamp(timestamp) if timestamp else datetime.utcnow()
        
        text_content = item.get("text", "")
        description = f"Score: {score} pts | Comments: {descendants} | By: {author}"
        if text_content:
            description = f"{description}\n\n{text_content[:200]}"

        category = "Community"
        if story_type == "askstories" or title.startswith("Ask HN"):
            category = "Ask HN"
        elif story_type == "showstories" or title.startswith("Show HN"):
            category = "Show HN"

        records.append({
            "title": title,
            "description": description,
            "content": text_content or f"Discussion link: https://news.ycombinator.com/item?id={item_id}",
            "original_url": url,
            "author": author,
            "published_at": published_at,
            "tags": "HackerNews, Tech, Discussion",
            "category": category,
            "metadata": {
                "hn_id": item_id,
                "score": score,
                "comments_count": descendants,
                "hn_url": f"https://news.ycombinator.com/item?id={item_id}"
            }
        })

    return records

