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
  Crown,
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

  // Filter mode: 'all' | 'my_ventures' - defaults to 'my_ventures' for non-founder leads!
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my_ventures'>(
    isFounder ? 'all' : 'my_ventures'
  );

  // Status Filter Pill
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded ventures and objectives: auto-expand assigned ventures for leads
  const [expandedVentures, setExpandedVentures] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ventures.forEach((v, idx) => {
      if (isFounder) {
        init[v.id] = idx < 2;
      } else {
        init[v.id] = myVentureIds.includes(v.id);
      }
    });
    return init;
  });

  // Keep scope and auto-expansion aligned when profile or impersonation changes
  React.useEffect(() => {
    if (!isFounder) {
      setScopeFilter('my_ventures');
      setExpandedVentures((prev) => {
        const next = { ...prev };
        myVentureIds.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
    }
  }, [effectiveProfile?.id, isFounder, myVentureIds]);

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
          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 font-mono">{ventures.length}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Ventures Portfolio</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 font-mono">{objectives.length}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Seeded Objectives</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-400 font-mono">{completedCount}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Completed Items</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-400 font-mono">{submittedCount + needsWorkCount}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Review Pipeline</div>
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
        <div className="p-8 sm:p-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">No Assigned Ventures Under Scope</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
              You currently have no direct lead ownership under this scope. Switch to viewing all 13 portfolio ventures.
            </p>
          </div>
          <button
            onClick={() => setScopeFilter('all')}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all cursor-pointer"
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
                <div className="flex items-center gap-3.5 pb-3 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-mono font-bold text-xs">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                      {lead.name}
                      <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {leadVentures.length} {leadVentures.length === 1 ? 'Venture' : 'Ventures'}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">{lead.title}</p>
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
        <div className="p-4 sm:p-5 border-t border-zinc-800 space-y-5 bg-zinc-950/60">
          {/* Objectives Hierarchy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
              <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Target className="w-3.5 h-3.5 text-zinc-400" />
                Strategic Objectives ({objectives.length})
              </span>
            </div>

            {objectives.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center bg-zinc-900/30 rounded-lg border border-zinc-800/60 font-mono">
                No strategic objectives issued for this venture yet.
              </div>
            ) : (
              objectives.map((obj) => {
                const objKrs = keyResults.filter((k) => k.objective_id === obj.id);
                const objActions = actionItems.filter((a) => a.objective_id === obj.id);
                const isObjExpanded = !!expandedObjectives[obj.id];

                return (
                  <div
                    key={obj.id}
                    className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden transition-all hover:border-zinc-700/80"
                  >
                    {/* Objective Title Row */}
                    <div
                      className="p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                      onClick={() => toggleObjective(obj.id)}
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                        <button className="mt-0.5 sm:mt-0 text-zinc-500 hover:text-zinc-200 transition-colors">
                          {isObjExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 shrink-0">
                          #{obj.sl_no}
                        </span>
                        <h4 className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                          {obj.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            obj.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : obj.status === 'blocker'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : obj.status === 'on_hold'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : obj.status === 'dropped'
                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}
                        >
                          {obj.status.replace('_', ' ')}
                        </span>

                        {/* Founder Ownership Badge */}
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>By: Pratap (Founder)</span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddKr(obj);
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center gap-1 cursor-pointer border border-zinc-800 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>KR</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Key Results & Child Tasks */}
                    {isObjExpanded && (
                      <div className="p-3.5 bg-zinc-950/80 border-t border-zinc-800/80 space-y-3">
                        {/* Key Results */}
                        {objKrs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
                              <Compass className="w-3 h-3 text-zinc-400" />
                              Key Results ({objKrs.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {objKrs.map((kr) => (
                                <div
                                  key={kr.id}
                                  className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex items-start justify-between gap-2 shadow-sm"
                                >
                                  <div>
                                    <div className="font-mono text-[10px] font-semibold text-zinc-400">
                                      KR {kr.kr_code}
                                    </div>
                                    <div className="font-medium text-zinc-200 mt-1 leading-snug">
                                      {kr.title}
                                    </div>
                                    {kr.target_measure && (
                                      <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                                        Target: {kr.target_measure}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                                      kr.status === 'completed'
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                        : 'text-zinc-400 bg-zinc-800 border-zinc-700'
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
                            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
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

          {/* Standalone Action Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
              <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                All Venture Action Items ({visibleActions.length})
              </span>
            </div>

            {visibleActions.length === 0 ? (
              <div className="text-xs text-zinc-500 py-3 text-center bg-zinc-900/30 rounded-lg border border-zinc-800/60 font-mono">
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
          color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          icon: Clock,
        };
      case 'needs_work':
        return {
          label: 'Needs Work',
          color: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
          icon: AlertCircle,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: CheckCircle2,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
          icon: Clock,
        };
      case 'blocker':
        return {
          label: 'Blocker',
          color: 'bg-red-500/15 text-red-400 border-red-500/30',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'Not Started',
          color: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 group shadow-sm">
      {/* Title & metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          {action.is_founder_confirmed && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Founder Confirmed
            </span>
          )}

          {overdue && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-400 border border-red-500/30">
              Overdue
            </span>
          )}
        </div>

        <h5 className="text-xs sm:text-sm font-medium text-zinc-100 mt-2 leading-snug group-hover:text-zinc-200 transition-colors">
          {action.title}
        </h5>

        {/* Outcome summary if available */}
        {action.outcome_achieved && (
          <p className="text-[11px] text-zinc-400 mt-1.5 font-mono line-clamp-2 bg-zinc-950/60 p-2 rounded border border-zinc-800/60">
            Deliverable: {action.outcome_achieved}
          </p>
        )}

        {/* Date & Assignee metadata */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2.5 font-mono">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span className={overdue ? 'text-red-400 font-bold' : ''}>
              {formatDateDDMMYYYY(action.date)}
            </span>
          </div>

          <span className="text-zinc-700">•</span>

          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-zinc-700"
              style={{ backgroundColor: action.assignee?.avatar_color || '#6366f1' }}
            >
              {action.assignee?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-zinc-300">
              {action.assignee?.full_name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Review & Feedback Actions */}
      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
        {/* Stage 1: Member Submit for Review button */}
        {(isAssignedToMe || isFounder) &&
          action.status !== 'completed' &&
          action.status !== 'submitted_for_review' && (
            <button
              onClick={onSubmitReview}
              className="px-3 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

        {/* Stage 2: Founder Evaluation Buttons */}
        {isFounder && action.status === 'submitted_for_review' && (
          <button
            onClick={onFounderReview}
            className="px-3 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Founder Review</span>
          </button>
        )}

        {/* Audit & Feedback Log Modal Button */}
        <button
          onClick={onOpenLogs}
          className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer border border-zinc-700/60"
          title="Threaded Feedback Log"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Delete Action Item Button (for owner or Founder) */}
        {(isAssignedToMe || isFounder) && (
          <button
            onClick={onDeleteTask}
            className="p-1.5 rounded-md bg-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer border border-zinc-700/60"
            title="Delete Action Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
