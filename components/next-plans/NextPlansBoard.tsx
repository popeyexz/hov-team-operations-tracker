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
  Building2,
  Clock,
  Send,
} from 'lucide-react';
import { PlanTaskModal } from './PlanTaskModal';
import { NetflixAvatar } from '../auth/NetflixAvatar';

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
      {/* Liquid Operations Header */}
      <div className="liquid-card !rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>TAB 2 // FORWARD ROADMAP</span>
              <span className="text-zinc-600">•</span>
              <span>Milestone Pipeline</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Next Plans & Milestone Roadmapping
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xl font-normal leading-relaxed">
              Draft upcoming OKR initiatives, set target milestones, and promote tasks to active daily work in 1 click.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedVenture}
              onChange={(e) => setSelectedVenture(e.target.value)}
              className="text-xs font-mono px-3.5 py-2 rounded-xl text-zinc-200 bg-[#12131f] border border-white/[0.1] hover:border-violet-500/40 cursor-pointer focus:outline-none shadow-sm"
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
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.45)] border border-violet-400/40 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Next Plan</span>
            </button>
          </div>
        </div>

        {/* Liquid Plan Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.25)] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{plannedItems.length}</div>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Scheduled Deliverables</div>
            </div>
          </div>

          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono">{ventures.length}</div>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Participating Ventures</div>
            </div>
          </div>

          <div className="liquid-card !rounded-2xl p-3.5 flex items-center gap-3.5 hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
              <ArrowRightCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-emerald-400 font-mono">1-Click</div>
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Instant Daily Promotion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Deliverables Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl liquid-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/[0.1] text-zinc-400 mx-auto flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Planned Initiatives Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto font-normal">
              No roadmapped deliverables found for this venture selection. Schedule upcoming tasks and OKRs to plan out future velocity.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Schedule Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="liquid-card !rounded-2xl p-5 hover:border-violet-500/40 hover:shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Venture Code & Target Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-violet-300 bg-violet-500/15 px-2.5 py-0.5 rounded-lg border border-violet-500/30">
                    {item.venture?.code || 'HOV'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-[#0e0f18] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Target: {formatDateDDMMYYYY(item.date)}</span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-zinc-100 transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  {item.venture?.name}
                </p>

                {item.objective && (
                  <div className="mt-3.5 p-2.5 rounded-xl bg-[#0e101a] border border-white/[0.06] text-[11px] text-zinc-300 flex items-start gap-2">
                    <span className="font-mono font-semibold text-violet-300 shrink-0">Obj #{item.objective.sl_no}</span>
                    <span className="truncate">{item.objective.title}</span>
                  </div>
                )}
              </div>

              {/* Assignee & Promote Button */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <NetflixAvatar
                    name={item.assignee?.full_name || 'U'}
                    role={item.assignee?.role}
                    avatarColor={item.assignee?.avatar_color}
                    size="sm"
                    className="!w-5 !h-5 rounded-md shadow-sm"
                  />
                  <span className="text-xs text-zinc-200 font-medium">
                    {item.assignee?.full_name || 'Unassigned'}
                  </span>
                </div>

                <button
                  onClick={() => handlePromote(item)}
                  disabled={promotingId === item.id}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
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
