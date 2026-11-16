'use client';

import React, { useState } from 'react';
import {
  ActionItem,
  KeyResult,
  Objective,
  Profile,
  Venture,
  VentureHealth,
} from '@/lib/types';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import {
  formatDateDDMMYYYY,
  getHealthBadge,
  isDueWithin7Days,
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
  Filter,
  Users,
  ChevronDown,
  ChevronRight,
  Shield,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
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

  // Grouping by Venture Lead
  const leads = [
    { name: 'Atharav', title: 'Venture Lead (5 Ventures)', slug: 'atharav' },
    { name: 'Sharuk', title: 'Venture Lead (5 Ventures)', slug: 'sharuk' },
    { name: 'Rufus', title: 'Venture Lead (3 Ventures)', slug: 'rufus' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header controls & stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800/40">
              Tab 1 · Daily Operations
            </span>
            <span className="text-xs text-slate-400">13 Active Ventures Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Work Tracker & OKR Hierarchy
          </h1>
        </div>

        {/* View Switchers & Creation CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual View Mode Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('by_venture')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'by_venture'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Venture (13)
            </button>
            <button
              onClick={() => setViewMode('by_lead')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'by_lead'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Venture Lead
            </button>
          </div>

          {/* Scope Filter (Cross-Venture Visibility) */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                scopeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All 13 Ventures
            </button>
            <button
              onClick={() => setScopeFilter('my_ventures')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                scopeFilter === 'my_ventures'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Assigned Ventures ({myVentureIds.length})
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => {
              setSelectedVentureForTask(ventures[0]?.id || '');
              setIsAddActionModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Action Item</span>
          </button>
        </div>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Active Work' },
            {
              id: 'submitted_for_review',
              label: 'Submitted for Review',
              badge: submittedCount,
              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            },
            {
              id: 'needs_work',
              label: 'Needs Work',
              badge: needsWorkCount,
              badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            },
            { id: 'completed', label: 'Completed', badge: completedCount },
            { id: 'blocker', label: 'Blockers', badge: blockerCount, badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === pill.id
                  ? 'bg-white/15 text-white border-white/25 shadow-sm'
                  : 'glass-pill text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <span>{pill.label}</span>
              {pill.badge !== undefined && pill.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                    pill.badgeColor || 'bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {pill.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, OKRs, assignees..."
            className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'by_venture' ? (
        // Standard 13-Venture Board
        <div className="space-y-4">
          {filteredVentures.map((venture) => (
            <VentureSection
              key={venture.id}
              venture={venture}
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
              effectiveProfile={effectiveProfile}
              isFounder={isFounder}
            />
          ))}
        </div>
      ) : (
        // Grouped by Venture Lead
        <div className="space-y-8">
          {leads.map((lead) => {
            const leadVentures = filteredVentures.filter(
              (v) => v.lead?.slug === lead.slug || v.lead_title.includes(lead.name)
            );
            if (leadVentures.length === 0) return null;

            return (
              <div key={lead.slug} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{lead.name}</h2>
                    <p className="text-xs text-slate-400">{lead.title}</p>
                  </div>
                </div>

                <div className="space-y-4 pl-0 sm:pl-2">
                  {leadVentures.map((venture) => (
                    <VentureSection
                      key={venture.id}
                      venture={venture}
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
  effectiveProfile,
  isFounder,
}: {
  venture: Venture;
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
    <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-lg transition-all">
      {/* Venture Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
          <button className="p-1 rounded-lg text-slate-400 hover:text-white">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                {venture.code}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">{venture.name}</h3>

              {/* Automated Health Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${healthBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dotClass}`} />
                {healthBadge.label} Health
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>
                Lead: <strong className="text-slate-200">{venture.lead?.full_name || 'Unassigned'}</strong>
              </span>
              <span>•</span>
              <span>{objectives.length} Objectives</span>
              <span>•</span>
              <span>{keyResults.length} KRs</span>
              <span>•</span>
              <span>{actionItems.length} Actions</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-8 md:pl-0">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Open Venture Documents"
          >
            <Paperclip className="w-3.5 h-3.5 text-sky-400" />
            <span>Documents</span>
          </button>

          <button
            onClick={onAddObjective}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Obj</span>
          </button>

          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Accordion Body: OKRs & Action Items */}
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-white/5 space-y-6 bg-black/20">
          {/* Objectives Hierarchy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Strategic Objectives ({objectives.length})
              </span>
            </div>

            {objectives.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center bg-white/5 rounded-2xl">
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
                    className="rounded-2xl glass-card border border-white/5 overflow-hidden"
                  >
                    {/* Objective Title Row */}
                    <div
                      className="p-3.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleObjective(obj.id)}
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                        <button className="mt-0.5 sm:mt-0 text-slate-400 hover:text-white">
                          {isObjExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40 shrink-0">
                          #{obj.sl_no}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                          {obj.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            obj.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : obj.status === 'blocker'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
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
                          <span className="hidden sm:inline-block text-[11px] text-slate-400">
                            Owner: <span className="text-slate-300 font-medium">{obj.owner.full_name}</span>
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddKr(obj);
                          }}
                          className="px-2 py-1 rounded-lg glass-pill hover:bg-white/10 text-[10px] font-semibold text-teal-300 flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>KR</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Key Results & Child Tasks */}
                    {isObjExpanded && (
                      <div className="p-3.5 bg-black/30 border-t border-white/5 space-y-3">
                        {/* Key Results */}
                        {objKrs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                              Key Results ({objKrs.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {objKrs.map((kr) => (
                                <div
                                  key={kr.id}
                                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs flex items-start justify-between gap-2"
                                >
                                  <div>
                                    <div className="font-mono text-[10px] font-bold text-teal-400">
                                      KR {kr.kr_code}
                                    </div>
                                    <div className="font-medium text-slate-200 mt-0.5">
                                      {kr.title}
                                    </div>
                                    {kr.target_measure && (
                                      <div className="text-[11px] text-slate-400 mt-0.5">
                                        Target: {kr.target_measure}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize ${
                                      kr.status === 'completed'
                                        ? 'text-emerald-400 bg-emerald-950/60'
                                        : 'text-slate-400 bg-white/5'
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
                          <div className="space-y-1.5 pt-2">
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
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                All Venture Action Items ({visibleActions.length})
              </span>
            </div>

            {visibleActions.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center bg-white/5 rounded-2xl">
                No action items match the selected filter.
              </div>
            ) : (
              <div className="space-y-2">
                {visibleActions.map((action) => (
                  <ActionItemCard
                    key={action.id}
                    action={action}
                    onOpenLogs={() => onOpenLogs(action)}
                    onSubmitReview={() => onSubmitReview(action)}
                    onFounderReview={() => onFounderReview(action)}
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
  effectiveProfile,
  isFounder,
}: {
  action: ActionItem;
  onOpenLogs: () => void;
  onSubmitReview: () => void;
  onFounderReview: () => void;
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
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: Clock,
        };
      case 'needs_work':
        return {
          label: 'Needs Work',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
          icon: AlertCircle,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
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
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
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
    <div className="p-3 sm:p-4 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group">
      {/* Title & metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          {action.is_founder_confirmed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
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

        <h5 className="text-xs sm:text-sm font-semibold text-white mt-1.5 leading-snug">
          {action.title}
        </h5>

        {/* Outcome summary if available */}
        {action.outcome_achieved && (
          <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
            Outcome: {action.outcome_achieved}
          </p>
        )}

        {/* Date & Assignee metadata */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className={`font-mono ${overdue ? 'text-red-400 font-bold' : ''}`}>
              {formatDateDDMMYYYY(action.date)}
            </span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: action.assignee?.avatar_color || '#3b82f6' }}
            >
              {action.assignee?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-slate-300 font-medium">
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
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

        {/* Stage 2: Founder Evaluation Buttons */}
        {isFounder && action.status === 'submitted_for_review' && (
          <button
            onClick={onFounderReview}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 animate-bounce"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Founder Review</span>
          </button>
        )}

        {/* Audit & Feedback Log Modal Button */}
        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Threaded Feedback Log"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
