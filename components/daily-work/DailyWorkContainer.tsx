'use client';

import React, { useState } from 'react';
import {
  ActionItem,
  KeyResult,
  Objective,
  Profile,
  Venture,
} from '@/lib/types';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import {
  formatDateDDMMYYYY,
  getHealthBadge,
  isOverdue,
} from '@/lib/utils';
import {
  Briefcase,
  Layers,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Paperclip,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertTriangle,
  Trash2,
  Activity,
  CheckCheck,
  Compass,
} from 'lucide-react';
import { updateVentureLead, deleteActionItem } from '@/app/actions/work-actions';
import { VentureDocumentsDrawer } from '../venture/VentureDocumentsDrawer';
import { FeedbackLogModal } from './FeedbackLogModal';
import { SubmitReviewModal } from './SubmitReviewModal';
import { FounderReviewModal } from './FounderReviewModal';
import { AddActionItemModal } from './AddActionItemModal';
import { AddObjectiveModal } from './AddObjectiveModal';
import { AddKeyResultModal } from './AddKeyResultModal';

interface DailyWorkContainerProps {
  initialData: {
    profiles: Profile[];
    ventures: Venture[];
    objectives: Objective[];
    keyResults: KeyResult[];
    actionItems: ActionItem[];
    myVentureIds: string[];
  };
  onRefresh: () => void;
}

