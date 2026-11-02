import csv
import io
import json
from datetime import datetime
from typing import List, Dict, Any, Tuple

def parse_csv_data(file_content: str, field_mapping: Dict[str, str] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Parses CSV text and maps fields to Scoutboard record schema.
    Returns (records, summary_stats).
    """
    f = io.StringIO(file_content)
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames or []

    # Default heuristic mapping if none provided
    if not field_mapping:
        field_mapping = {}
        for col in fieldnames:
            c_low = col.lower()
            if "title" in c_low or "name" in c_low:
                field_mapping["title"] = col
            elif "desc" in c_low or "summary" in c_low or "text" in c_low:
                field_mapping["description"] = col
            elif "url" in c_low or "link" in c_low:
                field_mapping["original_url"] = col
            elif "author" in c_low or "by" in c_low:
                field_mapping["author"] = col
            elif "tag" in c_low or "category" in c_low:
                field_mapping["tags"] = col

    title_col = field_mapping.get("title", fieldnames[0] if fieldnames else "title")
    desc_col = field_mapping.get("description", fieldnames[1] if len(fieldnames) > 1 else None)
    url_col = field_mapping.get("original_url", None)
    author_col = field_mapping.get("author", None)
    tags_col = field_mapping.get("tags", None)

    records = []
    skipped = 0

    for idx, row in enumerate(reader):
        title = row.get(title_col, "").strip() if title_col else ""
        if not title:
            skipped += 1
            continue

        desc = row.get(desc_col, "").strip() if desc_col else ""
        url = row.get(url_col, f"local://import/csv/row-{idx+1}").strip() if url_col else f"local://import/csv/row-{idx+1}"
        author = row.get(author_col, "File Import").strip() if author_col else "File Import"
        tags = row.get(tags_col, "CSV Import").strip() if tags_col else "CSV Import"

        records.append({
            "title": title,
            "description": desc,
            "content": json.dumps(row, ensure_ascii=False),
            "original_url": url,
            "author": author,
            "published_at": datetime.utcnow(),
            "tags": tags,
            "category": "Dataset / File",
            "metadata": {"raw_row": row}
        })

    summary = {
        "total_rows": len(records) + skipped,
        "valid_records": len(records),
        "skipped_rows": skipped,
        "columns_found": fieldnames,
        "applied_mapping": field_mapping
    }
    return records, summary

def parse_json_data(file_content: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Parses JSON array or object items.
    """
    data = json.loads(file_content)
    if isinstance(data, dict):
        # Look for common list keys
        for key in ["items", "records", "data", "results", "articles"]:
            if key in data and isinstance(data[key], list):
                data = data[key]
                break
        if isinstance(data, dict):
            data = [data]

    records = []
    skipped = 0
    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            skipped += 1
            continue

        title = item.get("title") or item.get("name") or item.get("id") or f"Record {idx+1}"
        desc = item.get("description") or item.get("summary") or item.get("text") or ""
        url = item.get("url") or item.get("link") or f"local://import/json/item-{idx+1}"
        author = item.get("author") or item.get("by") or "JSON Import"
        tags = item.get("tags") or item.get("category") or "JSON Import"
        if isinstance(tags, list):
            tags = ", ".join(str(t) for t in tags)

        records.append({
            "title": str(title),
            "description": str(desc),
            "content": json.dumps(item, ensure_ascii=False),
            "original_url": str(url),
            "author": str(author),
            "published_at": datetime.utcnow(),
            "tags": str(tags),
            "category": "Dataset / File",
            "metadata": {"raw_json": item}
        })

    summary = {
        "total_items": len(records) + skipped,
        "valid_records": len(records),
        "skipped_items": skipped
    }
    return records, summary

