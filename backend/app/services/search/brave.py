import httpx
from typing import List
from backend.app.services.search.base import BaseSearchProvider, SearchResultItem

class BraveSearchProvider(BaseSearchProvider):
    """
    Brave Search API provider for high-velocity structured web search.
    Requires BRAVE_API_KEY.
    """
    SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str, mode: str = "quick", max_results: int = 10) -> List[SearchResultItem]:
        if not self.api_key:
            return []

        headers = {
            "Accept": "application/json",
            "X-Subscription-Token": self.api_key
        }
        params = {
            "q": query,
            "count": min(max_results, 20),
            "text_decorations": False
        }

        results: List[SearchResultItem] = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(self.SEARCH_URL, headers=headers, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    web_results = data.get("web", {}).get("results", [])
                    for item in web_results:
                        results.append(SearchResultItem(
                            title=item.get("title", ""),
                            url=item.get("url", ""),
                            snippet=item.get("description", ""),
                            source=item.get("profile", {}).get("name", "Brave Web"),
                            published_date=item.get("page_age"),
                            relevance_score=0.98 - (len(results) * 0.02),
                            metadata={"engine": "brave"}
                        ))
        except Exception:
            pass

        return results
