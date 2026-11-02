from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User & Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Source
class SourceCreate(BaseModel):
    name: str
    type: str  # rss, github, hackernews, webpage, file, api
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "Technology"
    fetch_interval_minutes: Optional[int] = 60
    config_json: Optional[str] = "{}"

class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    fetch_interval_minutes: Optional[int] = None
    config_json: Optional[str] = None

class SourceResponse(BaseModel):
    id: int
    name: str
    type: str
    url: Optional[str] = None
    description: Optional[str] = None
    category: str
    status: str
    fetch_interval_minutes: int
    last_synced_at: Optional[datetime] = None
    error_message: Optional[str] = None
    records_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# Collection Job
class CollectionJobResponse(BaseModel):
    id: int
    source_id: int
    status: str
    records_retrieved: int
    records_saved: int
    duplicates_detected: int
    error_message: Optional[str] = None
    trigger_type: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Collected Record
class CollectedRecordResponse(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: Optional[str] = None
    source_type: Optional[str] = None
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    original_url: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    collected_at: datetime
    tags: Optional[str] = ""
    category: str
    quality_score: float
    relevance_score: float
    is_saved: bool
    is_bookmarked: bool
    metadata_json: Optional[str] = "{}"

    class Config:
        from_attributes = True

# Research Project & Notes
class ResearchNoteCreate(BaseModel):
    title: str
    content_markdown: str

class ResearchNoteResponse(BaseModel):
    id: int
    project_id: int
    title: str
    content_markdown: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResearchEvidenceCreate(BaseModel):
    record_id: int
    notes: Optional[str] = None

class ResearchEvidenceResponse(BaseModel):
    id: int
    project_id: int
    record_id: int
    notes: Optional[str] = None
    created_at: datetime
    record: Optional[CollectedRecordResponse] = None

    class Config:
        from_attributes = True

class ResearchProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    research_question: Optional[str] = None
    tags: Optional[str] = ""

class ResearchProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    research_question: Optional[str] = None
    tags: Optional[str] = ""
    created_at: datetime
    updated_at: datetime
    notes: List[ResearchNoteResponse] = []
    evidence: List[ResearchEvidenceResponse] = []

    class Config:
        from_attributes = True

# Intelligence Gap
class GapCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Research Gap"
    priority: Optional[str] = "medium"
    evidence_summary: Optional[str] = None
    suggested_actions: Optional[str] = None
    related_tags: Optional[str] = ""

class GapUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    suggested_actions: Optional[str] = None

class GapResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    evidence_summary: Optional[str] = None
    suggested_actions: Optional[str] = None
    related_tags: Optional[str] = ""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Automation
class AutomationRuleCreate(BaseModel):
    name: str
    trigger_type: str
    schedule_interval_minutes: Optional[int] = 60
    action_type: str
    config_json: Optional[str] = "{}"

class AutomationRuleResponse(BaseModel):
    id: int
    name: str
    trigger_type: str
    schedule_interval_minutes: int
    action_type: str
    config_json: str
    is_active: bool
    last_run_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Notifications
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# AI Assistant
class AskAssistantRequest(BaseModel):
    question: str
    mode: Optional[str] = "collection_aware"
    context_record_ids: Optional[List[int]] = None

class AssistantResponse(BaseModel):
    provider: str
    model: str
    answer: str
    citations: List[Dict[str, Any]] = []
    is_ai_generated: bool

# Metrics
class OverviewMetricsResponse(BaseModel):
    total_records: int
    active_sources: int
    total_jobs: int
    saved_research: int
    collection_success_rate: float
    duplicate_count: int
    gaps_count: int

