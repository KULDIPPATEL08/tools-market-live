from datetime import datetime
import time
import re
import feedparser
import httpx
from typing import List, Dict, Any

REDDIT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Compatible; Scoutboard/1.0; +https://scoutboard.local)"

async def fetch_reddit_posts(subreddit: str = "LocalLLaMA", sort: str = "hot", limit: int = 25) -> List[Dict[str, Any]]:
    """
    Fetches live posts and discussions from any public subreddit.
    Uses RSS feed first with JSON fallback to bypass Reddit CDN 403 blocks.
    """
    clean_sub = subreddit.replace("r/", "").strip()
    rss_url = f"https://www.reddit.com/r/{clean_sub}/.rss"

    headers = {
        "User-Agent": REDDIT_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(rss_url, headers=headers)
            if resp.status_code == 200:
                feed = feedparser.parse(resp.text)
                if feed.entries:
                    records = []
                    for entry in feed.entries[:limit]:
                        title = entry.get("title", "").strip()
                        link = entry.get("link", "")
                        author = entry.get("author", "Reddit User")
                        content_raw = entry.get("content", [{}])[0].get("value", "") or entry.get("summary", "")

                        # Clean HTML tags
                        clean_text = re.sub(r'<[^>]+>', ' ', content_raw)
                        clean_text = " ".join(clean_text.split())

                        published_at = datetime.utcnow()
                        if hasattr(entry, "published_parsed") and entry.published_parsed:
                            published_at = datetime.fromtimestamp(time.mktime(entry.published_parsed))

                        desc = f"r/{clean_sub} • By {author}"
                        if clean_text:
                            desc = f"{desc}\n\n{clean_text[:280]}"

                        records.append({
                            "title": title,
                            "description": desc,
                            "content": clean_text,
                            "original_url": link,
                            "author": author,
                            "published_at": published_at,
                            "tags": f"r/{clean_sub}, Reddit, Community",
                            "category": "Reddit Intelligence",
                            "metadata": {
                                "subreddit": clean_sub,
                                "reddit_url": link
                            }
                        })
                    return records
    except Exception:
        pass

    # Fallback to JSON endpoint if RSS fails
    json_url = f"https://www.reddit.com/r/{clean_sub}/{sort}.json?limit={limit}"
    json_headers = {"User-Agent": REDDIT_USER_AGENT, "Accept": "application/json"}
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(json_url, headers=json_headers)
        resp.raise_for_status()
        data = resp.json()

    children = data.get("data", {}).get("children", [])
    records = []
    for item in children:
        post = item.get("data", {})
        if not post or post.get("stickied"):
            continue
        title = post.get("title", "").strip()
        selftext = post.get("selftext", "").strip()
        permalink = f"https://www.reddit.com{post.get('permalink')}"
        external_url = post.get("url") or permalink
        author = post.get("author", "anonymous")
        ups = post.get("ups", 0)
        num_comments = post.get("num_comments", 0)

        records.append({
            "title": title,
            "description": f"👍 {ups:,} upvotes | 💬 {num_comments:,} comments | r/{clean_sub}\n\n{selftext[:280]}",
            "content": selftext or permalink,
            "original_url": external_url,
            "author": f"u/{author}",
            "published_at": datetime.utcnow(),
            "tags": f"r/{clean_sub}, Reddit",
            "category": "Reddit Intelligence",
            "metadata": {"subreddit": clean_sub, "upvotes": ups, "num_comments": num_comments}
        })
    return records
