'use client';

import React, { useState } from 'react';
import {
  PortfolioSnapshotData,
  VentureProgressRow,
  MemberProgressRow,
  PlanningGapRow,
  WeeklyTrendRow,
} from '@/app/actions/analytics-actions';
import { Venture, Profile } from '@/lib/types';
import { getHealthBadge, formatDateDDMMYYYY } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Target,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface ProgressAnalyticsDashboardProps {
  data: {
    portfolioSnapshot: PortfolioSnapshotData;
    ventureRows: VentureProgressRow[];
    memberRows: MemberProgressRow[];
    planningGaps: PlanningGapRow[];
    weeklyTrend: WeeklyTrendRow[];
    rawVentures: Venture[];
    rawProfiles: Profile[];
  };
}

export function ProgressAnalyticsDashboard({ data }: ProgressAnalyticsDashboardProps) {
  const {
    portfolioSnapshot: snapshot,
    ventureRows,
    memberRows,
    planningGaps,
    weeklyTrend,
    rawVentures,
    rawProfiles,
  } = data;

  // Focus Scorecard Selector
  const [focusType, setFocusType] = useState<'venture' | 'member'>('venture');
  const [selectedFocusId, setSelectedFocusId] = useState<string>(ventureRows[0]?.id || '');

  // Find focused object
  const focusedVenture =
    focusType === 'venture' ? ventureRows.find((v) => v.id === selectedFocusId) : null;
  const focusedMember =
    focusType === 'member' ? memberRows.find((m) => m.id === selectedFocusId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              Tab 3 · Progress Analytics Suite
            </span>
            <span className="text-xs text-slate-400">Live View across 13 Ventures & Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Portfolio Health & Executive Scorecards
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Real-time calculation engine active</span>
        </div>
      </div>

      {/* 1 · Portfolio Snapshot (KPI Cards) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span>1 · Portfolio Snapshot</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Objectives Done */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Objectives Completed</span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.objectivesCompleted} / {snapshot.objectivesTotal}
            </div>
            <div className="text-xs text-indigo-400 font-semibold mt-1">
              {snapshot.objectivesPercent}% completed
            </div>
          </div>

          {/* Key Results Done */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Key Results Completed</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.krsCompleted} / {snapshot.krsTotal}
            </div>
            <div className="text-xs text-teal-400 font-semibold mt-1">
              {snapshot.krsTotal > 0 ? `${snapshot.krsPercent}% completed` : 'Awaiting KR assignments'}
            </div>
          </div>

          {/* Open Blockers */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Open Blockers</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.openBlockers}
            </div>
            <div className="text-xs text-red-400 font-semibold mt-1">
              KRs + active actions
            </div>
          </div>

          {/* Overdue Items */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Overdue Items</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.overdueItems}
            </div>
            <div className="text-xs text-amber-400 font-semibold mt-1">
              Obj/KRs + actions
            </div>
          </div>

          {/* Today's Actions */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Today's Actions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.todayActionsDone} / {snapshot.todayActionsTotal}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              done / planned today
            </div>
          </div>

          {/* This Week's Actions */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>This Week's Actions</span>
              <Calendar className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.thisWeekActionsDone} / {snapshot.thisWeekActionsTotal}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              done / planned this week
            </div>
          </div>

          {/* Ventures in Red */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Ventures in Red</span>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.venturesInRed}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              of {snapshot.venturesTotal} active ventures
            </div>
          </div>

          {/* Planning Gaps */}
          <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Planning Gaps</span>
              <AlertCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {snapshot.planningGapsTotal}
            </div>
            <div className="text-xs text-purple-400 font-semibold mt-1">
              see section 4 audit
            </div>
          </div>
        </div>
      </div>

      {/* Focus Scorecard Selector */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Interactive Drill-Down
            </span>
            <h3 className="text-lg font-bold text-white">Focus Scorecard</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFocusType('venture');
                setSelectedFocusId(ventureRows[0]?.id || '');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                focusType === 'venture'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'glass-pill text-slate-400 hover:text-white'
              }`}
            >
              Focus Venture
            </button>
            <button
              onClick={() => {
                setFocusType('member');
                setSelectedFocusId(memberRows[0]?.id || '');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                focusType === 'member'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'glass-pill text-slate-400 hover:text-white'
              }`}
            >
              Focus Member
            </button>

            <select
              value={selectedFocusId}
              onChange={(e) => setSelectedFocusId(e.target.value)}
              className="glass-input text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-200 bg-slate-900/90"
            >
              {focusType === 'venture'
                ? ventureRows.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))
                : memberRows.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Focused Card */}
        {focusedVenture && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block">Lead</span>
              <span className="text-sm font-bold text-white">{focusedVenture.leadName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Objectives</span>
              <span className="text-sm font-bold text-white">
                {focusedVenture.completedObjectives} / {focusedVenture.totalObjectives} ({focusedVenture.objectivePercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">KRs (Done/Total)</span>
              <span className="text-sm font-bold text-white">
                {focusedVenture.krsCompleted} / {focusedVenture.krsTotal}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Overdue (Obj+KR)</span>
              <span className="text-sm font-bold text-amber-400">{focusedVenture.overdueCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Blocked KRs</span>
              <span className="text-sm font-bold text-rose-400">{focusedVenture.blockedKrs}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Automated Health</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  getHealthBadge(focusedVenture.health).badgeClass
                }`}
              >
                {focusedVenture.health}
              </span>
            </div>
          </div>
        )}

        {focusedMember && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block">Status</span>
              <span className="text-sm font-bold text-emerald-400">{focusedMember.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Objectives Owned</span>
              <span className="text-sm font-bold text-white">
                {focusedMember.objectivesDone} / {focusedMember.objectivesOwned}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">KRs Open / Done</span>
              <span className="text-sm font-bold text-white">
                {focusedMember.krsOpen} / {focusedMember.krsDone}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Actions This Week</span>
              <span className="text-sm font-bold text-white">
                {focusedMember.actionsWeekDone} / {focusedMember.actionsWeekTotal}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">% Completed</span>
              <span className="text-sm font-bold text-sky-400">
                {focusedMember.percentActionsCompleted}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Active Days</span>
              <span className="text-sm font-bold text-indigo-400">{focusedMember.activeDays} days</span>
            </div>
          </div>
        )}
      </div>

      {/* 2 · Progress by Venture Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>2 · Progress by Venture (13 Ventures)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Venture</th>
                <th className="p-3.5">Lead</th>
                <th className="p-3.5 text-center">Total Objs</th>
                <th className="p-3.5 text-center">Done</th>
                <th className="p-3.5 text-center">Pending</th>
                <th className="p-3.5 text-center">On-Hold</th>
                <th className="p-3.5 text-center">Blocker</th>
                <th className="p-3.5 text-center">Obj % Done</th>
                <th className="p-3.5 text-center">KRs Done/Total</th>
                <th className="p-3.5 text-center">KR %</th>
                <th className="p-3.5 text-center">Overdue</th>
                <th className="p-3.5 text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventureRows.map((v) => {
                const badge = getHealthBadge(v.health);
                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-bold text-white max-w-xs truncate">{v.name}</td>
                    <td className="p-3.5 text-slate-300 font-medium">{v.leadName}</td>
                    <td className="p-3.5 text-center font-mono">{v.totalObjectives}</td>
                    <td className="p-3.5 text-center font-mono text-emerald-400">
                      {v.completedObjectives}
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-300">
                      {v.pendingObjectives}
                    </td>
                    <td className="p-3.5 text-center font-mono text-amber-400">
                      {v.onHoldObjectives}
                    </td>
                    <td className="p-3.5 text-center font-mono text-rose-400">
                      {v.blockerObjectives}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-sky-400">
                      {v.objectivePercent}%
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {v.krsCompleted} / {v.krsTotal}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-teal-400">
                      {v.krPercent}%
                    </td>
                    <td className="p-3.5 text-center font-mono text-amber-400">
                      {v.overdueCount}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 · Progress by Team Member Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>3 · Progress by Team Member (founder excluded)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Member</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Objs Owned</th>
                <th className="p-3.5 text-center">Objs Done</th>
                <th className="p-3.5 text-center">KRs Open</th>
                <th className="p-3.5 text-center">KRs Done</th>
                <th className="p-3.5 text-center">KRs Overdue</th>
                <th className="p-3.5 text-center">Actions Today</th>
                <th className="p-3.5 text-center">Actions Week</th>
                <th className="p-3.5 text-center">% Completed</th>
                <th className="p-3.5 text-center">Active Days</th>
                <th className="p-3.5 text-center">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {memberRows.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-bold text-white">{m.name}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-mono">{m.objectivesOwned}</td>
                  <td className="p-3.5 text-center font-mono text-emerald-400">{m.objectivesDone}</td>
                  <td className="p-3.5 text-center font-mono text-slate-300">{m.krsOpen}</td>
                  <td className="p-3.5 text-center font-mono text-teal-400">{m.krsDone}</td>
                  <td className="p-3.5 text-center font-mono text-amber-400">{m.krsOverdue}</td>
                  <td className="p-3.5 text-center font-mono">
                    {m.actionsTodayDone} / {m.actionsTodayTotal}
                  </td>
                  <td className="p-3.5 text-center font-mono">
                    {m.actionsWeekDone} / {m.actionsWeekTotal}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-sky-400">
                    {m.percentActionsCompleted}%
                  </td>
                  <td className="p-3.5 text-center font-mono text-indigo-400">{m.activeDays} d</td>
                  <td className="p-3.5 text-center">
                    {m.flag === 'attention' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        Attention
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 · Planning Gaps Finder Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <AlertCircle className="w-4 h-4 text-purple-400" />
          <span>4 · Planning Gaps — fill these first</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Venture</th>
                <th className="p-3.5 text-center">Objs without owner</th>
                <th className="p-3.5 text-center">Objs without due date</th>
                <th className="p-3.5 text-center">Objs without KRs</th>
                <th className="p-3.5 text-center">KRs without owner</th>
                <th className="p-3.5 text-center">KRs without due date</th>
                <th className="p-3.5 text-center font-bold">Total Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {planningGaps.map((g) => (
                <tr key={g.ventureId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    {g.ventureName}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {g.objsWithoutOwner}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {g.objsWithoutDueDate}
                  </td>
                  <td className="p-3.5 text-center font-mono text-purple-400 font-semibold">
                    {g.objsWithoutKrs}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {g.krsWithoutOwner}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-300">
                    {g.krsWithoutDueDate}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                    {g.totalGaps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 · Rolling 8-Week Trend */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>5 · Weekly Trend — last 8 weeks (Mon–Sun)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Week Starting</th>
                <th className="p-3.5 text-center">Actions Planned</th>
                <th className="p-3.5 text-center">Actions Completed</th>
                {rawProfiles
                  .filter((p) => p.role !== 'founder')
                  .slice(0, 6)
                  .map((p) => (
                    <th key={p.id} className="p-3.5 text-center">
                      {p.full_name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {weeklyTrend.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-mono text-slate-300">
                    {formatDateDDMMYYYY(row.weekStarting)}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-400">
                    {row.actionsPlanned}
                  </td>
                  <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">
                    {row.actionsCompleted}
                  </td>
                  {rawProfiles
                    .filter((p) => p.role !== 'founder')
                    .slice(0, 6)
                    .map((p) => (
                      <td key={p.id} className="p-3.5 text-center font-mono text-slate-300">
                        {row.memberCounts[p.full_name] || 0}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
