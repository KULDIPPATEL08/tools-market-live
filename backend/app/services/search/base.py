from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SearchResultItem(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    published_date: Optional[str] = None
    relevance_score: float = 1.0
    domain: Optional[str] = None
    category: Optional[str] = "Web"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchResponse(BaseModel):
    query: str
    mode: str
    provider: str
    total_results: int
    results: List[SearchResultItem]
    synthesis: Optional[str] = None
    key_takeaways: List[str] = Field(default_factory=list)

class BaseSearchProvider(ABC):
    @abstractmethod
    async def search(self, query: str, mode: str = "quick", max_results: int = 10) -> List[SearchResultItem]:
        """Execute a web search query."""
        pass
