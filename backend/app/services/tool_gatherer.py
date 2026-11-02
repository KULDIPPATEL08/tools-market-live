from datetime import datetime
import json
import re
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session

from backend.app.models.record import CollectedRecord
from backend.app.core.ssrf import is_safe_url
from backend.app.services.connectors.webpage import fetch_webpage
from backend.app.services.deduplication import generate_fingerprint, calculate_quality_score

CURATED_BEST_TOOLS = [
    {
        "name": "vLLM",
        "repo": "vllm-project/vllm",
        "url": "https://github.com/vllm-project/vllm",
        "category": "AI & LLM Infrastructure",
        "description": "High-throughput and memory-efficient inference and serving engine for LLMs with PagedAttention.",
        "stars": 34000,
        "language": "Python / CUDA",
        "license": "Apache-2.0",
        "tags": "LLM, Inference, CUDA, PagedAttention, High-Throughput"
    },
    {
        "name": "Ollama",
        "repo": "ollama/ollama",
        "url": "https://github.com/ollama/ollama",
        "category": "AI & LLM Infrastructure",
        "description": "Get up and running with Llama 3, Mistral, Gemma 2, and other large language models locally.",
        "stars": 115000,
        "language": "Go / C++",
        "license": "MIT",
        "tags": "Local-LLM, Open-Source, Desktop-AI, macOS, Linux, Windows"
    },
    {
        "name": "Crawl4AI",
        "repo": "unclecode/crawl4ai",
        "url": "https://github.com/unclecode/crawl4ai",
        "category": "Web Scraping & Extraction",
        "description": "Open-source LLM-friendly web crawler & scraper designed for speed, extraction, and clean Markdown output.",
        "stars": 24000,
        "language": "Python",
        "license": "Apache-2.0",
        "tags": "Scraper, Crawler, LLM-Ready, Markdown, BeautifulSoup"
    },
    {
        "name": "uv",
        "repo": "astral-sh/uv",
        "url": "https://github.com/astral-sh/uv",
        "category": "Developer Productivity & CLI",
        "description": "An extremely fast Python package and project manager, written in Rust. Replaces pip, pip-tools, and virtualenv.",
        "stars": 42000,
        "language": "Rust",
        "license": "MIT / Apache-2.0",
        "tags": "Python, Rust, Package-Manager, Pip-Replacement, Blazing-Fast"
    },
    {
        "name": "PocketBase",
        "repo": "pocketbase/pocketbase",
        "url": "https://github.com/pocketbase/pocketbase",
        "category": "Databases & Local-First",
        "description": "Open Source backend for your next SaaS and Mobile app in 1 single file (embedded SQLite with realtime subscriptions).",
        "stars": 43000,
        "language": "Go",
        "license": "MIT",
        "tags": "Backend, SQLite, Auth, Realtime, Embedded-Database"
    },
    {
        "name": "Shadcn UI",
        "repo": "shadcn-ui/ui",
        "url": "https://github.com/shadcn-ui/ui",
        "category": "UI Engineering & Components",
        "description": "Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.",
        "stars": 75000,
        "language": "TypeScript",
        "license": "MIT",
        "tags": "React, Tailwind, Radix-UI, Components, Design-System"
    },
    {
        "name": "SearXNG",
        "repo": "searxng/searxng",
        "url": "https://github.com/searxng/searxng",
        "category": "Privacy & Discovery",
        "description": "A privacy-respecting, hackable metasearch engine aggregating results from over 70 search services.",
        "stars": 16000,
        "language": "Python",
        "license": "AGPL-3.0",
        "tags": "Search, Privacy, Metasearch, No-Tracking, Self-Hosted"
    }
]

