'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  isOverdue,
} from '@/lib/utils';
import {
  Search,
  ChevronDown,
  Plus,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  FileSpreadsheet,
  CheckCheck,
  Calendar,
  X,
  Target,
  FileText,
  Smartphone,
} from 'lucide-react';
import { deleteActionItem } from '@/app/actions/work-actions';
import { VentureDocumentsDrawer } from '../venture/VentureDocumentsDrawer';
import { FeedbackLogModal } from './FeedbackLogModal';
import { SubmitReviewModal } from './SubmitReviewModal';
import { FounderReviewModal } from './FounderReviewModal';
import { AddActionItemModal } from './AddActionItemModal';
import { AddObjectiveModal } from './AddObjectiveModal';
import { AddKeyResultModal } from './AddKeyResultModal';
import { ExcelImportModal } from '../import/ExcelImportModal';
import { InstaMobileFeed } from './InstaMobileFeed';

interface DailyWorkContainerProps {
  initialData: {
    profiles: Profile[];
    ventures: Venture[];
    objectives: Objective[];
    keyResults: KeyResult[];
    actionItems: ActionItem[];
    myVentureIds: string[];
    assignedFromOtherVentures: ActionItem[];
    venturesLed: Venture[];
  };
  onRefresh: () => void;
}

type ScopeFilter = 'all' | 'active-krs' | 'cross-assigned';
type SheetTab = 'objectives' | 'krs' | 'tasks' | 'side-by-side';
type StatusFilter = 'all' | 'pending' | 'blocker' | 'completed';

