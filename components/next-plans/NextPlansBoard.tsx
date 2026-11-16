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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      {/* Luxury Command Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.12] shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/[0.08] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-600/[0.06] rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 bg-violet-950/70 px-3 py-1 rounded-full border border-violet-800/50 shadow-[0_0_12px_rgba(139,92,246,0.2)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse led-violet" />
                TAB 2 · FORWARD ROADMAP
              </span>
              <span className="text-xs text-slate-400 font-medium">Strategic Pipeline</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight text-gradient-silver">
              Next Plans & Milestone Roadmapping
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Draft future OKR initiatives, set milestones, and seamlessly promote items to active daily work in 1 click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedVenture}
              onChange={(e) => setSelectedVenture(e.target.value)}
              className="glass-input text-xs font-semibold px-3 py-2 rounded-2xl text-slate-200 bg-slate-900/90 border-white/10 hover:border-violet-400/40 cursor-pointer shadow-sm"
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
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 border border-white/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Next Plan</span>
            </button>
          </div>
        </div>

        {/* Live Plan Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{plannedItems.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Scheduled Deliverables</div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{ventures.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Participating Ventures</div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowRightCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-emerald-300 font-mono">1-Click</div>
              <div className="text-[10px] text-slate-400 font-medium">Instant Promotion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Deliverables Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl glass-panel border border-white/10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mx-auto flex items-center justify-center shadow-lg shadow-violet-500/10">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Planned Initiatives Found</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              No future roadmapped deliverables found for this venture selection.
              Schedule upcoming tasks and OKRs to plan out future operational velocity.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 border border-white/20 transition-all cursor-pointer"
          >
            Schedule Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-between group shadow-lg"
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