async def gather_tool_from_input(query_or_url: str, db: Session) -> Dict[str, Any]:
    """
    Gathers structured tool intelligence from a GitHub repository or product URL,
    extracts metadata, stargazers, license, tech stack, and indexes it into Scoutboard.
    """
    query_or_url = query_or_url.strip()
    github_match = re.search(r"(?:github\.com/|^)([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)(?:/|$|\.git)", query_or_url)

    tool_data: Dict[str, Any] = {}

    if github_match:
        repo_slug = github_match.group(1).rstrip("/")
        # Query GitHub public API
        api_url = f"https://api.github.com/repos/{repo_slug}"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Scoutboard-ToolGatherer/1.0"
        }
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(api_url, headers=headers)
            if resp.status_code == 200:
                gh = resp.json()
                tool_data = {
                    "name": gh.get("name", repo_slug),
                    "full_name": gh.get("full_name", repo_slug),
                    "url": gh.get("html_url", f"https://github.com/{repo_slug}"),
                    "description": gh.get("description") or "Open source project on GitHub",
                    "stars": gh.get("stargazers_count", 0),
                    "forks": gh.get("forks_count", 0),
                    "open_issues": gh.get("open_issues_count", 0),
                    "language": gh.get("language") or "Code",
                    "license": (gh.get("license") or {}).get("spdx_id") or "Unknown",
                    "topics": gh.get("topics", []),
                    "created_at": gh.get("created_at"),
                    "updated_at": gh.get("updated_at"),
                    "category": categorize_tool(gh.get("description", "") + " " + " ".join(gh.get("topics", []))),
                    "author": (gh.get("owner") or {}).get("login", "GitHub")
                }
            else:
                # Fallback to web scraping if API rate-limited
                web = await fetch_webpage(f"https://github.com/{repo_slug}")
                tool_data = {
                    "name": repo_slug.split("/")[-1],
                    "full_name": repo_slug,
                    "url": f"https://github.com/{repo_slug}",
                    "description": web.get("description", ""),
                    "stars": 0,
                    "forks": 0,
                    "open_issues": 0,
                    "language": "Open Source",
                    "license": "Open Source",
                    "topics": web.get("tags", "").split(", "),
                    "category": "Developer Tools",
                    "author": repo_slug.split("/")[0]
                }
    else:
        # Standard tool website URL
        target_url = query_or_url
        if not target_url.startswith("http://") and not target_url.startswith("https://"):
            target_url = f"https://{target_url}"
        
        web = await fetch_webpage(target_url)
        tool_data = {
            "name": web.get("title", target_url.split("/")[2])[:80],
            "full_name": web.get("title", target_url)[:120],
            "url": web.get("original_url", target_url),
            "description": web.get("description") or "Web-based tool or service",
            "stars": 0,
            "forks": 0,
            "open_issues": 0,
            "language": "Web",
            "license": "Proprietary / Commercial",
            "topics": [t.strip() for t in web.get("tags", "").split(",") if t.strip()],
            "category": categorize_tool(web.get("title", "") + " " + web.get("description", "")),
            "author": web.get("author") or "Web"
        }

    # Save to collected records
    fingerprint = generate_fingerprint(tool_data["url"], tool_data["name"], tool_data["description"])
    existing = db.query(CollectedRecord).filter(CollectedRecord.content_fingerprint == fingerprint).first()

    record_id = None
    if not existing:
        tags_list = ["tool", tool_data["category"].lower().replace(" ", "-"), tool_data["language"].lower()] + [t.lower() for t in tool_data.get("topics", [])[:5]]
        rec = CollectedRecord(
            title=f"{tool_data['name']} — {tool_data['category']}",
            description=tool_data["description"],
            content=f"TOOL NAME: {tool_data['name']}\nREPOSITORY: {tool_data['url']}\nSTARS: {tool_data.get('stars', 0):,}\nLANGUAGE: {tool_data['language']}\nLICENSE: {tool_data['license']}\n\nDESCRIPTION:\n{tool_data['description']}",
            original_url=tool_data["url"],
            author=tool_data["author"],
            published_at=datetime.utcnow(),
            tags=", ".join(list(dict.fromkeys(tags_list))),
            category=tool_data["category"],
            content_fingerprint=fingerprint,
            quality_score=92 if tool_data.get("stars", 0) > 1000 else 80,
            metadata_json=json.dumps(tool_data)
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        record_id = rec.id
    else:
        record_id = existing.id

    return {
        "status": "gathered",
        "tool": tool_data,
        "record_id": record_id,
        "is_new": existing is None
    }

def categorize_tool(text: str) -> str:
    text_lower = text.lower()
    if any(k in text_lower for k in ["llm", "ai", "model", "inference", "agent", "gpt", "rag", "embedding"]):
        return "AI & LLM Infrastructure"
    elif any(k in text_lower for k in ["scraper", "crawler", "scrape", "crawl", "parser", "harvest"]):
        return "Web Scraping & Extraction"
    elif any(k in text_lower for k in ["db", "database", "sqlite", "postgres", "vector", "crdt", "local-first"]):
        return "Databases & Local-First"
    elif any(k in text_lower for k in ["ui", "component", "tailwind", "react", "css", "canvas", "frontend"]):
        return "UI Engineering & Components"
    elif any(k in text_lower for k in ["security", "auth", "crypto", "encryption", "privacy", "zero-knowledge"]):
        return "Security & Privacy"
    else:
        return "Developer Productivity & CLI"
