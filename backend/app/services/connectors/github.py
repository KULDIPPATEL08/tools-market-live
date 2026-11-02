from datetime import datetime
import httpx
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

async def fetch_github_repositories(query: str = "stars:>1000", limit: int = 15) -> List[Dict[str, Any]]:
    """
    Fetches repositories from GitHub Public REST API.
    Uses optional GITHUB_API_TOKEN if configured.
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Scoutboard-Intelligence-Bot/1.0"
    }
    if settings.GITHUB_API_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_API_TOKEN}"

    url = f"https://api.github.com/search/repositories?q={query}&sort=updated&order=desc&per_page={limit}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 403:
            # Rate limit exceeded or forbidden
            raise ValueError("GitHub API rate limit exceeded or access forbidden. Please add GITHUB_API_TOKEN or try again later.")
        resp.raise_for_status()
        data = resp.json()

    items = data.get("items", [])
    records = []

    for item in items:
        pushed_at_str = item.get("pushed_at")
        published_at = None
        if pushed_at_str:
            try:
                published_at = datetime.fromisoformat(pushed_at_str.replace("Z", "+00:00"))
            except Exception:
                pass

        topics = item.get("topics", [])
        language = item.get("language") or "Code"
        stars = item.get("stargazers_count", 0)
        forks = item.get("forks_count", 0)
        owner = item.get("owner", {}).get("login", "")

        tags = [language] + [t for t in topics if t]
        
        description = item.get("description") or f"GitHub repository {item.get('full_name')}"
        enhanced_desc = f"{description} | ⭐ {stars:,} stars | 🍴 {forks:,} forks | Language: {language}"

        records.append({
            "title": item.get("full_name", item.get("name")),
            "description": enhanced_desc,
            "content": f"Repository: {item.get('html_url')}\nOwner: {owner}\nDefault Branch: {item.get('default_branch')}\nOpen Issues: {item.get('open_issues_count')}",
            "original_url": item.get("html_url", ""),
            "author": owner,
            "published_at": published_at,
            "tags": ", ".join(tags[:6]),
            "category": "Open-Source",
            "language": language,
            "metadata": {
                "stars": stars,
                "forks": forks,
                "license": item.get("license", {}).get("name") if item.get("license") else None,
                "homepage": item.get("homepage"),
                "topics": topics
            }
        })

    return records

