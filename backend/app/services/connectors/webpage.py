from datetime import datetime
import re
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any
from backend.app.core.ssrf import is_safe_url

async def fetch_webpage(url: str) -> Dict[str, Any]:
    """
    Safely fetches a web page and extracts structured metadata and readable content.
    Includes strict SSRF and size limit protections.
    """
    is_safe, error = is_safe_url(url)
    if not is_safe:
        raise ValueError(f"SSRF Security Violation: {error}")

    headers = {
        "User-Agent": "Scoutboard-Intelligence-Bot/1.0 (+https://scoutboard.local)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        
        # Check content size
        if len(resp.content) > 5 * 1024 * 1024:
            raise ValueError("Target webpage exceeds maximum allowed size (5MB).")
            
        html = resp.text

    soup = BeautifulSoup(html, "html.parser")

    # Extract title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("meta", property="og:title"):
        title = soup.find("meta", property="og:title").get("content", "").strip()

    if not title:
        title = url

    # Extract description
    description = ""
    meta_desc = (
        soup.find("meta", attrs={"name": "description"}) or
        soup.find("meta", attrs={"name": "Description"}) or
        soup.find("meta", property="og:description")
    )
    if meta_desc and meta_desc.get("content"):
        description = meta_desc.get("content").strip()

    # Extract author
    author = ""
    meta_author = (
        soup.find("meta", attrs={"name": "author"}) or
        soup.find("meta", property="article:author")
    )
    if meta_author and meta_author.get("content"):
        author = meta_author.get("content").strip()

    # Extract published time
    published_at = None
    meta_time = (
        soup.find("meta", property="article:published_time") or
        soup.find("meta", attrs={"name": "pubdate"})
    )
    if meta_time and meta_time.get("content"):
        try:
            published_at = datetime.fromisoformat(meta_time.get("content").replace("Z", "+00:00"))
        except Exception:
            pass

    # Extract clean text from paragraphs
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()

    paragraphs = [p.get_text().strip() for p in soup.find_all(["p", "article"]) if len(p.get_text().strip()) > 30]
    content = "\n\n".join(paragraphs[:15])

    if not description and paragraphs:
        description = paragraphs[0][:280]

    return {
        "title": title,
        "description": description,
        "content": content,
        "original_url": str(resp.url),
        "author": author,
        "published_at": published_at or datetime.utcnow(),
        "tags": "Web, Public Page",
        "category": "Web Article",
        "metadata": {
            "status_code": resp.status_code,
            "canonical_url": str(resp.url)
        }
    }