export function DailyWorkContainer({ initialData, onRefresh }: DailyWorkContainerProps) {
  const { activeProfile, effectiveProfile } = useActiveProfile();
  const isFounder = activeProfile?.role === 'founder';

  const {
    profiles,
    ventures,
    objectives,
    keyResults,
    actionItems,
    myVentureIds,
    assignedFromOtherVentures,
    venturesLed,
  } = initialData;

  // UI state
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [sheetTab, setSheetTab] = useState<SheetTab>('objectives');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedVentureId, setSelectedVentureId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFeed, setIsMobileFeed] = useState<boolean>(false);

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddObjectiveOpen, setIsAddObjectiveOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddKROpen, setIsAddKROpen] = useState(false);
  const [selectedObjectiveForKR, setSelectedObjectiveForKR] = useState<Objective | null>(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<ActionItem | null>(null);
  const [selectedTaskForFounderReview, setSelectedTaskForFounderReview] = useState<ActionItem | null>(null);
  const [selectedItemForFeedback, setSelectedItemForFeedback] = useState<ActionItem | null>(null);
  const [selectedVentureForDocs, setSelectedVentureForDocs] = useState<Venture | null>(null);

  // Listen for Navbar toggle event
  useEffect(() => {
    const handleToggle = () => setIsMobileFeed((prev) => !prev);
    window.addEventListener('toggle-mobile-view', handleToggle);
    return () => window.removeEventListener('toggle-mobile-view', handleToggle);
  }, []);

  // Compute stats
  const krsCount = keyResults.length;
  const crossAssignedCount = assignedFromOtherVentures?.length || 0;

  // Filter objectives
  const filteredObjectives = useMemo(() => {
    return objectives.filter((o) => {
      // Venture filter
      if (selectedVentureId !== 'all' && o.venture_id !== selectedVentureId) {
        return false;
      }
      // Scope filter
      if (scopeFilter === 'active-krs') {
        const hasKrs = keyResults.some((k) => k.objective_id === o.id);
        if (!hasKrs) return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        const oKrs = keyResults.filter((k) => k.objective_id === o.id);
        const allDone = oKrs.length > 0 && oKrs.every((k) => k.status === 'completed');
        const hasBlocker = oKrs.some((k) => k.status === 'blocker' || k.status === 'on_hold');
        const calcStatus = allDone || o.status === 'completed'
          ? 'completed'
          : hasBlocker || o.status === 'blocker' || o.status === 'on_hold'
          ? 'blocker'
          : 'pending';

        if (statusFilter === 'blocker' && calcStatus !== 'blocker') return false;
        if (statusFilter === 'completed' && calcStatus !== 'completed') return false;
        if (statusFilter === 'pending' && calcStatus !== 'pending') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const v = ventures.find((x) => x.id === o.venture_id);
        const owner = profiles.find((p) => p.id === o.owner_id);
        const matchTitle = o.title.toLowerCase().includes(q);
        const matchVenture = v?.name.toLowerCase().includes(q) || v?.code.toLowerCase().includes(q);
        const matchOwner = owner?.full_name.toLowerCase().includes(q);
        if (!matchTitle && !matchVenture && !matchOwner) return false;
      }
      return true;
    });
  }, [objectives, selectedVentureId, scopeFilter, statusFilter, searchQuery, keyResults, ventures, profiles]);

  // Filter Key Results
  const filteredKeyResults = useMemo(() => {
    return keyResults.filter((k) => {
      if (selectedVentureId !== 'all' && k.venture_id !== selectedVentureId) return false;
      if (statusFilter === 'completed' && k.status !== 'completed') return false;
      if (statusFilter === 'pending' && k.status !== 'pending') return false;
      if (statusFilter === 'blocker' && k.status !== 'blocker' && k.status !== 'on_hold') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const v = ventures.find((x) => x.id === k.venture_id);
        if (!k.title.toLowerCase().includes(q) && !k.kr_code.toLowerCase().includes(q) && !v?.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [keyResults, selectedVentureId, statusFilter, searchQuery, ventures]);

  // Filter Tasks / Action items
  const filteredActionItems = useMemo(() => {
    return actionItems.filter((a) => {
      if (!a.is_planned) {
        if (selectedVentureId !== 'all' && a.venture_id !== selectedVentureId) return false;
        if (scopeFilter === 'cross-assigned' && !assignedFromOtherVentures.some((x) => x.id === a.id)) return false;
        if (statusFilter === 'completed' && a.status !== 'completed') return false;
        if (statusFilter === 'pending' && a.status !== 'not_started' && a.status !== 'in_progress') return false;
        if (statusFilter === 'blocker' && a.status !== 'blocker' && a.status !== 'on_hold' && a.status !== 'needs_work') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const v = ventures.find((x) => x.id === a.venture_id);
          if (!a.title.toLowerCase().includes(q) && !v?.name.toLowerCase().includes(q)) return false;
        }
        return true;
      }
      return false;
    });
  }, [actionItems, selectedVentureId, scopeFilter, statusFilter, searchQuery, ventures, assignedFromOtherVentures]);

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;
    try {
      await deleteActionItem(id);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Failed to delete item');
    }
  };

  if (isMobileFeed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0E1836] border border-[#FFF7E6]/15">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#FFF7E6]">
            Mobile Feed Active
          </span>
          <button
            onClick={() => setIsMobileFeed(false)}
            className="px-3 py-1 rounded-full bg-[#FFF7E6] text-[#0A122A] text-xs font-bold font-display uppercase tracking-wider"
          >
            Switch to Spreadsheet Table
          </button>
        </div>
        <InstaMobileFeed
          member={effectiveProfile || activeProfile!}
          ventures={ventures}
          objectives={objectives}
          keyResults={keyResults}
          actionItems={actionItems}
          onAddObjective={(vId) => {
            setIsAddObjectiveOpen(true);
          }}
          onAddKR={(oId) => {
            const foundObj = objectives.find((x) => x.id === oId) || null;
            setSelectedObjectiveForKR(foundObj);
            setIsAddKROpen(true);
          }}
          onAddTask={(vId, oId) => {
            setIsAddTaskOpen(true);
          }}
          onImportExcel={() => setIsImportModalOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 select-none pb-24">
      {/* 1. Hero Card: IMPORT YOUR EXCEL WORKBOOK (Matching Image 4) */}
      <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] p-8 text-center shadow-xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wider uppercase text-[#FFF7E6] mb-2">
          IMPORT YOUR EXCEL WORKBOOK
        </h2>
        <p className="text-xs sm:text-sm text-[#FFF7E6]/70 max-w-xl mx-auto mb-6">
          Select your .xlsx workbook to populate Ventures, Venture Leads, Objectives, Key Results, and Action Items.
        </p>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-6 py-2.5 rounded-full bg-[#FFF7E6] text-[#0A122A] font-display text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          IMPORT EXCEL (.XLSX)
        </button>
      </div>

      {/* 2. Filter Controls Bar 1 (Pills Left, Venture Dropdown & Search & Actions Right) */}
      <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left Scope Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setScopeFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              scopeFilter === 'all'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'border border-[#FFF7E6]/25 text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:border-[#FFF7E6]'
            }`}
          >
            ALL VENTURES <span className="ml-1 text-[10px] opacity-80">{ventures.length}</span>
          </button>

          <button
            onClick={() => setScopeFilter('active-krs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              scopeFilter === 'active-krs'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'border border-[#FFF7E6]/25 text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:border-[#FFF7E6]'
            }`}
          >
            ACTIVE WITH KRS <span className="ml-1 text-[10px] opacity-80">{krsCount}</span>
          </button>

          <button
            onClick={() => setScopeFilter('cross-assigned')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              scopeFilter === 'cross-assigned'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'border border-[#FFF7E6]/25 text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:border-[#FFF7E6]'
            }`}
          >
            CROSS-VENTURE ASSIGNED <span className="ml-1 text-[10px] opacity-80">{crossAssignedCount}</span>
          </button>
        </div>

        {/* Right Search, Venture Picker & Add Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedVentureId}
              onChange={(e) => setSelectedVentureId(e.target.value)}
              className="appearance-none px-4 py-1.5 pr-8 rounded-full bg-[#071026] border border-[#FFF7E6]/25 text-xs font-bold font-display uppercase tracking-wider text-[#FFF7E6] cursor-pointer focus:outline-none focus:border-[#FFF7E6]"
            >
              <option value="all">All Ventures ({ventures.length})</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#FFF7E6]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-[#071026] border border-[#FFF7E6]/25 text-xs text-[#FFF7E6] placeholder-[#FFF7E6]/40 focus:outline-none focus:border-[#FFF7E6] w-36 sm:w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsAddObjectiveOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FFF7E6]/30 hover:border-[#FFF7E6] text-[#FFF7E6] text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer hover:bg-white/5"
          >
            <span>+ OBJECTIVE</span>
          </button>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF7E6] text-[#0A122A] text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer shadow hover:opacity-90"
          >
            <span>+ TASK</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Controls Bar 2 (Tabs Left, Segmented Status Filter Right) */}
      <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] p-2 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSheetTab('objectives')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              sheetTab === 'objectives'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:bg-white/5'
            }`}
          >
            OBJECTIVES SHEET <span className="ml-1 text-[10px] opacity-80">{filteredObjectives.length}</span>
          </button>

          <button
            onClick={() => setSheetTab('krs')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              sheetTab === 'krs'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:bg-white/5'
            }`}
          >
            KEY RESULTS SHEET <span className="ml-1 text-[10px] opacity-80">{filteredKeyResults.length}</span>
          </button>

          <button
            onClick={() => setSheetTab('tasks')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              sheetTab === 'tasks'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:bg-white/5'
            }`}
          >
            DAILY ACTION PLAN <span className="ml-1 text-[10px] opacity-80">{filteredActionItems.length}</span>
          </button>

          <button
            onClick={() => setSheetTab('side-by-side')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              sheetTab === 'side-by-side'
                ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                : 'text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:bg-white/5'
            }`}
          >
            SIDE-BY-SIDE VENTURE COLUMNS <span className="ml-1 text-[10px] opacity-80">{ventures.length}</span>
          </button>
        </div>

        {/* Right Status Filter Segment */}
        <div className="flex items-center bg-[#071026] p-1 rounded-full border border-[#FFF7E6]/20">
          {(['all', 'pending', 'blocker', 'completed'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#FFF7E6] text-[#0A122A] shadow-sm'
                  : 'text-[#FFF7E6]/70 hover:text-[#FFF7E6]'
              }`}
            >
              {st === 'all'
                ? 'All'
                : st === 'pending'
                ? 'Pending'
                : st === 'blocker'
                ? 'Blocker / Hold'
                : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SPREADSHEET TABLE: OBJECTIVES SHEET (Matching Image 4) */}
      {sheetTab === 'objectives' && (
        <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FFF7E6]/15 bg-[#071026] text-[10px] font-display font-bold uppercase tracking-wider text-[#FFF7E6]/75">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">SCOPE</th>
                  <th className="py-3 px-3">VENTURE</th>
                  <th className="py-3 px-3">VENTURE LEAD</th>
                  <th className="py-3 px-3 text-center">SL NO</th>
                  <th className="py-3 px-4 min-w-[280px]">OBJECTIVES</th>
                  <th className="py-3 px-3 text-center">STATUS (AUTO)</th>
                  <th className="py-3 px-3 min-w-[140px]">KR PROGRESS (AUTO %)</th>
                  <th className="py-3 px-3">OWNER</th>
                  <th className="py-3 px-3">DUE DATE</th>
                  <th className="py-3 px-3 text-center">COMMENTS</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF7E6]/10 font-mono text-[11px]">
                {filteredObjectives.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-16 text-center text-xs text-[#FFF7E6]/60 font-mono">
                      No rows to display yet. Click Import Excel in the top bar to load your workbook.
                    </td>
                  </tr>
                ) : (
                  filteredObjectives.map((o, idx) => {
                    const v = ventures.find((x) => x.id === o.venture_id);
                    const owner = profiles.find((p) => p.id === o.owner_id);
                    const lead = profiles.find((p) => p.id === v?.lead_id);
                    const isLed = myVentureIds.includes(o.venture_id);
                    const oKrs = keyResults.filter((k) => k.objective_id === o.id);
                    const doneKrs = oKrs.filter((k) => k.status === 'completed').length;
                    const pct = oKrs.length
                      ? Math.round((doneKrs / oKrs.length) * 100)
                      : o.status === 'completed'
                      ? 100
                      : 0;

                    const statusBadge =
                      pct === 100 || o.status === 'completed'
                        ? { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
                        : o.status === 'blocker' || o.status === 'on_hold'
                        ? { label: 'Blocker / Hold', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
                        : { label: 'Pending', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="py-3 px-3 text-center opacity-50">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              isLed
                                ? 'bg-[#FFF7E6]/10 text-[#FFF7E6] border-[#FFF7E6]/30'
                                : 'bg-blue-500/10 text-sky-300 border-sky-400/30'
                            }`}
                          >
                            {isLed ? 'LED VENTURE' : 'CROSS-VENTURE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-display font-bold text-[#FFF7E6] whitespace-nowrap">
                          {v?.name || v?.code || '—'}
                        </td>
                        <td className="py-3 px-3 uppercase text-[#FFF7E6]/80 whitespace-nowrap">
                          {lead?.full_name || 'PRATAP'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#FFF7E6]/70">
                          #{o.sl_no}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-[#FFF7E6] font-medium leading-relaxed">
                          {o.title}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#FFF7E6]/15 overflow-hidden">
                              <div
                                className="h-full bg-[#FFF7E6] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold w-8 text-right text-[#FFF7E6]/90">
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 uppercase text-[#FFF7E6]/80 whitespace-nowrap">
                          {owner?.full_name || 'LEAD'}
                        </td>
                        <td className="py-3 px-3 text-[#FFF7E6]/60 whitespace-nowrap">
                          {o.due_date || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              // If there are action items for this objective, open logs for the first one
                              const matchingTask = actionItems.find((a) => a.objective_id === o.id);
                              if (matchingTask) {
                                setSelectedItemForFeedback(matchingTask);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#FFF7E6]/60 hover:text-[#FFF7E6] hover:bg-white/5 transition-colors cursor-pointer"
                            title="Comments & Audit Log"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedObjectiveForKR(o);
                                setIsAddKROpen(true);
                              }}
                              className="px-2 py-1 rounded border border-[#FFF7E6]/25 hover:border-[#FFF7E6] text-[10px] font-bold uppercase transition-all cursor-pointer text-[#FFF7E6]"
                              title="Add Key Result (1.1 - 1.5)"
                            >
                              + KR
                            </button>
                            <button
                              onClick={() => {
                                setIsAddTaskOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-[#FFF7E6] text-[#0A122A] text-[10px] font-bold uppercase transition-all cursor-pointer shadow-sm hover:opacity-90"
                              title="Add Action Item"
                            >
                              + Task
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SPREADSHEET TABLE: KEY RESULTS SHEET */}
      {sheetTab === 'krs' && (
        <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FFF7E6]/15 bg-[#071026] text-[10px] font-display font-bold uppercase tracking-wider text-[#FFF7E6]/75">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">VENTURE</th>
                  <th className="py-3 px-3 text-center">KR CODE</th>
                  <th className="py-3 px-4 min-w-[280px]">KEY RESULT</th>
                  <th className="py-3 px-3">TARGET MEASURE</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF7E6]/10 font-mono text-[11px]">
                {filteredKeyResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-xs text-[#FFF7E6]/60 font-mono">
                      No Key Results found. Add Key Results directly to your objectives above.
                    </td>
                  </tr>
                ) : (
                  filteredKeyResults.map((kr, idx) => {
                    const v = ventures.find((x) => x.id === kr.venture_id);
                    return (
                      <tr key={kr.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-3 text-center opacity-50">{idx + 1}</td>
                        <td className="py-3 px-3 font-display font-bold text-[#FFF7E6] whitespace-nowrap">
                          {v?.name || '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-cyan-300">
                          {kr.kr_code}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-[#FFF7E6] font-medium leading-relaxed">
                          {kr.title}
                        </td>
                        <td className="py-3 px-3 text-[#FFF7E6]/80">{kr.target_measure || '—'}</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              kr.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {kr.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="px-2.5 py-1 rounded bg-[#FFF7E6] text-[#0A122A] text-[10px] font-bold uppercase transition-all shadow-sm"
                          >
                            + Task
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SPREADSHEET TABLE: DAILY ACTION PLAN */}
      {sheetTab === 'tasks' && (
        <div className="rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FFF7E6]/15 bg-[#071026] text-[10px] font-display font-bold uppercase tracking-wider text-[#FFF7E6]/75">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">VENTURE</th>
                  <th className="py-3 px-4 min-w-[280px]">ACTION ITEM / TASK</th>
                  <th className="py-3 px-3">ASSIGNED TO</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-center">STAGE</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF7E6]/10 font-mono text-[11px]">
                {filteredActionItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-xs text-[#FFF7E6]/60 font-mono">
                      No action items recorded for this view. Click &quot;+ Task&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredActionItems.map((a, idx) => {
                    const v = ventures.find((x) => x.id === a.venture_id);
                    const assignee = profiles.find((p) => p.id === a.assigned_to);
                    return (
                      <tr key={a.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-3 text-center opacity-50">{idx + 1}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-[#FFF7E6]/80">{a.date}</td>
                        <td className="py-3 px-3 font-display font-bold text-[#FFF7E6] whitespace-nowrap">
                          {v?.name || '—'}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-[#FFF7E6] font-medium leading-relaxed">
                          {a.title}
                        </td>
                        <td className="py-3 px-3 uppercase text-[#FFF7E6]/80 whitespace-nowrap">
                          {assignee?.full_name || 'UNASSIGNED'}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              a.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : a.status === 'submitted_for_review'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {a.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-[10px] uppercase text-[#FFF7E6]/70 whitespace-nowrap">
                          {a.is_founder_confirmed ? 'CONFIRMED' : a.is_member_completed ? 'SUBMITTED' : 'IN PROGRESS'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isFounder && a.status === 'submitted_for_review' && (
                              <button
                                onClick={() => setSelectedTaskForFounderReview(a)}
                                className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold uppercase"
                              >
                                Review
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedItemForFeedback(a)}
                              className="p-1 rounded text-zinc-400 hover:text-white"
                              title="Audit Trail"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            {isFounder && (
                              <button
                                onClick={() => handleDeleteTask(a.id)}
                                className="p-1 rounded text-rose-400 hover:text-rose-300"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SPREADSHEET TABLE: SIDE-BY-SIDE VENTURE COLUMNS */}
      {sheetTab === 'side-by-side' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-4 min-w-max">
            {ventures.map((v) => {
              const vObjs = objectives.filter((o) => o.venture_id === v.id);
              const vKrs = keyResults.filter((k) => k.venture_id === v.id);
              const vActs = actionItems.filter((a) => a.venture_id === v.id && !a.is_planned);
              const lead = profiles.find((p) => p.id === v.lead_id);

              return (
                <div
                  key={v.id}
                  className="w-80 rounded-2xl border border-[#FFF7E6]/15 bg-[#0E1836] flex flex-col flex-shrink-0 shadow-lg"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-[#FFF7E6]/15 bg-[#071026] rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs uppercase text-[#FFF7E6]">
                        {v.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FFF7E6]/10 text-[#FFF7E6]">
                        {v.code}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#FFF7E6]/60 mt-1 uppercase">
                      Lead: {lead?.full_name || 'Pratap'}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[#FFF7E6]/80">
                      <span>{vObjs.length} Objs</span>
                      <span>&bull;</span>
                      <span>{vKrs.length} KRs</span>
                      <span>&bull;</span>
                      <span>{vActs.length} Tasks</span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto">
                    {vObjs.length === 0 ? (
                      <div className="py-6 text-center text-[10px] font-mono text-[#FFF7E6]/40">
                        No objectives for this venture
                      </div>
                    ) : (
                      vObjs.map((o) => (
                        <div
                          key={o.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-[#FFF7E6]/10 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#FFF7E6]/60 font-mono">
                            <span>#{o.sl_no}</span>
                            <span className="uppercase text-[9px]">{o.status}</span>
                          </div>
                          <p className="font-sans text-xs text-[#FFF7E6] font-medium leading-snug">
                            {o.title}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => onRefresh()}
      />

      <AddObjectiveModal
        isOpen={isAddObjectiveOpen}
        onClose={() => setIsAddObjectiveOpen(false)}
        ventures={ventures}
        profiles={profiles}
        onSuccess={() => onRefresh()}
      />

      <AddActionItemModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        ventures={ventures}
        objectives={objectives}
        keyResults={keyResults}
        profiles={profiles}
        onSuccess={() => onRefresh()}
      />

      <AddKeyResultModal
        isOpen={isAddKROpen}
        onClose={() => setIsAddKROpen(false)}
        objective={selectedObjectiveForKR}
        profiles={profiles}
        keyResults={keyResults}
        onSuccess={() => onRefresh()}
      />

      <FeedbackLogModal
        isOpen={!!selectedItemForFeedback}
        onClose={() => setSelectedItemForFeedback(null)}
        actionItem={selectedItemForFeedback}
      />

      <SubmitReviewModal
        isOpen={!!selectedTaskForReview}
        onClose={() => setSelectedTaskForReview(null)}
        actionItem={selectedTaskForReview}
        actorId={effectiveProfile?.id || ''}
        onSuccess={() => onRefresh()}
      />

      {isFounder && selectedTaskForFounderReview && (
        <FounderReviewModal
          isOpen={true}
          onClose={() => setSelectedTaskForFounderReview(null)}
          actionItem={selectedTaskForFounderReview}
          founderId={effectiveProfile?.id || ''}
          onSuccess={() => onRefresh()}
        />
      )}

      <VentureDocumentsDrawer
        isOpen={!!selectedVentureForDocs}
        onClose={() => setSelectedVentureForDocs(null)}
        venture={selectedVentureForDocs}
      />
    </div>
  );
}
