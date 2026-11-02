import {
  User,
  Source,
  CollectionJob,
  CollectedRecord,
  ResearchProject,
  ResearchNote,
  ResearchEvidence,
  Gap,
  Dataset,
  AutomationRule,
  NotificationItem,
  OverviewMetrics,
} from '../types';

const BASE_URL = '/api/v1';

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('scoutboard_token');
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      errMsg = errData.detail || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(formData: URLSearchParams) {
    return fetchJSON<{ access_token: string; token_type: string }>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
  },
  async getMe() {
    return fetchJSON<User>(`${BASE_URL}/auth/me`);
  },

  // Sources
  async getSources(params?: { q?: string; type?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    return fetchJSON<Source[]>(`${BASE_URL}/sources?${query.toString()}`);
  },
  async createSource(data: Partial<Source>) {
    return fetchJSON<Source>(`${BASE_URL}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteSource(id: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/sources/${id}`, { method: 'DELETE' });
  },
  async syncSource(id: number) {
    return fetchJSON<CollectionJob>(`${BASE_URL}/sources/${id}/sync`, { method: 'POST' });
  },

  // Collection Jobs
  async getJobs(params?: { status?: string; source_id?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.source_id) query.set('source_id', params.source_id.toString());
    return fetchJSON<CollectionJob[]>(`${BASE_URL}/collection/jobs?${query.toString()}`);
  },
  async retryJob(id: number) {
    return fetchJSON<CollectionJob>(`${BASE_URL}/collection/jobs/${id}/retry`, { method: 'POST' });
  },

  // Records & Discovery
  async getRecords(params?: {
    q?: string;
    category?: string;
    source_type?: string;
    source_id?: number;
    is_saved?: boolean;
    is_bookmarked?: boolean;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    if (params?.source_type) query.set('source_type', params.source_type);
    if (params?.source_id) query.set('source_id', params.source_id.toString());
    if (params?.is_saved !== undefined) query.set('is_saved', params.is_saved.toString());
    if (params?.is_bookmarked !== undefined) query.set('is_bookmarked', params.is_bookmarked.toString());
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJSON<CollectedRecord[]>(`${BASE_URL}/records?${query.toString()}`);
  },
  async toggleSaveRecord(id: number) {
    return fetchJSON<{ id: number; is_saved: boolean }>(`${BASE_URL}/records/${id}/toggle-save`, { method: 'POST' });
  },
  async toggleBookmarkRecord(id: number) {
    return fetchJSON<{ id: number; is_bookmarked: boolean }>(`${BASE_URL}/records/${id}/toggle-bookmark`, { method: 'POST' });
  },
  async getCategories() {
    return fetchJSON<{ category: string; count: number }[]>(`${BASE_URL}/records/categories`);
  },

  // Research Projects
  async getProjects() {
    return fetchJSON<ResearchProject[]>(`${BASE_URL}/research/projects`);
  },
  async getProject(id: number) {
    return fetchJSON<ResearchProject>(`${BASE_URL}/research/projects/${id}`);
  },
  async createProject(data: Partial<ResearchProject>) {
    return fetchJSON<ResearchProject>(`${BASE_URL}/research/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteProject(id: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/research/projects/${id}`, { method: 'DELETE' });
  },
  async addNote(projectId: number, data: { title: string; content_markdown: string }) {
    return fetchJSON<ResearchNote>(`${BASE_URL}/research/projects/${projectId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteNote(noteId: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/research/notes/${noteId}`, { method: 'DELETE' });
  },
  async attachEvidence(projectId: number, data: { record_id: number; notes?: string }) {
    return fetchJSON<ResearchEvidence>(`${BASE_URL}/research/projects/${projectId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async removeEvidence(evidenceId: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/research/evidence/${evidenceId}`, { method: 'DELETE' });
  },

  // Intelligence Gaps
  async getGaps(params?: { status?: string; priority?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    return fetchJSON<Gap[]>(`${BASE_URL}/gaps?${query.toString()}`);
  },
  async detectGaps() {
    return fetchJSON<Gap[]>(`${BASE_URL}/gaps/detect`, { method: 'POST' });
  },
  async createGap(data: Partial<Gap>) {
    return fetchJSON<Gap>(`${BASE_URL}/gaps`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateGap(id: number, data: Partial<Gap>) {
    return fetchJSON<Gap>(`${BASE_URL}/gaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async deleteGap(id: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/gaps/${id}`, { method: 'DELETE' });
  },

  // Datasets
  async getDatasets(params?: { q?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.category) query.set('category', params.category);
    return fetchJSON<Dataset[]>(`${BASE_URL}/datasets?${query.toString()}`);
  },

  // Tools
  async collectUrl(url: string, save_to_records: boolean = true) {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('save_to_records', save_to_records ? 'true' : 'false');
    return fetchJSON<any>(`${BASE_URL}/tools/collect-url`, {
      method: 'POST',
      body: formData,
    });
  },
  async importFile(file: File, fieldMapping?: Record<string, string>) {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldMapping) {
      formData.append('field_mapping', JSON.stringify(fieldMapping));
    }
    return fetchJSON<any>(`${BASE_URL}/tools/import-file`, {
      method: 'POST',
      body: formData,
    });
  },
  async getDuplicateStats() {
    return fetchJSON<{ potential_duplicate_groups: number; details: any[] }>(`${BASE_URL}/tools/duplicate-stats`);
  },

  // Analytics & Health
  async getOverviewMetrics() {
    return fetchJSON<OverviewMetrics>(`${BASE_URL}/analytics/overview`);
  },
  async getChartsData() {
    return fetchJSON<{
      category_distribution: { name: string; value: number }[];
      source_breakdown: { name: string; records: number }[];
      job_status_breakdown: { status: string; count: number }[];
      quality_distribution: { tier: string; count: number }[];
    }>(`${BASE_URL}/analytics/charts`);
  },

  // Automation
  async getRules() {
    return fetchJSON<AutomationRule[]>(`${BASE_URL}/automation/rules`);
  },
  async createRule(data: Partial<AutomationRule>) {
    return fetchJSON<AutomationRule>(`${BASE_URL}/automation/rules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async runRule(id: number) {
    return fetchJSON<any>(`${BASE_URL}/automation/rules/${id}/run`, { method: 'POST' });
  },
  async deleteRule(id: number) {
    return fetchJSON<{ message: string }>(`${BASE_URL}/automation/rules/${id}`, { method: 'DELETE' });
  },

  // Notifications
  async getNotifications() {
    return fetchJSON<NotificationItem[]>(`${BASE_URL}/notifications`);
  },
  async getUnreadNotificationCount() {
    return fetchJSON<{ unread_count: number }>(`${BASE_URL}/notifications/unread-count`);
  },
  async markNotificationRead(id: number) {
    return fetchJSON<{ status: string }>(`${BASE_URL}/notifications/${id}/read`, { method: 'POST' });
  },
  async markAllNotificationsRead() {
    return fetchJSON<{ status: string }>(`${BASE_URL}/notifications/read-all`, { method: 'POST' });
  },

  // AI Assistant
  async askAI(question: string, mode?: string, context_record_ids?: number[]) {
    return fetchJSON<{
      provider: string;
      model: string;
      answer: string;
      citations: any[];
      is_ai_generated: boolean;
    }>(`${BASE_URL}/ai/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, mode, context_record_ids }),
    });
  },
};
