import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.models.record import CollectedRecord
from backend.app.models.source import Source
from backend.app.services.connectors.webpage import fetch_webpage
from backend.app.services.connectors.file_importer import parse_csv_data, parse_json_data
from backend.app.services.deduplication import generate_fingerprint, calculate_quality_score

router = APIRouter(prefix="/tools", tags=["Tools Workspace"])

@router.post("/collect-url")
async def collect_url_tool(
    url: str = Form(...),
    save_to_records: bool = Form(True),
    db: Session = Depends(get_db)
):
    """
    On-demand URL Collector tool.
    Extracts metadata, body text, and optionally saves directly into Scoutboard records.
    """
    try:
        extracted = await fetch_webpage(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    saved_record_id = None
    if save_to_records:
        fingerprint = generate_fingerprint(extracted["original_url"], extracted["title"], extracted["content"])
        existing = db.query(CollectedRecord).filter(CollectedRecord.content_fingerprint == fingerprint).first()
        if existing:
            return {
                "extracted": extracted,
                "status": "duplicate",
                "message": "This URL is already collected in your Scoutboard database.",
                "record_id": existing.id
            }

        rec = CollectedRecord(
            title=extracted["title"][:512],
            description=extracted["description"],
            content=extracted["content"],
            original_url=extracted["original_url"],
            author=extracted["author"],
            published_at=extracted["published_at"],
            tags=extracted["tags"],
            category=extracted["category"],
            content_fingerprint=fingerprint,
            quality_score=calculate_quality_score(extracted),
            metadata_json=json.dumps(extracted["metadata"])
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        saved_record_id = rec.id

    return {
        "status": "success",
        "extracted": extracted,
        "saved_record_id": saved_record_id
    }

@router.post("/import-file")
async def import_file_tool(
    file: UploadFile = File(...),
    field_mapping: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    File ingestion tool supporting CSV and JSON with schema mapping.
    """
    filename = file.filename or "unknown"
    content_bytes = await file.read()
    
    if len(content_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size (10MB).")

    try:
        text_content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content_bytes.decode("latin-1")

    parsed_records = []
    summary = {}

    mapping_dict = None
    if field_mapping:
        try:
            mapping_dict = json.loads(field_mapping)
        except Exception:
            pass

    if filename.endswith(".csv"):
        parsed_records, summary = parse_csv_data(text_content, field_mapping=mapping_dict)
    elif filename.endswith(".json"):
        parsed_records, summary = parse_json_data(text_content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or JSON.")

    # Save records with deduplication
    saved_count = 0
    duplicate_count = 0

    # Ensure a source exists for this file
    source_name = f"Import: {filename}"
    source = db.query(Source).filter(Source.name == source_name).first()
    if not source:
        source = Source(
            name=source_name,
            type="file",
            category="Dataset / File",
            status="active",
            description=f"Imported from file {filename} ({len(parsed_records)} rows)"
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    for item in parsed_records:
        fp = generate_fingerprint(item["original_url"], item["title"], item.get("content", ""))
        existing = db.query(CollectedRecord).filter(CollectedRecord.content_fingerprint == fp).first()
        if existing:
            duplicate_count += 1
            continue

        rec = CollectedRecord(
            source_id=source.id,
            source_name=source.name,
            source_type="file",
            title=item["title"][:512],
            description=item["description"],
            content=item["content"],
            original_url=item["original_url"],
            author=item["author"],
            published_at=item["published_at"],
            tags=item["tags"],
            category=item["category"],
            content_fingerprint=fp,
            quality_score=calculate_quality_score(item),
            metadata_json=json.dumps(item.get("metadata", {}))
        )
        db.add(rec)
        saved_count += 1

    source.records_count = (source.records_count or 0) + saved_count
    db.commit()

    summary["saved_to_db"] = saved_count
    summary["duplicates_skipped"] = duplicate_count
    summary["source_id"] = source.id

    return {
        "status": "success",
        "summary": summary,
        "sample_records": parsed_records[:5]
    }

@router.get("/duplicate-stats")
def get_duplicate_stats(db: Session = Depends(get_db)):
    """Scans for potential duplicate titles across records."""
    dupe_titles = (
        db.query(CollectedRecord.title, func.count(CollectedRecord.id).label("count"))
        .group_by(CollectedRecord.title)
        .having(func.count(CollectedRecord.id) > 1)
        .all()
    )
    return {
        "potential_duplicate_groups": len(dupe_titles),
        "details": [{"title": t[0], "count": t[1]} for t in dupe_titles[:10]]
    }

