import re
import urllib.parse
import httpx
from bs4 import BeautifulSoup
from typing import List
from backend.app.services.search.base import BaseSearchProvider, SearchResultItem

class DuckDuckGoSearchProvider(BaseSearchProvider):
    """
    Zero-key public web search provider using DuckDuckGo HTML endpoint.
    Guarantees free-first operation without external API subscriptions.
    """
    SEARCH_URL = "https://html.duckduckgo.com/html/"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://html.duckduckgo.com/",
    }

    async def search(self, query: str, mode: str = "quick", max_results: int = 10) -> List[SearchResultItem]:
        results: List[SearchResultItem] = []
        
        # Optimize query for mode
        enhanced_query = query
        if mode == "startup":
            enhanced_query = f"{query} startup founders funding launch"
        elif mode == "ai":
            enhanced_query = f"{query} AI model paper github benchmark"
        elif mode == "technology":
            enhanced_query = f"{query} architecture documentation open source"

        try:
            data = {"q": enhanced_query}
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.post(self.SEARCH_URL, data=data, headers=self.HEADERS)
                if resp.status_code != 200:
                    # Fallback to get request if post fails
                    resp = await client.get(f"{self.SEARCH_URL}?q={urllib.parse.quote(enhanced_query)}", headers=self.HEADERS)

                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    links = soup.find_all("div", class_=re.compile(r"result\s+results_links"))
                    
                    for link_tag in links[:max_results]:
                        title_tag = link_tag.find("a", class_="result__a")
                        snippet_tag = link_tag.find("a", class_="result__snippet")
                        url_tag = link_tag.find("a", class_="result__url")

                        if not title_tag:
                            continue

                        raw_href = title_tag.get("href", "")
                        # DuckDuckGo wraps URLs in /l/?uddg=...
                        clean_url = raw_href
                        if "uddg=" in raw_href:
                            parsed_url = urllib.parse.parse_qs(urllib.parse.urlparse(raw_href).query)
                            if "uddg" in parsed_url:
                                clean_url = parsed_url["uddg"][0]

                        # Extract domain
                        domain = ""
                        try:
                            domain = urllib.parse.urlparse(clean_url).netloc
                        except Exception:
                            pass

                        title = title_tag.get_text(strip=True)
                        snippet = snippet_tag.get_text(strip=True) if snippet_tag else (url_tag.get_text(strip=True) if url_tag else "")

                        results.append(SearchResultItem(
                            title=title,
                            url=clean_url,
                            snippet=snippet,
                            source=domain or "Web",
                            domain=domain,
                            category=mode.capitalize(),
                            relevance_score=0.95 - (len(results) * 0.03),
                            metadata={"mode": mode, "engine": "duckduckgo"}
                        ))
        except Exception:
            pass

        return results
