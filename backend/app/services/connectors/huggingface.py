from datetime import datetime
import httpx
from typing import List, Dict, Any

HF_API_BASE = "https://huggingface.co/api"

async def fetch_huggingface_trending_models(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Fetches trending and newly released AI models and LLMs from Hugging Face public API.
    """
    url = f"{HF_API_BASE}/models?sort=likes7d&direction=-1&limit={limit}&full=false"
    headers = {"User-Agent": "Scoutboard-Intelligence-Platform/1.0"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        models = resp.json()

    records = []
    for m in models:
        model_id = m.get("id") or m.get("modelId", "")
        if not model_id:
            continue

        likes = m.get("likes", 0)
        downloads = m.get("downloads", 0)
        pipeline = m.get("pipeline_tag") or "Generative AI"
        tags = m.get("tags", [])
        author = model_id.split("/")[0] if "/" in model_id else "Community"
        model_name = model_id.split("/")[-1] if "/" in model_id else model_id

        published_at = datetime.utcnow()
        created_at_str = m.get("createdAt")
        if created_at_str:
            try:
                published_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            except Exception:
                pass

        description = (
            f"🔥 {likes:,} likes | 📥 {downloads:,} downloads | Pipeline: {pipeline} | Author: {author}"
        )
        model_url = f"https://huggingface.co/{model_id}"

        clean_tags = ["AI Model", pipeline] + [t for t in tags if len(t) < 25][:4]

        records.append({
            "title": f"HF Model: {model_id}",
            "description": description,
            "content": f"Hugging Face Model: {model_url}\nPipeline: {pipeline}\nTags: {', '.join(tags[:8])}",
            "original_url": model_url,
            "author": author,
            "published_at": published_at,
            "tags": ", ".join(clean_tags),
            "category": "New AI Models",
            "metadata": {
                "hf_id": model_id,
                "likes": likes,
                "downloads": downloads,
                "pipeline_tag": pipeline
            }
        })

    return records

async def fetch_huggingface_daily_papers(limit: int = 15) -> List[Dict[str, Any]]:
    """
    Fetches the highest-upvoted Daily AI Research Papers from Hugging Face.
    """
    url = f"{HF_API_BASE}/daily_papers?limit={limit}"
    headers = {"User-Agent": "Scoutboard-Intelligence-Platform/1.0"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    records = []
    for item in data[:limit]:
        paper = item.get("paper", {})
        title = paper.get("title", "").strip()
        if not title:
            continue

        paper_id = paper.get("id", "")
        summary = paper.get("summary", "").strip()
        upvotes = item.get("upvotes", 0)
        published_at_str = paper.get("publishedAt")
        published_at = datetime.utcnow()
        if published_at_str:
            try:
                published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00"))
            except Exception:
                pass

        authors = [a.get("name") for a in paper.get("authors", []) if a.get("name")]
        author_str = ", ".join(authors[:3]) if authors else "AI Researchers"

        paper_url = f"https://huggingface.co/papers/{paper_id}" if paper_id else f"https://arxiv.org/abs/{paper_id}"
        description = f"⭐ {upvotes} paper upvotes | By {author_str}\n\n{summary[:280]}"

        records.append({
            "title": f"Paper: {title}",
            "description": description,
            "content": summary,
            "original_url": paper_url,
            "author": author_str,
            "published_at": published_at,
            "tags": "AI Research, Daily Papers, ArXiv, HuggingFace",
            "category": "Research Papers",
            "metadata": {
                "paper_id": paper_id,
                "upvotes": upvotes
            }
        })

    return records

