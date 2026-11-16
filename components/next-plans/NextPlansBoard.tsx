'use client';

import React, { useState } from 'react';
import { ActionItem, Profile, Venture } from '@/lib/types';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { promotePlanToDailyWork } from '@/app/actions/plan-actions';
import {
  Calendar,
  ArrowRightCircle,
  Plus,
  Sparkles,
  Building2,
  Clock,
  Compass,
  Layers,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { PlanTaskModal } from './PlanTaskModal';

interface NextPlansBoardProps {
  plannedItems: ActionItem[];
  ventures: Venture[];
  profiles: Profile[];
  onRefresh: () => void;
}

export function NextPlansBoard({
  plannedItems,
  ventures,
  profiles,
  onRefresh,
}: NextPlansBoardProps) {
  const { activeProfile } = useActiveProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenture, setSelectedVenture] = useState<string>('all');
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const handlePromote = async (item: ActionItem) => {
    setPromotingId(item.id);
    const res = await promotePlanToDailyWork(item.id, activeProfile?.id);
    setPromotingId(null);
    if (res.success) {
      onRefresh();
    }
  };

  const filteredItems = plannedItems.filter((item) => {
    if (selectedVenture === 'all') return true;
    return item.venture_id === selectedVenture;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Precision Operations Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-5 sm:p-6 rounded-xl shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>TAB 2 // FORWARD ROADMAP</span>
              <span className="text-zinc-600">•</span>
              <span>Milestone Pipeline</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">
              Next Plans & Milestone Roadmapping
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl font-normal leading-relaxed">
              Draft upcoming OKR initiatives, set target milestones, and promote tasks to active daily work in 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedVenture}
              onChange={(e) => setSelectedVenture(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg text-zinc-300 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer focus:outline-none"
            >
              <option value="all">All Ventures ({ventures.length})</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Next Plan</span>
            </button>
          </div>
        </div>

        {/* Live Plan Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-base font-semibold text-zinc-100 font-mono">{plannedItems.length}</div>
              <div className="text-[11px] text-zinc-500 font-mono">Scheduled Deliverables</div>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-base font-semibold text-zinc-100 font-mono">{ventures.length}</div>
              <div className="text-[11px] text-zinc-500 font-mono">Participating Ventures</div>
            </div>
          </div>

          <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowRightCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-base font-semibold text-emerald-400 font-mono">1-Click</div>
              <div className="text-[11px] text-zinc-500 font-mono">Instant Daily Promotion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Deliverables Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">No Planned Initiatives Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto font-normal">
              No roadmapped deliverables found for this venture selection. Schedule upcoming tasks and OKRs to plan out future velocity.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Schedule Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 flex flex-col justify-between group shadow-sm transition-all"
            >
              <div>
                {/* Venture Code & Target Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-sky-300 bg-sky-950/70 px-2.5 py-0.5 rounded-lg border border-sky-800/40">
                    {item.venture?.code || 'HOV'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Target: {formatDateDDMMYYYY(item.date)}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug group-hover:text-violet-200 transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {item.venture?.name}
                </p>

                {item.objective && (
                  <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                    <span className="font-mono font-bold text-violet-400">Obj #{item.objective.sl_no}</span>
                    <span className="truncate">{item.objective.title}</span>
                  </div>
                )}
              </div>

              {/* Assignee & Promote Button */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/20"
                    style={{ backgroundColor: item.assignee?.avatar_color || '#6366f1' }}
                  >
                    {item.assignee?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {item.assignee?.full_name || 'Unassigned'}
                  </span>
                </div>

                <button
                  onClick={() => handlePromote(item)}
                  disabled={promotingId === item.id}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  title="Move to Tab 1 (Daily Work)"
                >
                  <Send className="w-3 h-3" />
                  <span>{promotingId === item.id ? 'Promoting...' : 'Promote'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Task Modal */}
      <PlanTaskModal
        ventures={ventures}
        profiles={profiles}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => onRefresh()}
      />
    </div>
  );
}
