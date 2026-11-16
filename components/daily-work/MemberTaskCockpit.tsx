'use client';

import React, { useState } from 'react';
import { ActionItem, KeyResult, Objective, Profile, Venture } from '@/lib/types';
import { NetflixAvatar } from '../auth/NetflixAvatar';
import { formatDateDDMMYYYY, isOverdue } from '@/lib/utils';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Shield,
  MessageSquare,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Target,
  Compass,
  Calendar,
  Layers,
  Zap,
  Filter,
} from 'lucide-react';

interface MemberTaskCockpitProps {
  member: Profile;
  ventures: Venture[];
  actionItems: ActionItem[];
  objectives: Objective[];
  keyResults: KeyResult[];
  profiles: Profile[];
  onOpenLogs: (item: ActionItem) => void;
  onSubmitReview: (item: ActionItem) => void;
  onFounderReview: (item: ActionItem) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (ventureId?: string) => void;
  isFounder: boolean;
}

export function MemberTaskCockpit({
  member,
  ventures,
  actionItems,
  objectives,
  keyResults,
  profiles,
  onOpenLogs,
  onSubmitReview,
  onFounderReview,
  onDeleteTask,
  onAddTask,
  isFounder,
}: MemberTaskCockpitProps) {
  // Filter for cockpit views
  const [cockpitFilter, setCockpitFilter] = useState<'all' | 'cross_venture' | 'leading_ventures' | 'team_in_my_ventures'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  // 1. Ventures led by this member
  const leadingVentures = ventures.filter((v) => v.lead_id === member.id);

  // 2. All tasks assigned to this member to complete
  const allMyAssignedTasks = actionItems.filter((a) => a.assigned_to === member.id);

  // 3. Tasks assigned to this member within the ventures they lead
  const tasksInMyVentures = allMyAssignedTasks.filter((a) => a.venture?.lead_id === member.id);

  // 4. Cross-venture tasks: assigned to this member, but from a venture led by someone else (or where assigner is different)
  const crossVentureTasks = allMyAssignedTasks.filter((a) => a.venture?.lead_id !== member.id);

  // 5. Tasks in this member's leading ventures assigned to OTHER team members
  const teamTasksInMyVentures = actionItems.filter(
    (a) => a.venture?.lead_id === member.id && a.assigned_to !== member.id
  );

  // Filter tasks based on current tab and status
  const currentList = (() => {
    let list: ActionItem[] = [];
    if (cockpitFilter === 'all') {
      list = allMyAssignedTasks;
    } else if (cockpitFilter === 'cross_venture') {
      list = crossVentureTasks;
    } else if (cockpitFilter === 'leading_ventures') {
      list = tasksInMyVentures;
    } else if (cockpitFilter === 'team_in_my_ventures') {
      list = teamTasksInMyVentures;
    }

    if (statusFilter === 'active') {
      return list.filter((a) => a.status !== 'completed' && a.status !== 'dropped');
    }
    if (statusFilter === 'completed') {
      return list.filter((a) => a.status === 'completed');
    }
    return list;
  })();

  const activeCount = allMyAssignedTasks.filter((a) => a.status !== 'completed' && a.status !== 'dropped').length;
  const completedCount = allMyAssignedTasks.filter((a) => a.status === 'completed').length;
  const pendingReviewCount = allMyAssignedTasks.filter((a) => a.status === 'submitted_for_review').length;

  return (
    <div className="liquid-card !rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl border border-[#F4AEBE]/30 mb-8 space-y-6">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4AEBE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Member Identity & Cockpit Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-4">
          <NetflixAvatar
            name={member.full_name}
            role={member.role}
            avatarColor={member.avatar_color}
            avatarUrl={member.avatar_url}
            size="lg"
            className="!w-14 !h-14 sm:!w-16 sm:!h-16 rounded-2xl shadow-xl shrink-0 ring-2 ring-[#F4AEBE]/40"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-[#F4AEBE] uppercase tracking-widest font-bold">
                OPERATIONAL COMMAND CENTER
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-[#F4AEBE]/15 text-[#F4AEBE] border border-[#F4AEBE]/30 font-bold">
                {member.role === 'founder' ? 'Founder' : member.lead_title || 'Venture Lead'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight mt-0.5">
              {member.full_name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono mt-1 flex-wrap">
              {leadingVentures.length > 0 ? (
                <>
                  <span className="text-[#F4AEBE] font-bold">
                    Leads {leadingVentures.length} {leadingVentures.length === 1 ? 'Venture' : 'Ventures'}:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {leadingVentures.map((v) => (
                      <span
                        key={v.id}
                        className="px-2 py-0.5 rounded-md bg-[#020B20] text-zinc-200 border border-[#F4AEBE]/25 text-[11px]"
                      >
                        {v.code}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-zinc-400">Team Collaborator • Active across portfolio ventures</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Task Creation inside this member's scope */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onAddTask(leadingVentures[0]?.id)}
            className="px-4 py-2 rounded-2xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-[0_4px_18px_rgba(244,174,190,0.35)] flex items-center gap-2 transition-all cursor-pointer font-display uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 text-[#03153D]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 4 Luxury Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10 pt-2">
        {/* Stat 1: Leading Ventures */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#F4AEBE]/90">
              Leading Ventures
            </span>
            <Briefcase className="w-4 h-4 text-[#F4AEBE]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{leadingVentures.length}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1 truncate">
            {leadingVentures.length > 0 ? leadingVentures.map((v) => v.code).join(', ') : 'None assigned'}
          </div>
        </div>

        {/* Stat 2: Active Tasks to Complete */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#F4AEBE]/90">
              Tasks to Complete
            </span>
            <Clock className="w-4 h-4 text-[#F4AEBE]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeCount}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            {pendingReviewCount > 0 ? `${pendingReviewCount} in review` : 'All queued work'}
          </div>
        </div>

        {/* Stat 3: Cross-Venture Tasks */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#F4AEBE]/90">
              Cross-Venture Tasks
            </span>
            <Zap className="w-4 h-4 text-[#F4AEBE]" />
          </div>
          <div className="text-2xl font-bold text-[#F4AEBE] font-mono">{crossVentureTasks.length}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Assigned from other ventures
          </div>
        </div>

        {/* Stat 4: Completed Tasks */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#F4AEBE]/90">
              Completed Tasks
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">{completedCount}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Verified deliverables
          </div>
        </div>
      </div>

      {/* Cockpit Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F4AEBE]/15 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCockpitFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              cockpitFilter === 'all'
                ? 'bg-[#F4AEBE] text-[#03153D] font-bold shadow-md'
                : 'bg-[#020B20] text-[#F4AEBE]/80 border border-[#F4AEBE]/20 hover:text-white'
            }`}
          >
            All My Tasks ({allMyAssignedTasks.length})
          </button>

          <button
            onClick={() => setCockpitFilter('cross_venture')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              cockpitFilter === 'cross_venture'
                ? 'bg-[#F4AEBE] text-[#03153D] font-bold shadow-md'
                : 'bg-[#020B20] text-[#F4AEBE]/80 border border-[#F4AEBE]/20 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Cross-Venture ({crossVentureTasks.length})</span>
          </button>

          {leadingVentures.length > 0 && (
            <>
              <button
                onClick={() => setCockpitFilter('leading_ventures')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  cockpitFilter === 'leading_ventures'
                    ? 'bg-[#F4AEBE] text-[#03153D] font-bold shadow-md'
                    : 'bg-[#020B20] text-[#F4AEBE]/80 border border-[#F4AEBE]/20 hover:text-white'
                }`}
              >
                In My Ventures ({tasksInMyVentures.length})
              </button>

              <button
                onClick={() => setCockpitFilter('team_in_my_ventures')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  cockpitFilter === 'team_in_my_ventures'
                    ? 'bg-[#F4AEBE] text-[#03153D] font-bold shadow-md'
                    : 'bg-[#020B20] text-[#F4AEBE]/80 border border-[#F4AEBE]/20 hover:text-white'
                }`}
              >
                Team in My Ventures ({teamTasksInMyVentures.length})
              </button>
            </>
          )}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center bg-[#020B20] p-1 rounded-xl border border-[#F4AEBE]/20 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              statusFilter === 'active' ? 'bg-[#F4AEBE] text-[#03153D] font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Work
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              statusFilter === 'completed' ? 'bg-[#F4AEBE] text-[#03153D] font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-[#F4AEBE] text-[#03153D] font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 relative z-10">
        {currentList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#020B20]/60 border border-[#F4AEBE]/15 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#F4AEBE]/50 mx-auto" />
            <div className="text-sm font-semibold text-white font-display">No tasks in this view</div>
            <p className="text-xs text-zinc-400 font-mono">
              {cockpitFilter === 'cross_venture'
                ? 'No cross-venture tasks assigned to this member currently.'
                : 'All tasks in this section are up to date!'}
            </p>
          </div>
        ) : (
          currentList.map((action) => {
            const isCrossVenture = action.venture?.lead_id !== member.id;
            const overdue = action.status !== 'completed' && action.status !== 'dropped' && isOverdue(action.date);
            const ventureLead = action.venture?.lead || profiles.find((p) => p.id === action.venture?.lead_id);
            const assigner = action.assigner || profiles.find((p) => p.id === action.assigned_by);

            return (
              <div
                key={action.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#020B20]/90 hover:bg-[#03153D] border border-[#F4AEBE]/25 hover:border-[#F4AEBE]/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md group"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Tags Strip */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                        action.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : action.status === 'submitted_for_review'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : action.status === 'needs_work'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-[#071D49] text-sky-200 border-sky-400/30'
                      }`}
                    >
                      {action.status.replace('_', ' ').toUpperCase()}
                    </span>

                    {/* Cross-Venture Luxury Badge */}
                    {isCrossVenture ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#F4AEBE]/20 text-[#F4AEBE] border border-[#F4AEBE]/40 font-bold">
                        <Zap className="w-2.5 h-2.5" />
                        <span>⚡ CROSS-VENTURE TASK</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Briefcase className="w-2.5 h-2.5" />
                        <span>MY LEADING VENTURE</span>
                      </span>
                    )}

                    {/* Originating Venture Tag */}
                    <span className="px-2 py-0.5 rounded-md bg-[#071D49] text-white border border-[#F4AEBE]/20 font-mono text-[10px] font-bold">
                      {action.venture?.code || 'VENTURE'}
                    </span>

                    {action.is_founder_confirmed && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        Founder Confirmed
                      </span>
                    )}

                    {overdue && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/40">
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Task Title */}
                  <h4 className="text-sm sm:text-base font-bold text-white font-display group-hover:text-[#F4AEBE] transition-colors">
                    {action.title}
                  </h4>

                  {/* Venture & Leadership Provenance Metadata */}
                  <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono flex-wrap">
                    <span>
                      Venture:{' '}
                      <strong className="text-white">
                        {action.venture?.name || action.venture?.code || 'Portfolio Venture'}
                      </strong>
                    </span>

                    <span className="text-zinc-600">•</span>

                    <span>
                      Venture Lead:{' '}
                      <strong className="text-[#F4AEBE]">
                        {ventureLead?.full_name || 'Unassigned'}
                      </strong>
                    </span>

                    {assigner && assigner.id !== member.id && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          Assigned by:{' '}
                          <NetflixAvatar
                            name={assigner.full_name}
                            size="sm"
                            className="!w-4 !h-4 rounded-sm"
                          />
                          <strong className="text-white">{assigner.full_name}</strong>
                        </span>
                      </>
                    )}

                    {action.date && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateDDMMYYYY(action.date)}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Deliverable/Outcome text if present */}
                  {action.outcome_achieved && (
                    <p className="text-[11px] text-zinc-300 font-mono bg-[#03153D]/70 p-2.5 rounded-xl border border-[#F4AEBE]/15">
                      Deliverable: {action.outcome_achieved}
                    </p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#F4AEBE]/10">
                  {action.status !== 'completed' && action.status !== 'submitted_for_review' && (
                    <button
                      onClick={() => onSubmitReview(action)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-md transition-all cursor-pointer font-display uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  )}

                  {isFounder && action.status === 'submitted_for_review' && (
                    <button
                      onClick={() => onFounderReview(action)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-md transition-all cursor-pointer font-display uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Founder Review</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenLogs(action)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all cursor-pointer border border-[#F4AEBE]/20"
                    title="Feedback Logs & Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(action.id)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-[#F4AEBE]/20"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
