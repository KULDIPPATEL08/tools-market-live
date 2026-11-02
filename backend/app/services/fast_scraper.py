import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Any, Tuple
from backend.app.core.ssrf import is_safe_url

async def scrape_single_url_fast(client: httpx.AsyncClient, url: str) -> Tuple[bool, Dict[str, Any], str]:
    """Scrapes a single webpage with SSRF preflight check."""
    is_safe, error = is_safe_url(url)
    if not is_safe:
        return False, {}, f"Security blocked: {error}"

    try:
        resp = await client.get(url)
        resp.raise_for_status()
        
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        
        desc = ""
        meta_desc = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", property="og:description")
        if meta_desc and meta_desc.get("content"):
            desc = meta_desc.get("content").strip()

        # Clean text
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        
        paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 30]
        content = "\n\n".join(paragraphs[:10])
        if not desc and paragraphs:
            desc = paragraphs[0][:280]

        return True, {
            "title": title[:512],
            "description": desc,
            "content": content,
            "original_url": str(resp.url),
            "author": "Web Scraper",
            "published_at": datetime.utcnow(),
            "tags": "Fast Scraping, Live Web",
            "category": "Web Intelligence",
            "metadata": {"status_code": resp.status_code}
        }, ""
    except Exception as e:
        return False, {}, str(e)

async def fast_batch_scrape(urls: List[str], max_concurrency: int = 8) -> List[Dict[str, Any]]:
    """
    Rapid concurrent web scraper using worker queue and connection pooling.
    Processes dozens of URLs within seconds.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Scoutboard-FastScraper/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    limits = httpx.Limits(max_keepalive_connections=20, max_connections=max_concurrency)
    async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True, limits=limits) as client:
        tasks = [scrape_single_url_fast(client, u.strip()) for u in urls if u.strip()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    extracted_records = []
    for res in results:
        if isinstance(res, tuple) and res[0] is True:
            extracted_records.append(res[1])

    return extracted_records

