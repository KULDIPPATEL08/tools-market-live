import httpx
from typing import List
from backend.app.services.search.base import BaseSearchProvider, SearchResultItem

class TavilySearchProvider(BaseSearchProvider):
    """
    Tavily Search API provider for deep research and entity search.
    Requires TAVILY_API_KEY.
    """
    SEARCH_URL = "https://api.tavily.com/search"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str, mode: str = "quick", max_results: int = 10) -> List[SearchResultItem]:
        if not self.api_key:
            return []

        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced" if mode == "deep" else "basic",
            "max_results": max_results,
            "include_answer": True
        }

        results: List[SearchResultItem] = []
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(self.SEARCH_URL, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("results", []):
                        results.append(SearchResultItem(
                            title=item.get("title", ""),
                            url=item.get("url", ""),
                            snippet=item.get("content", ""),
                            source=item.get("url", "").split("/")[2] if "://" in item.get("url", "") else "Tavily",
                            relevance_score=float(item.get("score", 0.9)),
                            metadata={"engine": "tavily"}
                        ))
        except Exception:
            pass

        return results
