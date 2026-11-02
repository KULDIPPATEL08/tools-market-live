export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export type SourceType = 'rss' | 'github' | 'hackernews' | 'webpage' | 'file' | 'api' | 'reddit' | 'huggingface' | 'technews';
export type SourceStatus = 'active' | 'paused' | 'syncing' | 'failed' | 'disconnected';

export interface Source {
  id: number;
  name: string;
  type: SourceType;
  url?: string;
  description?: string;
  category: string;
  status: SourceStatus;
  fetch_interval_minutes: number;
  last_synced_at?: string;
  error_message?: string;
  records_count: number;
  created_at: string;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'partial';

export interface CollectionJob {
  id: number;
  source_id: number;
  status: JobStatus;
  records_retrieved: number;
  records_saved: number;
  duplicates_detected: number;
  error_message?: string;
  trigger_type: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CollectedRecord {
  id: number;
  source_id?: number;
  source_name?: string;
  source_type?: string;
  title: string;
  description?: string;
  content?: string;
  original_url: string;
  author?: string;
  published_at?: string;
  collected_at: string;
  tags?: string;
  category: string;
  quality_score: number;
  relevance_score: number;
  is_saved: boolean;
  is_bookmarked: boolean;
  metadata_json?: string;
}

export interface ResearchNote {
  id: number;
  project_id: number;
  title: string;
  content_markdown: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchEvidence {
  id: number;
  project_id: number;
  record_id: number;
  notes?: string;
  created_at: string;
  record?: CollectedRecord;
}

export interface ResearchProject {
  id: number;
  title: string;
  description?: string;
  research_question?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  notes: ResearchNote[];
  evidence: ResearchEvidence[];
}

export type GapStatus = 'new' | 'investigating' | 'in_progress' | 'resolved' | 'archived';
export type GapPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Gap {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: GapPriority;
  status: GapStatus;
  evidence_summary?: string;
  suggested_actions?: string;
  related_tags?: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  license: string;
  license_url: string;
  formats: string[];
  size: string;
  tags: string[];
  downloads_or_citations: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  trigger_type: string;
  schedule_interval_minutes: number;
  action_type: string;
  config_json: string;
  is_active: boolean;
  last_run_at?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface OverviewMetrics {
  total_records: number;
  active_sources: number;
  total_jobs: number;
  saved_research: number;
  collection_success_rate: number;
  duplicate_count: number;
  gaps_count: number;
}

export interface Startup {
  id: number;
  name: string;
  tagline?: string;
  description?: string;
  website?: string;
  founding_year?: number;
  stage: string;
  funding_status: string;
  total_raised_usd?: number;
  country: string;
  city?: string;
  is_india: boolean;
  is_gujarat: boolean;
  industry: string;
  founders?: string;
  products?: string;
  batch?: string;
  opportunity_score: number;
  is_dead: boolean;
  dead_reason?: string;
  gap_opportunity?: string;
  created_at: string;
}

export interface StartupMetrics {
  total_startups: number;
  active_startups: number;
  india_startups: number;
  gujarat_startups: number;
  post_mortems: number;
  total_funding_tracked_usd: number;
}

export interface AIModel {
  id: number;
  name: string;
  organization: string;
  release_date?: string;
  is_open_weights: boolean;
  license: string;
  context_window: number;
  parameter_count: string;
  modalities: string;
  benchmarks: Record<string, number>;
  pricing_input_per_m?: number;
  pricing_output_per_m?: number;
  overview?: string;
  strengths?: string;
  external_url?: string;
}

export interface AIBenchmarkItem {
  name: string;
  organization: string;
  is_open_weights: boolean;
  context_window: number;
  mmlu: number;
  arena_elo: number;
  humaneval: number;
  math: number;
  license: string;
}

export interface AIPaper {
  id: number;
  title: string;
  summary: string;
  url: string;
  authors: string;
  published_at?: string;
  quality_score: number;
  tags: string[];
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  published_date?: string;
  relevance_score: number;
  domain?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  mode: string;
  provider: string;
  total_results: number;
  results: SearchResultItem[];
  synthesis?: string;
  key_takeaways: string[];
}

export interface IntelligenceBriefing {
  id: number;
  title: string;
  briefing_type: string;
  date?: string;
  executive_summary: string;
  key_developments: string[];
  strategic_takeaways: string[];
  sources_cited: { title: string; url: string }[];
  created_at: string;
}

