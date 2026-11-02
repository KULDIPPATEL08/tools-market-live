import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Quote,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchProject, ResearchNote, ResearchEvidence } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const ResearchWorkspacePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  // New Project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projQuestion, setProjQuestion] = useState('');
  const [projTags, setProjTags] = useState('');

  // New Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMarkdown, setNoteMarkdown] = useState('');

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['research-projects'],
    queryFn: api.getProjects,
  });

  // Default selection to first project
  const currentProject = projects?.find((p) => p.id === (selectedProjectId || projects[0]?.id));

  const createProjectMutation = useMutation({
    mutationFn: (data: Partial<ResearchProject>) => api.createProject(data),
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setSelectedProjectId(newProj.id);
      setIsNewProjectModalOpen(false);
      setProjTitle('');
      setProjDesc('');
      setProjQuestion('');
      setProjTags('');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setSelectedProjectId(null);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: { projectId: number; title: string; content_markdown: string }) =>
      api.addNote(data.projectId, { title: data.title, content_markdown: data.content_markdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setIsNewNoteModalOpen(false);
      setNoteTitle('');
      setNoteMarkdown('');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => api.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
    },
  });

  const removeEvidenceMutation = useMutation({
    mutationFn: (evidenceId: number) => api.removeEvidence(evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Research Workspace</span>
            <span className="text-xs font-mono font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Evidence & Dossiers
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesize findings, maintain markdown research dossiers, and cite verified evidence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentProject && (
            <a
              href={`/api/v1/export/projects/${currentProject.id}/markdown`}
              download
              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              Export Dossier (.md)
            </a>
          )}
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Plus className="w-3 h-3" />}
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {projectsLoading ? (
        <LoadingSkeleton rows={4} />
      ) : projects?.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-zinc-500" />}
          title="No Research Projects"
          description="Create your first structured research dossier to organize collected evidence, write technical notes, and formulate conclusions."
          actionLabel="Create Research Project"
          onAction={() => setIsNewProjectModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects Sidebar */}
          <div className="space-y-3 lg:col-span-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block px-1 tracking-wider">
              PROJECTS ({projects?.length})
            </span>
            <div className="space-y-1.5">
              {projects?.map((proj) => {
                const isSelected = (currentProject?.id || projects[0]?.id) === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-850 text-white border-zinc-700 shadow-subtle'
                        : 'bg-[#0E0E12] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-500">
                      <span>{proj.notes?.length || 0} notes • {proj.evidence?.length || 0} citations</span>
                      <span>{new Date(proj.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Details View */}
          {currentProject && (
            <div className="lg:col-span-3 space-y-6">
              {/* Project Banner Card */}
              <div className="antigravity-card rounded-2xl p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentProject.title}</h2>
                    {currentProject.research_question && (
                      <div className="mt-2 p-3 bg-space-950/80 border border-slate-800 rounded-lg text-xs text-sky-300 font-mono flex items-start space-x-2">
                        <Quote className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Core Question:</strong> {currentProject.research_question}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${currentProject.title}"?`)) {
                        deleteProjectMutation.mutate(currentProject.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {currentProject.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProject.description}
                  </p>
                )}

                {currentProject.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentProject.tags.split(',').map((tag) => (
                      <Badge key={tag} variant="purple" size="sm">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Research Notes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                      Research Notes ({currentProject.notes?.length || 0})
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsNewNoteModalOpen(true)}
                  >
                    Add Note
                  </Button>
                </div>

                {currentProject.notes?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-space-800/40 border border-dashed border-slate-800 rounded-xl">
                    No notes written for this dossier yet. Click "Add Note" to record analytical findings.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentProject.notes?.map((note) => (
                      <Card key={note.id} className="p-5 border-slate-800">
                        <div className="flex items-start justify-between mb-3 pb-2 border-b border-slate-800/60">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">{note.title}</h4>
                            <span className="text-[10px] font-mono text-slate-500">
                              Updated {new Date(note.updated_at).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {note.content_markdown}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Attached Evidence & Citations Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Quote className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    Grounded Citations & Evidence ({currentProject.evidence?.length || 0})
                  </h3>
                </div>

                {currentProject.evidence?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-space-800/40 border border-dashed border-slate-800 rounded-xl">
                    No evidence records linked. You can attach records from the Discover page.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentProject.evidence?.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-xl bg-space-800/60 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <a
                            href={ev.record?.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-slate-200 hover:text-sky-300 flex items-center space-x-1"
                          >
                            <span>{ev.record?.title}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          {ev.notes && (
                            <p className="text-[11px] text-slate-400 italic">"{ev.notes}"</p>
                          )}
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Source: {ev.record?.source_name || ev.record?.source_type} • Quality: {ev.record?.quality_score}
                          </span>
                        </div>

                        <button
                          onClick={() => removeEvidenceMutation.mutate(ev.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                          title="Remove citation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create Research Project"
        subtitle="Formulate an intelligence dossier to track specific hypotheses or technology benchmarks."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createProjectMutation.mutate({
              title: projTitle,
              description: projDesc,
              research_question: projQuestion,
              tags: projTags,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Self-Hosted Vector Search Reliability"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Research Question
            </label>
            <input
              type="text"
              placeholder="e.g. Which open source vector index achieves lowest p99 query latency?"
              value={projQuestion}
              onChange={(e) => setProjQuestion(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Project objective, scope, and expected deliverables..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="VectorDB, Benchmark, Latency"
              value={projTags}
              onChange={(e) => setProjTags(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Note Modal */}
      <Modal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        title="Add Research Note"
        subtitle="Record observations, markdown notes, code snippets, or synthesis."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentProject) {
              addNoteMutation.mutate({
                projectId: currentProject.id,
                title: noteTitle,
                content_markdown: noteMarkdown,
              });
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Note Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Comparative Latency Findings"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Markdown Content
            </label>
            <textarea
              rows={8}
              required
              placeholder="Write markdown notes, bullet points, findings..."
              value={noteMarkdown}
              onChange={(e) => setNoteMarkdown(e.target.value)}
              className="w-full bg-space-900 font-mono border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={addNoteMutation.isPending}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

