from typing import List, Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/datasets", tags=["Dataset Explorer"])

VERIFIED_PUBLIC_DATASETS = [
    {
        "id": "ds-1",
        "title": "The Pile (Open-Source Language Modeling Dataset)",
        "category": "NLP / Language Models",
        "description": "An 825 GiB diverse, open-source language modelling data set that consists of 22 smaller, high-quality datasets combined.",
        "source": "EleutherAI / Academic",
        "license": "Various Permissive / MIT / Apache 2.0 (Check Component Licenses)",
        "license_url": "https://pile.eleuther.ai/",
        "formats": ["JSONL", "Parquet"],
        "size": "825 GB",
        "tags": ["NLP", "LLM", "Research", "Text"],
        "downloads_or_citations": "1,450+ citations"
    },
    {
        "id": "ds-2",
        "title": "ArXiv Computer Science & Math Papers Metadata",
        "category": "Scientific Research",
        "description": "Comprehensive metadata of over 1.7 million scholarly articles in STEM fields, including abstracts, titles, categories, and DOIs.",
        "source": "Cornell University / Kaggle Open Data",
        "license": "CC0: Public Domain",
        "license_url": "https://creativecommons.org/publicdomain/zero/1.0/",
        "formats": ["JSON", "CSV"],
        "size": "3.8 GB",
        "tags": ["Science", "Papers", "Metadata", "Citations"],
        "downloads_or_citations": "98,000+ views"
    },
    {
        "id": "ds-3",
        "title": "Common Voice Multilingual Speech Dataset",
        "category": "Audio / Speech",
        "description": "Mozilla's initiative to help teach machines how real people speak. Over 20,000 hours of transcribed audio across 100+ languages.",
        "source": "Mozilla Foundation",
        "license": "CC0: Public Domain",
        "license_url": "https://commonvoice.mozilla.org/",
        "formats": ["MP3", "TSV"],
        "size": "85 GB",
        "tags": ["Speech", "Audio", "Multilingual", "Voice"],
        "downloads_or_citations": "15,000+ downloads"
    },
    {
        "id": "ds-4",
        "title": "ImageNet (ILSVRC Benchmark)",
        "category": "Computer Vision",
        "description": "Organized according to WordNet hierarchy with over 14 million images annotated for object detection and visual recognition.",
        "source": "Stanford Vision Lab",
        "license": "Custom Academic / Non-Commercial Research License",
        "license_url": "https://www.image-net.org/download.php",
        "formats": ["JPEG", "Annotations XML"],
        "size": "150 GB",
        "tags": ["Vision", "Classification", "Images", "Benchmark"],
        "downloads_or_citations": "45,000+ citations"
    },
    {
        "id": "ds-5",
        "title": "BigCode: The Stack (Permissively Licensed Source Code)",
        "category": "Code Intelligence",
        "description": "Over 6TB of permissively licensed source code files in 300+ programming languages, filtered for malicious code and opt-outs.",
        "source": "Hugging Face / BigCode Project",
        "license": "Permissive (MIT, Apache 2.0, BSD)",
        "license_url": "https://huggingface.co/datasets/bigcode/the-stack",
        "formats": ["Parquet", "JSONL"],
        "size": "6.4 TB",
        "tags": ["Code", "AI", "GitHub", "Programming"],
        "downloads_or_citations": "250,000+ downloads"
    },
    {
        "id": "ds-6",
        "title": "NASA Global Landslide Catalog",
        "category": "Geospatial / Climate",
        "description": "Global records of rainfall-triggered landslide events reported in open literature and disaster response agencies from 2007 to present.",
        "source": "NASA Open Data Portal",
        "license": "Public Domain (NASA Open Data Policy)",
        "license_url": "https://data.nasa.gov/",
        "formats": ["CSV", "GeoJSON"],
        "size": "45 MB",
        "tags": ["Climate", "Disaster", "Geospatial", "Earth Science"],
        "downloads_or_citations": "12,000+ downloads"
    }
]

@router.get("")
def list_datasets(
    q: Optional[str] = None,
    category: Optional[str] = None
):
    results = VERIFIED_PUBLIC_DATASETS
    if category:
        results = [d for d in results if category.lower() in d["category"].lower()]
    if q:
        q_low = q.lower()
        results = [
            d for d in results
            if q_low in d["title"].lower()
            or q_low in d["description"].lower()
            or any(q_low in t.lower() for t in d["tags"])
        ]
    return results
