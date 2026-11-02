import hashlib
import re
from typing import Dict, Any

def normalize_text(text: str) -> str:
    """Normalizes text by removing non-alphanumeric chars and extra whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'https?://[^\s]+', '', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return " ".join(text.split())

def generate_fingerprint(url: str, title: str, content: str = "") -> str:
    """
    Generates a deterministic SHA-256 content fingerprint.
    Uses normalized URL and title to detect exact and near duplicates.
    """
    clean_url = url.strip().lower().rstrip('/')
    # Remove tracking query parameters (utm_*, ref, etc.)
    clean_url = re.sub(r'(\?|&)(utm_[^&]+|ref=[^&]+|fbclid=[^&]+)', '', clean_url)
    clean_title = normalize_text(title)
    
    hash_input = f"{clean_url}|{clean_title}"
    return hashlib.sha256(hash_input.encode('utf-8')).hexdigest()

def calculate_quality_score(record_dict: Dict[str, Any]) -> float:
    """
    Calculates a data completeness / quality score between 0.0 and 1.0.
    Based on presence of title, description, URL, author, tags, and date.
    """
    score = 0.0
    title = record_dict.get("title", "")
    if title and len(title) > 10:
        score += 0.3
    elif title:
        score += 0.15

    desc = record_dict.get("description", "")
    if desc and len(desc) > 100:
        score += 0.3
    elif desc:
        score += 0.15

    if record_dict.get("original_url"):
        score += 0.15

    if record_dict.get("author"):
        score += 0.1

    if record_dict.get("published_at"):
        score += 0.1

    if record_dict.get("tags"):
        score += 0.05

    return round(min(score, 1.0), 2)
