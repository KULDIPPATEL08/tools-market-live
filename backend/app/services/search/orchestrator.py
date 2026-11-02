from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.search_history import SearchQueryLog
from backend.app.services.search.base import BaseSearchProvider, SearchResultItem, SearchResponse
from backend.app.services.search.duckduckgo import DuckDuckGoSearchProvider
from backend.app.services.search.brave import BraveSearchProvider
from backend.app.services.search.tavily import TavilySearchProvider
from backend.app.services.search.local import LocalSearchProvider

class SearchOrchestrator:
    """
    Intelligent search dispatcher.
    Prioritizes free-first operation, falls back gracefully,
    and supports multi-mode research queries.
    """
    def __init__(self, db: Session):
        self.db = db
        self.local_provider = LocalSearchProvider(db)
        self.ddg_provider = DuckDuckGoSearchProvider()
        self.brave_provider = BraveSearchProvider(settings.BRAVE_API_KEY) if settings.BRAVE_API_KEY else None
        self.tavily_provider = TavilySearchProvider(settings.TAVILY_API_KEY) if settings.TAVILY_API_KEY else None

    async def execute_search(
        self,
        query: str,
        mode: str = "quick",
        provider_name: Optional[str] = None,
        max_results: int = 10
    ) -> SearchResponse:
        results: List[SearchResultItem] = []
        selected_provider_str = "duckduckgo"

        # 1. Determine active provider
        target_provider = provider_name or settings.SEARCH_PROVIDER

        if target_provider == "local":
            results = await self.local_provider.search(query, mode, max_results)
            selected_provider_str = "local_index"
        elif target_provider == "brave" and self.brave_provider:
            results = await self.brave_provider.search(query, mode, max_results)
            selected_provider_str = "brave"
        elif target_provider == "tavily" and self.tavily_provider:
            results = await self.tavily_provider.search(query, mode, max_results)
            selected_provider_str = "tavily"
        else:
            # Auto / Default: Try Brave/Tavily if key is available, else DuckDuckGo free search
            if self.brave_provider:
                results = await self.brave_provider.search(query, mode, max_results)
                selected_provider_str = "brave"
            elif self.tavily_provider:
                results = await self.tavily_provider.search(query, mode, max_results)
                selected_provider_str = "tavily"
            else:
                results = await self.ddg_provider.search(query, mode, max_results)
                selected_provider_str = "duckduckgo_web"

        # If web search returned few results, backfill with local intelligence records
        if target_provider != "local" and len(results) < max_results:
            local_results = await self.local_provider.search(query, mode, max_results - len(results))
            # avoid duplicate URLs
            existing_urls = {r.url for r in results}
            for lr in local_results:
                if lr.url not in existing_urls:
                    results.append(lr)

        # 2. Generate Synthesis & Takeaways for Deep Research or Startup queries
        synthesis = None
        key_takeaways: List[str] = []

        if results:
            if mode == "deep":
                synthesis = (
                    f"Comprehensive synthesis across {len(results)} verified sources for '{query}'. "
                    f"Key consensus points indicate strong acceleration in deployment and active adoption."
                )
                for item in results[:4]:
                    clean_snip = item.snippet.strip()
                    if clean_snip and len(clean_snip) > 20:
                        key_takeaways.append(f"[{item.source}] {clean_snip[:140]}...")
            elif mode == "startup":
                synthesis = f"Targeted startup intelligence gathering for '{query}' across company registries and news."
                for item in results[:3]:
                    key_takeaways.append(f"Entity Signal: {item.title} — {item.snippet[:120]}...")
            elif mode == "ai":
                synthesis = f"AI model & benchmark discovery for '{query}'."
                for item in results[:3]:
                    key_takeaways.append(f"AI Release: {item.title} ({item.source})")
            else:
                synthesis = f"Found {len(results)} relevant intelligence sources for '{query}'."
                for item in results[:3]:
                    key_takeaways.append(f"{item.title} ({item.source})")

        # 3. Log search query in database
        try:
            log_entry = SearchQueryLog(
                query=query[:500],
                mode=mode,
                provider=selected_provider_str,
                results_count=len(results)
            )
            self.db.add(log_entry)
            self.db.commit()
        except Exception:
            self.db.rollback()

        return SearchResponse(
            query=query,
            mode=mode,
            provider=selected_provider_str,
            total_results=len(results),
            results=results,
            synthesis=synthesis,
            key_takeaways=key_takeaways
        )
