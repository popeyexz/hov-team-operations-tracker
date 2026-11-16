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
  Activity,
  AlertCircle,
  Compass,
  ArrowUpRight,
  Shield,
  Zap,
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
      {/* Luxury Command Center Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.12] shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/[0.08] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/[0.06] rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800/50 shadow-[0_0_12px_rgba(16,185,129,0.2)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse led-emerald" />
                TAB 3 · EXECUTIVE TELEMETRY
              </span>
              <span className="text-xs text-slate-400 font-medium">Real-Time Portfolio Analytics</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight text-gradient-silver">
              Portfolio Health & Performance Matrix
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Live executive rollups across 13 ventures, automated Red/Amber/Green health calculations, planning gap audits, and team velocity.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-950/40 px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-sm font-medium">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Deterministic Rollup Engine Active</span>
          </div>
        </div>

        {/* 1 · Portfolio Snapshot (8 Luxury Bento Metric Cards) */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>1 · Portfolio Snapshot</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Objectives Done */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-indigo-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Objectives Done</span>
                <Target className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {snapshot.objectivesCompleted} <span className="text-slate-500 text-lg">/ {snapshot.objectivesTotal}</span>
              </div>
              <div className="text-xs text-indigo-300 font-semibold mt-1.5 flex items-center gap-1">
                <span>{snapshot.objectivesPercent}% completed</span>
              </div>
            </div>

            {/* Key Results Done */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-teal-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Key Results Done</span>
                <Layers className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {snapshot.krsCompleted} <span className="text-slate-500 text-lg">/ {snapshot.krsTotal}</span>
              </div>
              <div className="text-xs text-teal-300 font-semibold mt-1.5">
                {snapshot.krsTotal > 0 ? `${snapshot.krsPercent}% completed` : 'Awaiting KR assignments'}
              </div>
            </div>

            {/* Open Blockers */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-rose-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Open Blockers</span>
                <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {snapshot.openBlockers}
              </div>
              <div className="text-xs text-rose-300 font-medium mt-1.5">
                Critical bottlenecks
              </div>
            </div>

            {/* Overdue Items */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Overdue Items</span>
                <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {snapshot.overdueItems}
              </div>
              <div className="text-xs text-amber-300 font-medium mt-1.5">
                Past scheduled deadline
              </div>
            </div>

            {/* Today's Actions */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Today's Actions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {snapshot.todayActionsDone} <span className="text-slate-500 text-lg">/ {snapshot.todayActionsTotal}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1.5">
                done / planned today
              </div>
            </div>

            {/* This Week's Actions */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-sky-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">This Week's Actions</span>
                <Calendar className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {snapshot.thisWeekActionsDone} <span className="text-slate-500 text-lg">/ {snapshot.thisWeekActionsTotal}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1.5">
                done / planned this week
              </div>
            </div>

            {/* Ventures in Red */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-rose-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Ventures in Red</span>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {snapshot.venturesInRed}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1.5">
                of {snapshot.venturesTotal} active ventures
              </div>
            </div>

            {/* Planning Gaps */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 group shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium">Planning Gaps</span>
                <AlertCircle className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-violet-300 font-mono">
                {snapshot.planningGapsTotal}
              </div>
              <div className="text-xs text-violet-400 font-semibold mt-1.5">
                audit section 4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 · Interactive Focus Scorecard */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/[0.12] space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              ISOLATED TELEMETRY DRILL-DOWN
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">Focus Scorecard</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => {
                  setFocusType('venture');
                  setSelectedFocusId(ventureRows[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  focusType === 'venture'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Focus Venture
              </button>
              <button
                onClick={() => {
                  setFocusType('member');
                  setSelectedFocusId(memberRows[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  focusType === 'member'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Focus Member
              </button>
            </div>

            <select
              value={selectedFocusId}
              onChange={(e) => setSelectedFocusId(e.target.value)}
              className="glass-input text-xs font-semibold px-3 py-2 rounded-2xl text-slate-200 bg-slate-900/90 border-white/10 hover:border-amber-400/40 cursor-pointer shadow-sm"
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

        {/* Focused Card Display */}
        {focusedVenture && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Venture Lead</span>
              <span className="text-sm font-bold text-white mt-1 block">{focusedVenture.leadName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Objectives Done</span>
              <span className="text-sm font-bold text-white font-mono mt-1 block">
                {focusedVenture.completedObjectives} / {focusedVenture.totalObjectives} ({focusedVenture.objectivePercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">KRs (Done/Total)</span>
              <span className="text-sm font-bold text-white font-mono mt-1 block">
                {focusedVenture.krsCompleted} / {focusedVenture.krsTotal}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Overdue (Obj+KR)</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">{focusedVenture.overdueCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Blocked KRs</span>
              <span className="text-sm font-bold text-rose-400 font-mono mt-1 block">{focusedVenture.blockedKrs}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Automated Health</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize mt-1 border shadow-sm ${
                  getHealthBadge(focusedVenture.health).badgeClass
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getHealthBadge(focusedVenture.health).dotClass}`} />
                {focusedVenture.health}
              </span>
            </div>
          </div>
        )}

        {focusedMember && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Status</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">{focusedMember.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Objectives Owned</span>
              <span className="text-sm font-bold text-white font-mono mt-1 block">
                {focusedMember.objectivesDone} / {focusedMember.objectivesOwned}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">KRs Open / Done</span>
              <span className="text-sm font-bold text-white font-mono mt-1 block">
                {focusedMember.krsOpen} / {focusedMember.krsDone}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Actions This Week</span>
              <span className="text-sm font-bold text-white font-mono mt-1 block">
                {focusedMember.actionsWeekDone} / {focusedMember.actionsWeekTotal}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">% Actions Done</span>
              <span className="text-sm font-bold text-sky-400 font-mono mt-1 block">
                {focusedMember.percentActionsCompleted}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Active Consistency</span>
              <span className="text-sm font-bold text-indigo-400 font-mono mt-1 block">{focusedMember.activeDays} days</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 · Progress by Venture Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>2 · Progress by Venture (13 Ventures Portfolio)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Venture</th>
                <th className="p-4">Lead</th>
                <th className="p-4 text-center">Total Objs</th>
                <th className="p-4 text-center">Done</th>
                <th className="p-4 text-center">Pending</th>
                <th className="p-4 text-center">On-Hold</th>
                <th className="p-4 text-center">Blocker</th>
                <th className="p-4 text-center">Obj % Done</th>
                <th className="p-4 text-center">KRs Done/Total</th>
                <th className="p-4 text-center">KR %</th>
                <th className="p-4 text-center">Overdue</th>
                <th className="p-4 text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventureRows.map((v) => {
                const badge = getHealthBadge(v.health);
                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">{v.name}</td>
                    <td className="p-4 text-slate-300 font-medium">{v.leadName}</td>
                    <td className="p-4 text-center font-mono">{v.totalObjectives}</td>
                    <td className="p-4 text-center font-mono text-emerald-400 font-semibold">
                      {v.completedObjectives}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-300">
                      {v.pendingObjectives}
                    </td>
                    <td className="p-4 text-center font-mono text-amber-400">
                      {v.onHoldObjectives}
                    </td>
                    <td className="p-4 text-center font-mono text-rose-400">
                      {v.blockerObjectives}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-sky-400">
                      {v.objectivePercent}%
                    </td>
                    <td className="p-4 text-center font-mono">
                      {v.krsCompleted} / {v.krsTotal}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-teal-400">
                      {v.krPercent}%
                    </td>
                    <td className="p-4 text-center font-mono text-amber-400">
                      {v.overdueCount}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${badge.badgeClass}`}
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

      {/* 4 · Progress by Team Member Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>3 · Progress by Team Member (Founder Excluded)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Member</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Objs Owned</th>
                <th className="p-4 text-center">Objs Done</th>
                <th className="p-4 text-center">KRs Open</th>
                <th className="p-4 text-center">KRs Done</th>
                <th className="p-4 text-center">KRs Overdue</th>
                <th className="p-4 text-center">Actions Today</th>
                <th className="p-4 text-center">Actions Week</th>
                <th className="p-4 text-center">% Completed</th>
                <th className="p-4 text-center">Active Days</th>
                <th className="p-4 text-center">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {memberRows.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">{m.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono">{m.objectivesOwned}</td>
                  <td className="p-4 text-center font-mono text-emerald-400 font-semibold">{m.objectivesDone}</td>
                  <td className="p-4 text-center font-mono text-slate-300">{m.krsOpen}</td>
                  <td className="p-4 text-center font-mono text-teal-400 font-semibold">{m.krsDone}</td>
                  <td className="p-4 text-center font-mono text-amber-400">{m.krsOverdue}</td>
                  <td className="p-4 text-center font-mono">
                    {m.actionsTodayDone} / {m.actionsTodayTotal}
                  </td>
                  <td className="p-4 text-center font-mono">
                    {m.actionsWeekDone} / {m.actionsWeekTotal}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-sky-400">
                    {m.percentActionsCompleted}%
                  </td>
                  <td className="p-4 text-center font-mono text-indigo-400 font-semibold">{m.activeDays} d</td>
                  <td className="p-4 text-center">
                    {m.flag === 'attention' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        Attention
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
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

      {/* 5 · Planning Gaps Finder Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <AlertCircle className="w-4 h-4 text-violet-400" />
          <span>4 · Planning Gaps — Fill These First</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Venture</th>
                <th className="p-4 text-center">Objs without Owner</th>
                <th className="p-4 text-center">Objs without Due Date</th>
                <th className="p-4 text-center">Objs without KRs</th>
                <th className="p-4 text-center">KRs without Owner</th>
                <th className="p-4 text-center">KRs without Due Date</th>
                <th className="p-4 text-center font-bold">Total Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {planningGaps.map((g) => (
                <tr key={g.ventureId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white max-w-xs truncate">
                    {g.ventureName}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-300">
                    {g.objsWithoutOwner}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-300">
                    {g.objsWithoutDueDate}
                  </td>
                  <td className="p-4 text-center font-mono text-violet-300 font-semibold">
                    {g.objsWithoutKrs}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-300">
                    {g.krsWithoutOwner}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-300">
                    {g.krsWithoutDueDate}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-amber-400">
                    {g.totalGaps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 · Rolling 8-Week Trend */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>5 · Weekly Trend — Last 8 Weeks (Mon–Sun)</span>
        </div>

        <div className="overflow-x-auto rounded-3xl glass-panel border border-white/10 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Week Starting</th>
                <th className="p-4 text-center">Actions Planned</th>
                <th className="p-4 text-center">Actions Completed</th>
                {rawProfiles
                  .filter((p) => p.role !== 'founder')
                  .slice(0, 6)
                  .map((p) => (
                    <th key={p.id} className="p-4 text-center">
                      {p.full_name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {weeklyTrend.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-slate-300">
                    {formatDateDDMMYYYY(row.weekStarting)}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-400">
                    {row.actionsPlanned}
                  </td>
                  <td className="p-4 text-center font-mono text-emerald-400 font-bold">
                    {row.actionsCompleted}
                  </td>
                  {rawProfiles
                    .filter((p) => p.role !== 'founder')
                    .slice(0, 6)
                    .map((p) => (
                      <td key={p.id} className="p-4 text-center font-mono text-slate-300">
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