export function DailyWorkContainer({ initialData, onRefresh }: DailyWorkContainerProps) {
  const { effectiveProfile, activeProfile } = useActiveProfile();
  const isFounder = activeProfile?.role === 'founder';

  const {
    profiles,
    ventures,
    objectives,
    keyResults,
    actionItems,
    myVentureIds,
  } = initialData;

  // View mode: 'by_venture' | 'by_lead'
  const [viewMode, setViewMode] = useState<'by_venture' | 'by_lead'>('by_venture');

  // Filter mode: 'all' | 'my_ventures'
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my_ventures'>('all');

  // Status Filter Pill
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded ventures and objectives
  const [expandedVentures, setExpandedVentures] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ventures.forEach((v, idx) => {
      init[v.id] = idx === 0; // expand first venture by default
    });
    return init;
  });

  const [expandedObjectives, setExpandedObjectives] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    objectives.slice(0, 3).forEach((o) => {
      init[o.id] = true;
    });
    return init;
  });

  // Modals state
  const [docsVenture, setDocsVenture] = useState<Venture | null>(null);
  const [selectedLogItem, setSelectedLogItem] = useState<ActionItem | null>(null);
  const [selectedSubmitItem, setSelectedSubmitItem] = useState<ActionItem | null>(null);
  const [selectedFounderReviewItem, setSelectedFounderReviewItem] = useState<ActionItem | null>(null);

  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);
  const [selectedVentureForTask, setSelectedVentureForTask] = useState<string>('');
  const [selectedObjectiveForTask, setSelectedObjectiveForTask] = useState<string>('');

  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [selectedVentureForObjective, setSelectedVentureForObjective] = useState<string>('');

  const [isAddKrModalOpen, setIsAddKrModalOpen] = useState(false);
  const [selectedObjectiveForKr, setSelectedObjectiveForKr] = useState<Objective | null>(null);

  // Status counts for filter pills
  const submittedCount = actionItems.filter((a) => a.status === 'submitted_for_review').length;
  const needsWorkCount = actionItems.filter((a) => a.status === 'needs_work').length;
  const completedCount = actionItems.filter((a) => a.status === 'completed').length;
  const blockerCount = actionItems.filter((a) => a.status === 'blocker').length;

  const toggleVenture = (vId: string) => {
    setExpandedVentures((prev) => ({ ...prev, [vId]: !prev[vId] }));
  };

  const toggleObjective = (oId: string) => {
    setExpandedObjectives((prev) => ({ ...prev, [oId]: !prev[oId] }));
  };

  // Filter ventures by scope (cross-venture visibility)
  const filteredVentures = ventures.filter((v) => {
    if (scopeFilter === 'my_ventures' && effectiveProfile) {
      return myVentureIds.includes(v.id);
    }
    return true;
  });

  const handleReassignLead = async (ventureId: string, leadId: string) => {
    const profile = profiles.find((p) => p.id === leadId);
    await updateVentureLead({
      ventureId,
      leadId: leadId || null,
      leadTitle: profile?.lead_title || 'Venture Lead',
    });
    onRefresh();
  };

  const handleDeleteTask = async (actionItemId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;
    await deleteActionItem(actionItemId);
    onRefresh();
  };

  // Dynamic Grouping by all active Venture Leads
  const dynamicLeads = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; slug: string; title: string; count: number }
    >();

    filteredVentures.forEach((v) => {
      const leadId = v.lead?.id || 'unassigned';
      const leadName = v.lead?.full_name || 'Unassigned Lead';
      const leadSlug = v.lead?.slug || 'unassigned';
      const leadTitle = v.lead_title || 'Venture Lead';

      const curr = map.get(leadId) || {
        id: leadId,
        name: leadName,
        slug: leadSlug,
        title: leadTitle,
        count: 0,
      };
      curr.count += 1;
      map.set(leadId, curr);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredVentures]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Precision Operations Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-5 sm:p-6 rounded-xl shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>TAB 1 // DAILY OPERATIONS</span>
              <span className="text-zinc-600">•</span>
              <span>13 Ventures</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">
              Daily Work & OKR Hierarchy
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-normal leading-relaxed">
              Track portfolio execution, review approvals, and real-time Key Result progress across all 13 ventures.
            </p>
          </div>

          {/* Controls & Creation CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dual View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => setViewMode('by_venture')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'by_venture'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                By Venture (13)
              </button>
              <button
                onClick={() => setViewMode('by_lead')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'by_lead'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                By Lead
              </button>
            </div>

            {/* Scope Filter */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All 13
              </button>
              <button
                onClick={() => setScopeFilter('my_ventures')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  scopeFilter === 'my_ventures'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Ventures ({myVentureIds.length})
              </button>
            </div>

            {/* New Task Button */}
            <button
              onClick={() => {
                setSelectedVentureForTask(ventures[0]?.id || '');
                setIsAddActionModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action Item</span>
            </button>
          </div>
        </div>

        {/* Live Mini-Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-zinc-800/80">
          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{ventures.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Ventures Portfolio</div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{objectives.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Seeded Objectives</div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-emerald-300 font-mono">{completedCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Completed Items</div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-amber-300 font-mono">{submittedCount + needsWorkCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Review Pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Active Work' },
            {
              id: 'submitted_for_review',
              label: 'In Review',
              badge: submittedCount,
              badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
            },
            {
              id: 'needs_work',
              label: 'Needs Work',
              badge: needsWorkCount,
              badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
            },
            { id: 'completed', label: 'Completed', badge: completedCount, badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
            { id: 'blocker', label: 'Blockers', badge: blockerCount, badgeColor: 'bg-red-500/10 text-red-300 border-red-500/30' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>{pill.label}</span>
              {pill.badge !== undefined && pill.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                    pill.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {pill.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, OKRs, assignees..."
            className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 text-zinc-100 pl-8 pr-3 py-1.5 rounded-lg text-xs placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {filteredVentures.length === 0 ? (
        <div className="p-10 sm:p-16 rounded-3xl glass-panel border border-white/10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Assigned Ventures Found</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              You currently have no action items or OKRs assigned under this scope filter.
              Switch to viewing all 13 ventures to explore the active portfolio.
            </p>
          </div>
          <button
            onClick={() => setScopeFilter('all')}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 border border-white/20 transition-all cursor-pointer"
          >
            View All 13 Ventures
          </button>
        </div>
      ) : viewMode === 'by_venture' ? (
        // Standard 13-Venture Board
        <div className="space-y-5">
          {filteredVentures.map((venture) => (
            <VentureSection
              key={venture.id}
              venture={venture}
              profiles={profiles}
              isExpanded={!!expandedVentures[venture.id]}
              onToggle={() => toggleVenture(venture.id)}
              objectives={objectives.filter((o) => o.venture_id === venture.id)}
              keyResults={keyResults.filter((k) => k.venture_id === venture.id)}
              actionItems={actionItems.filter((a) => a.venture_id === venture.id)}
              expandedObjectives={expandedObjectives}
              toggleObjective={toggleObjective}
              statusFilter={statusFilter}
              searchQuery={searchQuery}
              onOpenDocs={() => setDocsVenture(venture)}
              onAddTask={() => {
                setSelectedVentureForTask(venture.id);
                setIsAddActionModalOpen(true);
              }}
              onAddObjective={() => {
                setSelectedVentureForObjective(venture.id);
                setIsAddObjectiveModalOpen(true);
              }}
              onAddKr={(obj) => {
                setSelectedObjectiveForKr(obj);
                setIsAddKrModalOpen(true);
              }}
              onOpenLogs={(item) => setSelectedLogItem(item)}
              onSubmitReview={(item) => setSelectedSubmitItem(item)}
              onFounderReview={(item) => setSelectedFounderReviewItem(item)}
              onReassignLead={handleReassignLead}
              onDeleteTask={handleDeleteTask}
              effectiveProfile={effectiveProfile}
              isFounder={isFounder}
            />
          ))}
        </div>
      ) : (
        // Dynamic Grouping by Venture Lead
        <div className="space-y-9">
          {dynamicLeads.map((lead) => {
            const leadVentures = filteredVentures.filter((v) =>
              lead.id === 'unassigned' ? !v.lead_id : v.lead_id === lead.id
            );
            if (leadVentures.length === 0) return null;

            return (
              <div key={lead.id} className="space-y-4">
                <div className="flex items-center gap-3.5 pb-3 border-b border-white/[0.08]">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-white/20 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      {lead.name}
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
                        {leadVentures.length} {leadVentures.length === 1 ? 'Venture' : 'Ventures'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">{lead.title}</p>
                  </div>
                </div>

                <div className="space-y-4 pl-0 sm:pl-2">
                  {leadVentures.map((venture) => (
                    <VentureSection
                      key={venture.id}
                      venture={venture}
                      profiles={profiles}
                      isExpanded={!!expandedVentures[venture.id]}
                      onToggle={() => toggleVenture(venture.id)}
                      objectives={objectives.filter((o) => o.venture_id === venture.id)}
                      keyResults={keyResults.filter((k) => k.venture_id === venture.id)}
                      actionItems={actionItems.filter((a) => a.venture_id === venture.id)}
                      expandedObjectives={expandedObjectives}
                      toggleObjective={toggleObjective}
                      statusFilter={statusFilter}
                      searchQuery={searchQuery}
                      onOpenDocs={() => setDocsVenture(venture)}
                      onAddTask={() => {
                        setSelectedVentureForTask(venture.id);
                        setIsAddActionModalOpen(true);
                      }}
                      onAddObjective={() => {
                        setSelectedVentureForObjective(venture.id);
                        setIsAddObjectiveModalOpen(true);
                      }}
                      onAddKr={(obj) => {
                        setSelectedObjectiveForKr(obj);
                        setIsAddKrModalOpen(true);
                      }}
                      onOpenLogs={(item) => setSelectedLogItem(item)}
                      onSubmitReview={(item) => setSelectedSubmitItem(item)}
                      onFounderReview={(item) => setSelectedFounderReviewItem(item)}
                      onReassignLead={handleReassignLead}
                      onDeleteTask={handleDeleteTask}
                      effectiveProfile={effectiveProfile}
                      isFounder={isFounder}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <VentureDocumentsDrawer
        venture={docsVenture}
        isOpen={!!docsVenture}
        onClose={() => setDocsVenture(null)}
      />

      <FeedbackLogModal
        actionItem={selectedLogItem}
        isOpen={!!selectedLogItem}
        onClose={() => setSelectedLogItem(null)}
      />

      <SubmitReviewModal
        actionItem={selectedSubmitItem}
        actorId={effectiveProfile?.id || ''}
        isOpen={!!selectedSubmitItem}
        onClose={() => setSelectedSubmitItem(null)}
        onSuccess={() => onRefresh()}
      />

      <FounderReviewModal
        actionItem={selectedFounderReviewItem}
        founderId={activeProfile?.id || ''}
        isOpen={!!selectedFounderReviewItem}
        onClose={() => setSelectedFounderReviewItem(null)}
        onSuccess={() => onRefresh()}
      />

      <AddActionItemModal
        ventures={ventures}
        profiles={profiles}
        objectives={objectives}
        keyResults={keyResults}
        preselectedVentureId={selectedVentureForTask}
        preselectedObjectiveId={selectedObjectiveForTask}
        isOpen={isAddActionModalOpen}
        onClose={() => setIsAddActionModalOpen(false)}
        onSuccess={() => onRefresh()}
      />

      <AddObjectiveModal
        ventures={ventures}
        profiles={profiles}
        preselectedVentureId={selectedVentureForObjective}
        founderId={activeProfile?.id}
        isOpen={isAddObjectiveModalOpen}
        onClose={() => setIsAddObjectiveModalOpen(false)}
        onSuccess={() => onRefresh()}
      />

      <AddKeyResultModal
        objective={selectedObjectiveForKr}
        profiles={profiles}
        isOpen={isAddKrModalOpen}
        onClose={() => setIsAddKrModalOpen(false)}
        onSuccess={() => onRefresh()}
      />
    </div>
  );
}

// ----------------------------------------------------
// Sub-Component: VentureSection (Liquid Glass Accordion)
// ----------------------------------------------------
function VentureSection({
  venture,
  profiles,
  isExpanded,
  onToggle,
  objectives,
  keyResults,
  actionItems,
  expandedObjectives,
  toggleObjective,
  statusFilter,
  searchQuery,
  onOpenDocs,
  onAddTask,
  onAddObjective,
  onAddKr,
  onOpenLogs,
  onSubmitReview,
  onFounderReview,
  onReassignLead,
  onDeleteTask,
  effectiveProfile,
  isFounder,
}: {
  venture: Venture;
  profiles: Profile[];
  isExpanded: boolean;
  onToggle: () => void;
  objectives: Objective[];
  keyResults: KeyResult[];
  actionItems: ActionItem[];
  expandedObjectives: Record<string, boolean>;
  toggleObjective: (id: string) => void;
  statusFilter: string;
  searchQuery: string;
  onOpenDocs: () => void;
  onAddTask: () => void;
  onAddObjective: () => void;
  onAddKr: (obj: Objective) => void;
  onOpenLogs: (item: ActionItem) => void;
  onSubmitReview: (item: ActionItem) => void;
  onFounderReview: (item: ActionItem) => void;
  onReassignLead: (ventureId: string, leadId: string) => void;
  onDeleteTask: (id: string) => void;
  effectiveProfile: Profile | null;
  isFounder: boolean;
}) {
  const healthBadge = getHealthBadge(venture.health);

  // Filter action items by status and search
  const matchesSearch = (text: string) =>
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesStatus = (status: string) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active')
      return status === 'in_progress' || status === 'not_started' || status === 'needs_work';
    return status === statusFilter;
  };

  const visibleActions = actionItems.filter(
    (a) =>
      matchesStatus(a.status) &&
      (matchesSearch(a.title) ||
        matchesSearch(a.assignee?.full_name || '') ||
        matchesSearch(a.outcome_achieved || ''))
  );

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden shadow-sm transition-all hover:border-zinc-700/80">
      {/* Venture Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={onToggle}>
          <button className="p-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-white transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/70">
                {venture.code}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">{venture.name}</h3>

              {/* Automated Health Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono border ${healthBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dotClass}`} />
                {healthBadge.label} Health
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 flex-wrap font-mono">
              {isFounder ? (
                <div
                  className="inline-flex items-center gap-1.5 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-zinc-500 text-xs">Lead:</span>
                  <select
                    value={venture.lead_id || ''}
                    onChange={(e) => onReassignLead(venture.id, e.target.value)}
                    className="bg-zinc-950 text-[11px] font-mono px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 cursor-pointer focus:outline-none"
                    title="Founder: Reassign Venture Lead"
                  >
                    <option value="">Unassigned</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role === 'founder' ? 'Founder' : p.lead_title || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span>
                  Lead: <strong className="text-slate-200">{venture.lead?.full_name || 'Unassigned'}</strong>
                </span>
              )}
              <span className="text-slate-600">•</span>
              <span>{objectives.length} Objectives</span>
              <span className="text-slate-600">•</span>
              <span>{keyResults.length} KRs</span>
              <span className="text-slate-600">•</span>
              <span>{actionItems.length} Actions</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-9 md:pl-0">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-all cursor-pointer border border-zinc-700/60"
            title="Open Venture Documents"
          >
            <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
            <span>Documents</span>
          </button>

          {isFounder && (
            <button
              onClick={onAddObjective}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-300 transition-all cursor-pointer border border-amber-500/30"
              title="Founder Privilege: Add Strategic Objective"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Objective</span>
            </button>
          )}

          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Accordion Body: OKRs & Action Items */}
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-white/[0.06] space-y-6 bg-black/30">
          {/* Objectives Hierarchy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Strategic Objectives ({objectives.length})
              </span>
            </div>

            {objectives.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center bg-white/[0.02] rounded-2xl border border-white/5">
                No objectives created for this venture yet.
              </div>
            ) : (
              objectives.map((obj) => {
                const objKrs = keyResults.filter((k) => k.objective_id === obj.id);
                const objActions = actionItems.filter((a) => a.objective_id === obj.id);
                const isObjExpanded = !!expandedObjectives[obj.id];

                return (
                  <div
                    key={obj.id}
                    className="rounded-2xl glass-card border border-white/[0.07] overflow-hidden shadow-sm transition-all hover:border-white/15"
                  >
                    {/* Objective Title Row */}
                    <div
                      className="p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                      onClick={() => toggleObjective(obj.id)}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <button className="mt-0.5 sm:mt-0 text-slate-400 hover:text-white transition-colors">
                          {isObjExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-700/50 shrink-0">
                          #{obj.sl_no}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                          {obj.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            obj.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : obj.status === 'blocker'
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : obj.status === 'on_hold'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : obj.status === 'dropped'
                              ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}
                        >
                          {obj.status.replace('_', ' ')}
                        </span>

                        {obj.owner && (
                          <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-mono">
                            By: <span className="text-zinc-200 font-medium">{obj.owner.full_name} (Founder)</span>
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddKr(obj);
                          }}
                          className="px-2.5 py-1 rounded-xl glass-pill hover:bg-white/10 text-[10px] font-bold text-teal-300 flex items-center gap-1 cursor-pointer border border-teal-500/30 shadow-sm"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>KR</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Key Results & Child Tasks */}
                    {isObjExpanded && (
                      <div className="p-3.5 bg-black/40 border-t border-white/5 space-y-3">
                        {/* Key Results */}
                        {objKrs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
                              <Compass className="w-3 h-3 text-teal-400" />
                              Key Results ({objKrs.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {objKrs.map((kr) => (
                                <div
                                  key={kr.id}
                                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs flex items-start justify-between gap-2 shadow-sm"
                                >
                                  <div>
                                    <div className="font-mono text-[10px] font-bold text-teal-300">
                                      KR {kr.kr_code}
                                    </div>
                                    <div className="font-medium text-slate-200 mt-1 leading-snug">
                                      {kr.title}
                                    </div>
                                    {kr.target_measure && (
                                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                                        Target: {kr.target_measure}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border ${
                                      kr.status === 'completed'
                                        ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                                        : 'text-slate-400 bg-white/5 border-white/10'
                                    }`}
                                  >
                                    {kr.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Associated Actions */}
                        {objActions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              Linked Action Items ({objActions.length})
                            </div>
                            {objActions.map((action) => (
                              <ActionItemCard
                                key={action.id}
                                action={action}
                                onOpenLogs={() => onOpenLogs(action)}
                                onSubmitReview={() => onSubmitReview(action)}
                                onFounderReview={() => onFounderReview(action)}
                                onDeleteTask={() => onDeleteTask(action.id)}
                                effectiveProfile={effectiveProfile}
                                isFounder={isFounder}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Standalone Action Items (not linked to an objective or venture-wide) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-sky-300">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                All Venture Action Items ({visibleActions.length})
              </span>
            </div>

            {visibleActions.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center bg-white/[0.02] rounded-2xl border border-white/5">
                No action items match the selected filter.
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleActions.map((action) => (
                  <ActionItemCard
                    key={action.id}
                    action={action}
                    onOpenLogs={() => onOpenLogs(action)}
                    onSubmitReview={() => onSubmitReview(action)}
                    onFounderReview={() => onFounderReview(action)}
                    onDeleteTask={() => onDeleteTask(action.id)}
                    effectiveProfile={effectiveProfile}
                    isFounder={isFounder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Sub-Component: ActionItemCard (Interactive Row)
// ----------------------------------------------------
function ActionItemCard({
  action,
  onOpenLogs,
  onSubmitReview,
  onFounderReview,
  onDeleteTask,
  effectiveProfile,
  isFounder,
}: {
  action: ActionItem;
  onOpenLogs: () => void;
  onSubmitReview: () => void;
  onFounderReview: () => void;
  onDeleteTask: () => void;
  effectiveProfile: Profile | null;
  isFounder: boolean;
}) {
  const isAssignedToMe = effectiveProfile && action.assigned_to === effectiveProfile.id;
  const overdue = action.status !== 'completed' && action.status !== 'dropped' && isOverdue(action.date);

  const getStatusDisplay = () => {
    switch (action.status) {
      case 'submitted_for_review':
        return {
          label: 'Submitted for Review',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30 led-amber',
          icon: Clock,
        };
      case 'needs_work':
        return {
          label: 'Needs Work',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse led-rose',
          icon: AlertCircle,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 led-emerald',
          icon: CheckCircle2,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: Clock,
        };
      case 'blocker':
        return {
          label: 'Blocker',
          color: 'bg-red-500/20 text-red-300 border-red-500/30 led-rose',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'Not Started',
          color: 'bg-white/10 text-slate-300 border-white/10',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-white/[0.08] hover:border-white/20 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 group shadow-sm">
      {/* Title & metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          {action.is_founder_confirmed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Founder Confirmed
            </span>
          )}

          {overdue && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              Overdue
            </span>
          )}
        </div>

        <h5 className="text-xs sm:text-sm font-semibold text-white mt-2 leading-snug group-hover:text-sky-200 transition-colors">
          {action.title}
        </h5>

        {/* Outcome summary if available */}
        {action.outcome_achieved && (
          <p className="text-[11px] text-slate-400 mt-1.5 italic line-clamp-2 bg-white/[0.02] p-2 rounded-xl border border-white/5">
            Deliverable: {action.outcome_achieved}
          </p>
        )}

        {/* Date & Assignee metadata */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2.5 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className={`font-mono ${overdue ? 'text-red-400 font-bold' : ''}`}>
              {formatDateDDMMYYYY(action.date)}
            </span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: action.assignee?.avatar_color || '#6366f1' }}
            >
              {action.assignee?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-slate-300">
              {action.assignee?.full_name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Review & Feedback Actions */}
      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
        {/* Stage 1: Member Submit for Review button */}
        {(isAssignedToMe || isFounder) &&
          action.status !== 'completed' &&
          action.status !== 'submitted_for_review' && (
            <button
              onClick={onSubmitReview}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

        {/* Stage 2: Founder Evaluation Buttons */}
        {isFounder && action.status === 'submitted_for_review' && (
          <button
            onClick={onFounderReview}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 border border-white/20 animate-pulse cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Founder Review</span>
          </button>
        )}

        {/* Audit & Feedback Log Modal Button */}
        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10 shadow-sm"
          title="Threaded Feedback Log"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Delete Action Item Button (for owner or Founder) */}
        {(isAssignedToMe || isFounder) && (
          <button
            onClick={onDeleteTask}
            className="p-2 rounded-xl glass-pill hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer border border-white/10"
            title="Delete Action Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
