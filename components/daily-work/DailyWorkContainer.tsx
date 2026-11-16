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
  Sliders,
  Zap,
} from 'lucide-react';
import { updateVentureLead, deleteActionItem } from '@/app/actions/work-actions';
import { VentureDocumentsDrawer } from '../venture/VentureDocumentsDrawer';
import { FeedbackLogModal } from './FeedbackLogModal';
import { SubmitReviewModal } from './SubmitReviewModal';
import { FounderReviewModal } from './FounderReviewModal';
import { AddActionItemModal } from './AddActionItemModal';
import { AddObjectiveModal } from './AddObjectiveModal';
import { AddKeyResultModal } from './AddKeyResultModal';
import { MemberTaskCockpit } from './MemberTaskCockpit';
import { FounderAdminModal } from '../admin/FounderAdminModal';
import { NetflixAvatar } from '../auth/NetflixAvatar';

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
  const [selectedKeyResultForTask, setSelectedKeyResultForTask] = useState<string>('');

  const [isAddObjectiveModalOpen, setIsAddObjectiveModalOpen] = useState(false);
  const [selectedVentureForObjective, setSelectedVentureForObjective] = useState<string>('');

  const [isAddKrModalOpen, setIsAddKrModalOpen] = useState(false);
  const [selectedObjectiveForKr, setSelectedObjectiveForKr] = useState<Objective | null>(null);

  // Founder Studio state
  const [isFounderAdminOpen, setIsFounderAdminOpen] = useState(false);
  const [adminVentureId, setAdminVentureId] = useState<string | undefined>(undefined);

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
      {/* Liquid Operations Header */}
      <div className="liquid-card !rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#F4AEBE] uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-[#F4AEBE] shadow-[0_0_8px_rgba(244,174,190,0.8)]" />
              <span>TAB 1 // DAILY OPERATIONS</span>
              <span className="text-zinc-500">•</span>
              <span>13 Ventures</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
              Daily Work & OKR Hierarchy
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 max-w-xl font-normal leading-relaxed">
              Track portfolio execution, review approvals, and real-time Key Result progress across all 13 ventures.
            </p>
          </div>

          {/* Controls & Creation CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dual View Mode Toggle */}
            <div className="flex items-center bg-[#020B20] p-1 rounded-2xl border border-[#F4AEBE]/25 shadow-inner">
              <button
                onClick={() => setViewMode('by_venture')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'by_venture'
                    ? 'liquid-pill-active shadow-md'
                    : 'text-[#F4AEBE]/80 hover:text-white'
                }`}
              >
                By Venture (13)
              </button>
              <button
                onClick={() => setViewMode('by_lead')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'by_lead'
                    ? 'liquid-pill-active shadow-md'
                    : 'text-[#F4AEBE]/80 hover:text-white'
                }`}
              >
                By Lead
              </button>
            </div>

            {/* Scope Filter */}
            <div className="flex items-center bg-[#020B20] p-1 rounded-2xl border border-[#F4AEBE]/25 shadow-inner">
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'liquid-pill-active shadow-md'
                    : 'text-[#F4AEBE]/80 hover:text-white'
                }`}
              >
                All 13
              </button>
              <button
                onClick={() => setScopeFilter('my_ventures')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scopeFilter === 'my_ventures'
                    ? 'liquid-pill-active shadow-md'
                    : 'text-[#F4AEBE]/80 hover:text-white'
                }`}
              >
                My Ventures ({myVentureIds.length})
              </button>
            </div>

            {/* Founder Studio Button (Authority to Edit Everything) */}
            {isFounder && (
              <button
                onClick={() => {
                  setAdminVentureId(undefined);
                  setIsFounderAdminOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-[#020B20] hover:bg-[#071D49] text-[#F4AEBE] border border-[#F4AEBE]/40 text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer font-display uppercase tracking-wider"
                title="Founder Master Admin: Edit team profiles, ventures, and reassign leads"
              >
                <Sliders className="w-3.5 h-3.5 text-[#F4AEBE]" />
                <span>Portfolio & Team Studio</span>
              </button>
            )}

            {/* New Task Button (Rose Silk Luxury CTA) */}
            <button
              onClick={() => {
                setSelectedVentureForTask(ventures[0]?.id || '');
                setSelectedObjectiveForTask('');
                setSelectedKeyResultForTask('');
                setIsAddActionModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-[0_4px_20px_rgba(244,174,190,0.4)] border border-white/40 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 font-display uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 text-[#03153D]" />
              <span>New Action Item</span>
            </button>
          </div>
        </div>

        {/* Liquid Mini-Metrics Strip (Rose Silk & Blue Velvet) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#F4AEBE]/20">
          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F4AEBE]/15 border border-[#F4AEBE]/35 flex items-center justify-center text-[#F4AEBE] shadow-[0_0_15px_rgba(244,174,190,0.25)] shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{ventures.length}</div>
              <div className="text-[10px] text-[#F4AEBE]/80 font-mono uppercase tracking-wider font-semibold">Ventures Portfolio</div>
            </div>
          </div>

          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#072468] border border-[#F4AEBE]/35 flex items-center justify-center text-[#F4AEBE] shadow-[0_0_15px_rgba(7,36,104,0.4)] shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{objectives.length}</div>
              <div className="text-[10px] text-[#F4AEBE]/80 font-mono uppercase tracking-wider font-semibold">Seeded Objectives</div>
            </div>
          </div>

          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-emerald-300 font-mono">{completedCount}</div>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Completed Items</div>
            </div>
          </div>

          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F4AEBE]/20 border border-[#F4AEBE]/40 flex items-center justify-center text-[#F4AEBE] shadow-[0_0_15px_rgba(244,174,190,0.3)] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-[#F4AEBE] font-mono">{submittedCount + needsWorkCount}</div>
              <div className="text-[10px] text-[#F4AEBE]/80 font-mono uppercase tracking-wider font-semibold">Review Pipeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Profile Cockpit: Leading Ventures & Tasks for every member (except Founder) */}
      {effectiveProfile && effectiveProfile.role !== 'founder' && (
        <MemberTaskCockpit
          member={effectiveProfile}
          ventures={ventures}
          actionItems={actionItems}
          objectives={objectives}
          keyResults={keyResults}
          profiles={profiles}
          onOpenLogs={(item) => setSelectedLogItem(item)}
          onSubmitReview={(item) => setSelectedSubmitItem(item)}
          onFounderReview={(item) => setSelectedFounderReviewItem(item)}
          onDeleteTask={handleDeleteTask}
          onAddTask={(vId) => {
            setSelectedVentureForTask(vId || ventures[0]?.id || '');
            setSelectedObjectiveForTask('');
            setSelectedKeyResultForTask('');
            setIsAddActionModalOpen(true);
          }}
          isFounder={isFounder}
        />
      )}

      {/* Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none touch-pan-x -webkit-overflow-scrolling-touch py-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'active', label: 'Active Work' },
            {
              id: 'submitted_for_review',
              label: 'In Review',
              badge: submittedCount,
              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            },
            {
              id: 'needs_work',
              label: 'Needs Work',
              badge: needsWorkCount,
              badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            },
            { id: 'completed', label: 'Completed', badge: completedCount, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { id: 'blocker', label: 'Blockers', badge: blockerCount, badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer min-h-[38px] ${
                statusFilter === pill.id
                  ? 'bg-[#F4AEBE] text-[#03153D] border-[#F4AEBE] shadow-[0_2px_14px_rgba(244,174,190,0.4)] font-bold'
                  : 'bg-[#020B20]/80 text-[#F4AEBE]/80 border-[#F4AEBE]/20 hover:text-white hover:border-[#F4AEBE]/40'
              }`}
            >
              <span>{pill.label}</span>
              {pill.badge !== undefined && pill.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
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
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#F4AEBE]/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, OKRs, assignees..."
            className="w-full liquid-input pl-10 pr-4 py-2 text-xs placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {filteredVentures.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl liquid-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.1] text-zinc-400 mx-auto flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Ventures in Current View</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Switch filter to "All 13" or check assigned ventures for your profile.
            </p>
          </div>
          <button
            onClick={() => setScopeFilter('all')}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Show All 13 Ventures
          </button>
        </div>
      ) : viewMode === 'by_venture' ? (
        // Standard View: Sorted Portfolio of 13 Ventures
        <div className="space-y-6">
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
              onAddTask={(objId?: string, krId?: string) => {
                setSelectedVentureForTask(venture.id);
                setSelectedObjectiveForTask(objId || '');
                setSelectedKeyResultForTask(krId || '');
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
              onEditVenture={(id) => {
                setAdminVentureId(id);
                setIsFounderAdminOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              effectiveProfile={effectiveProfile}
              isFounder={isFounder}
            />
          ))}
        </div>
      ) : (
        // Dynamic Grouping by Venture Lead
        <div className="space-y-10">
          {dynamicLeads.map((lead) => {
            const leadVentures = filteredVentures.filter((v) =>
              lead.id === 'unassigned' ? !v.lead_id : v.lead_id === lead.id
            );
            if (leadVentures.length === 0) return null;

            return (
              <div key={lead.id} className="space-y-4">
                <div className="flex items-center gap-3.5 pb-3 border-b border-white/[0.08]">
                  <NetflixAvatar
                    name={lead.name}
                    size="sm"
                    className="!w-9 !h-9 rounded-xl shadow-md"
                  />
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      {lead.name}
                      <span className="text-[10px] font-mono text-zinc-300 bg-[#161828] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                        {leadVentures.length} {leadVentures.length === 1 ? 'Venture' : 'Ventures'}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">{lead.title}</p>
                  </div>
                </div>

                <div className="space-y-5">
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
                      onAddTask={(objId?: string, krId?: string) => {
                        setSelectedVentureForTask(venture.id);
                        setSelectedObjectiveForTask(objId || '');
                        setSelectedKeyResultForTask(krId || '');
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
                      onEditVenture={(id) => {
                        setAdminVentureId(id);
                        setIsFounderAdminOpen(true);
                      }}
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

      {/* Mobile Ergonomic Floating Action Button (Fitts's Law Thumb Zone) */}
      <button
        onClick={() => {
          setSelectedVentureForTask(ventures[0]?.id || '');
          setSelectedObjectiveForTask('');
          setSelectedKeyResultForTask('');
          setIsAddActionModalOpen(true);
        }}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-[#F4AEBE] to-[#f7bac8] text-[#03153D] flex items-center justify-center shadow-[0_8px_28px_rgba(244,174,190,0.65)] border-2 border-white/60 active:scale-95 transition-all cursor-pointer"
        aria-label="Create Action Item"
        title="Quick Add Task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

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
        preselectedKeyResultId={selectedKeyResultForTask}
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
        keyResults={keyResults}
        isOpen={isAddKrModalOpen}
        onClose={() => setIsAddKrModalOpen(false)}
        onSuccess={() => onRefresh()}
      />

      {/* Founder Master Studio (Portfolio & Team Admin) */}
      <FounderAdminModal
        isOpen={isFounderAdminOpen}
        onClose={() => setIsFounderAdminOpen(false)}
        profiles={profiles}
        ventures={ventures}
        onRefresh={onRefresh}
        defaultTab={adminVentureId ? 'ventures' : 'profiles'}
        preselectedVentureId={adminVentureId}
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
  onEditVenture,
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
  onAddTask: (objId?: string, krId?: string) => void;
  onAddObjective: () => void;
  onAddKr: (obj: Objective) => void;
  onOpenLogs: (item: ActionItem) => void;
  onSubmitReview: (item: ActionItem) => void;
  onFounderReview: (item: ActionItem) => void;
  onReassignLead: (ventureId: string, leadId: string) => void;
  onEditVenture: (ventureId: string) => void;
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
    <div className="liquid-card !rounded-3xl overflow-hidden shadow-xl hover:border-white/20 transition-all">
      {/* Venture Header Bar */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={onToggle}>
          <button className="p-1.5 rounded-xl bg-[#161828] border border-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-sm">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#03153D] bg-[#F4AEBE] px-2.5 py-0.5 rounded-lg shadow-sm">
                {venture.code}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">{venture.name}</h3>

              {/* Automated Health Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono border ${healthBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dotClass}`} />
                {healthBadge.label} Health
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 flex-wrap font-mono">
              {isFounder ? (
                <div
                  className="inline-flex items-center gap-1.5 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-zinc-500 text-xs">Lead:</span>
                  <select
                    value={venture.lead_id || ''}
                    onChange={(e) => onReassignLead(venture.id, e.target.value)}
                    className="bg-[#12131d] text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/[0.1] text-zinc-200 cursor-pointer focus:outline-none"
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
                  Lead: <strong className="text-white">{venture.lead?.full_name || 'Unassigned'}</strong>
                </span>
              )}
              <span className="text-zinc-600">•</span>
              <span>{objectives.length} Objectives</span>
              <span className="text-zinc-600">•</span>
              <span>{keyResults.length} KRs</span>
              <span className="text-zinc-600">•</span>
              <span>{actionItems.length} Actions</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-9 md:pl-0 flex-wrap">
          {isFounder && (
            <button
              onClick={() => onEditVenture(venture.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#020B20] hover:bg-[#071D49] text-xs font-medium text-[#F4AEBE] transition-all cursor-pointer border border-[#F4AEBE]/35 shadow-sm min-h-[36px]"
              title="Founder: Edit Venture Name, Code, Description & Lead"
            >
              <Sliders className="w-3.5 h-3.5 text-[#F4AEBE]" />
              <span>Edit Venture</span>
            </button>
          )}

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#03153D]/80 hover:bg-[#F4AEBE]/10 text-xs font-medium text-[#F4AEBE] transition-all cursor-pointer border border-[#F4AEBE]/25 shadow-sm min-h-[36px]"
            title="Open Venture Documents"
          >
            <Paperclip className="w-3.5 h-3.5 text-[#F4AEBE]" />
            <span>Documents</span>
          </button>

          {isFounder && (
            <button
              onClick={onAddObjective}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4AEBE]/15 hover:bg-[#F4AEBE]/25 text-xs font-medium text-[#F4AEBE] transition-all cursor-pointer border border-[#F4AEBE]/30 shadow-sm min-h-[36px]"
              title="Founder Privilege: Add Strategic Objective"
            >
              <Plus className="w-3.5 h-3.5 text-[#F4AEBE]" />
              <span>Add Objective</span>
            </button>
          )}

          <button
            onClick={() => onAddTask()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-md transition-all cursor-pointer min-h-[36px] font-display uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Accordion Body: OKRs & Action Items */}
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t border-white/[0.06] space-y-6 bg-[#0a0b12]/60">
          {/* Objectives Hierarchy */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Target className="w-4 h-4 text-violet-400" />
                Strategic Objectives ({objectives.length})
              </span>
            </div>

            {objectives.length === 0 ? (
              <div className="text-xs text-zinc-500 py-6 text-center bg-[#10121d]/50 rounded-2xl border border-white/[0.06] font-mono">
                No strategic objectives issued for this venture yet.
              </div>
            ) : (
              objectives.map((obj) => {
                const objKrs = keyResults.filter((k) => k.objective_id === obj.id);
                const objActions = visibleActions.filter((a) => a.objective_id === obj.id);
                const isObjExpanded = !!expandedObjectives[obj.id];

                return (
                  <div
                    key={obj.id}
                    className="rounded-2xl bg-[#121422]/80 border border-white/[0.08] overflow-hidden transition-all hover:border-violet-500/40 shadow-sm"
                  >
                    {/* Objective Title Row */}
                    <div
                      className="p-3.5 sm:p-4 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggleObjective(obj.id)}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <button className="mt-0.5 sm:mt-0 text-zinc-400 hover:text-white transition-colors">
                          {isObjExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-mono text-xs font-bold text-[#F4AEBE] bg-[#F4AEBE]/15 px-2 py-0.5 rounded-md border border-[#F4AEBE]/30 shrink-0">
                          #{obj.sl_no}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug font-display">
                          {obj.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                            obj.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : obj.status === 'blocker'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : obj.status === 'on_hold'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : obj.status === 'dropped'
                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {obj.status.replace('_', ' ')}
                        </span>

                        {/* Founder Ownership Badge (Zero Crown) */}
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#F4AEBE] bg-[#F4AEBE]/15 px-2.5 py-0.5 rounded-full border border-[#F4AEBE]/30 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F4AEBE]" />
                          <span>By: Pratap (Founder)</span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTask(obj.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-zinc-200 flex items-center gap-1 cursor-pointer border border-white/[0.08] transition-colors"
                          title="Add task for this objective"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Task</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddKr(obj);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer border border-cyan-500/30 transition-colors"
                          title="Add Key Result for this objective"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>KR</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Key Results & Child Tasks */}
                    {isObjExpanded && (
                      <div className="p-4 bg-[#0d0e18]/90 border-t border-white/[0.06] space-y-4">
                        {/* Key Results Section */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[11px] uppercase font-mono tracking-wider text-zinc-400">
                            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                              <Compass className="w-3.5 h-3.5 text-cyan-400" />
                              Key Results ({objKrs.length})
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddKr(obj);
                              }}
                              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Add Key Result to this objective"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add KR</span>
                            </button>
                          </div>

                          {objKrs.length === 0 ? (
                            <div className="p-3.5 rounded-xl bg-[#12131f]/60 border border-dashed border-white/[0.08] text-xs text-zinc-400 font-mono flex items-center justify-between gap-3">
                              <span>No Key Results defined yet for Objective #{obj.sl_no}.</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddKr(obj);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-[11px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Create KR</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddTask(obj.id);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-200 border border-white/[0.08] flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Task</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {objKrs.map((kr) => {
                                const krTaskCount = actionItems.filter((a) => a.key_result_id === kr.id).length;
                                return (
                                  <div
                                    key={kr.id}
                                    className="p-3.5 rounded-xl bg-[#151726]/80 border border-cyan-500/20 text-xs flex items-start justify-between gap-2 shadow-sm"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                                          KR {kr.kr_code}
                                        </span>
                                        {krTaskCount > 0 && (
                                          <span className="text-[10px] font-mono text-teal-300 bg-teal-500/15 px-2 py-0.2 rounded-full border border-teal-500/30">
                                            {krTaskCount} {krTaskCount === 1 ? 'task' : 'tasks'}
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-medium text-white mt-1.5 leading-snug">
                                        {kr.title}
                                      </div>
                                      {kr.target_measure && (
                                        <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                                          Target: {kr.target_measure}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border ${
                                          kr.status === 'completed'
                                            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                                            : 'text-zinc-400 bg-zinc-800 border-zinc-700'
                                        }`}
                                      >
                                        {kr.status}
                                      </span>
                                      <button
                                        onClick={() => onAddTask(obj.id, kr.id)}
                                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-200 flex items-center gap-1 cursor-pointer border border-white/[0.08] transition-colors"
                                        title="Add task for this Key Result"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>Task</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Associated Actions */}
                        {objActions.length > 0 && (
                          <div className="space-y-2.5 pt-2">
                            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                              Linked Action Items ({objActions.length})
                            </div>
                            {objActions.map((action) => (
                              <ActionItemCard
                                key={action.id}
                                action={action}
                                objectives={objectives}
                                keyResults={keyResults}
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
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                All Venture Action Items ({visibleActions.length})
              </span>
            </div>

            {visibleActions.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center bg-[#10121d]/40 rounded-2xl border border-white/[0.06] font-mono">
                No action items match the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleActions.map((action) => (
                  <ActionItemCard
                    key={action.id}
                    action={action}
                    objectives={objectives}
                    keyResults={keyResults}
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
// Sub-Component: ActionItemCard (Liquid Interactive Row)
// ----------------------------------------------------
function ActionItemCard({
  action,
  objectives = [],
  keyResults = [],
  onOpenLogs,
  onSubmitReview,
  onFounderReview,
  onDeleteTask,
  effectiveProfile,
  isFounder,
}: {
  action: ActionItem;
  objectives?: Objective[];
  keyResults?: KeyResult[];
  onOpenLogs: () => void;
  onSubmitReview: () => void;
  onFounderReview: () => void;
  onDeleteTask: () => void;
  effectiveProfile: Profile | null;
  isFounder: boolean;
}) {
  const isAssignedToMe = effectiveProfile && action.assigned_to === effectiveProfile.id;
  const overdue = action.status !== 'completed' && action.status !== 'dropped' && isOverdue(action.date);

  // Resolve parent Objective and Key Result
  const matchedKr = action.key_result || keyResults.find((k) => k.id === action.key_result_id);
  const matchedObj =
    action.objective ||
    objectives.find((o) => o.id === action.objective_id) ||
    (matchedKr ? objectives.find((o) => o.id === matchedKr.objective_id) : undefined);

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
          color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: AlertCircle,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
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
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
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
    <div className="p-4 sm:p-4.5 rounded-2xl bg-[#141624]/90 hover:bg-[#181a2e] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5 group shadow-sm hover:shadow-lg">
      {/* Title & metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          {matchedObj && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30"
              title={`Objective #${matchedObj.sl_no}: ${matchedObj.title}`}
            >
              <Target className="w-2.5 h-2.5" />
              <span>Obj #{matchedObj.sl_no}</span>
            </span>
          )}

          {matchedKr && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              title={`Key Result: KR ${matchedKr.kr_code} - ${matchedKr.title}`}
            >
              <Compass className="w-2.5 h-2.5" />
              <span>KR {matchedKr.kr_code}</span>
            </span>
          )}

          {/* Cross-Venture badge if assignee is not the venture lead */}
          {action.venture?.lead_id && action.assignee?.id && action.venture.lead_id !== action.assignee.id && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#F4AEBE]/20 text-[#F4AEBE] border border-[#F4AEBE]/35 font-bold">
              <Zap className="w-2.5 h-2.5" />
              <span>⚡ Cross-Venture</span>
            </span>
          )}

          {action.is_founder_confirmed && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Founder Confirmed
            </span>
          )}

          {overdue && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/40">
              Overdue
            </span>
          )}
        </div>

        <h5 className="text-xs sm:text-sm font-semibold text-white mt-2 leading-snug group-hover:text-zinc-100 transition-colors font-display">
          {action.title}
        </h5>

        {/* Outcome summary if available */}
        {action.outcome_achieved && (
          <p className="text-[11px] text-zinc-300 mt-2 font-mono line-clamp-2 bg-[#0d0e18]/80 p-2.5 rounded-xl border border-white/[0.06]">
            Deliverable: {action.outcome_achieved}
          </p>
        )}

        {/* Date, Assignee, Venture Lead, and Origin metadata */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2.5 font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span className={overdue ? 'text-red-400 font-bold' : ''}>
              {formatDateDDMMYYYY(action.date)}
            </span>
          </div>

          <span className="text-zinc-700">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Assignee:</span>
            <NetflixAvatar
              name={action.assignee?.full_name || 'U'}
              role={action.assignee?.role}
              avatarColor={action.assignee?.avatar_color}
              size="sm"
              className="!w-4.5 !h-4.5 rounded-sm shadow-sm"
            />
            <span className="text-zinc-200 font-semibold">
              {action.assignee?.full_name || 'Unassigned'}
            </span>
          </div>

          {action.venture?.lead && (
            <>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Lead:</span>
                <span className="text-[#F4AEBE] font-semibold">{action.venture.lead.full_name}</span>
              </div>
            </>
          )}

          {action.assigner && action.assigner.id !== action.assignee?.id && (
            <>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Assigned by:</span>
                <span className="text-white font-medium">{action.assigner.full_name}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review & Feedback Actions */}
      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
        {/* Stage 1: Member Submit for Review button */}
        {(isAssignedToMe || isFounder) &&
          action.status !== 'completed' &&
          action.status !== 'submitted_for_review' && (
            <button
              onClick={onSubmitReview}
              className="px-3.5 py-1.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[36px] font-display uppercase tracking-wider"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

        {/* Stage 2: Founder Evaluation Buttons */}
        {isFounder && action.status === 'submitted_for_review' && (
          <button
            onClick={onFounderReview}
            className="px-3.5 py-1.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[36px] font-display uppercase tracking-wider"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Founder Review</span>
          </button>
        )}

        {/* Audit & Feedback Log Modal Button */}
        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
          title="Threaded Feedback Log"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Delete Action Item Button (for owner or Founder) */}
        {(isAssignedToMe || isFounder) && (
          <button
            onClick={onDeleteTask}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-white/[0.08]"
            title="Delete Action Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
