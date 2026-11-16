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
  Filter,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  Flame,
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
              Tab 2 · Forward Planning
            </span>
            <span className="text-xs text-slate-400">Future Pipeline & OKR Roadmapping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Next Plans & Strategic Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVenture}
            onChange={(e) => setSelectedVenture(e.target.value)}
            className="glass-input text-xs font-semibold px-3 py-2 rounded-xl text-slate-200 bg-slate-900/90"
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Draft Future Plan</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-3 text-xs text-slate-300">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
        <p>
          Forward plans represent scheduled initiatives, upcoming campaigns, and prospective OKRs.
          Click <strong className="text-emerald-400">Promote to Daily Work</strong> on any initiative to convert it into an active task on Tab 1.
        </p>
      </div>

      {/* Timeline of Planned Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl glass-panel border border-white/10">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No forward plans drafted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Draft upcoming milestones and scheduled initiatives for your ventures to prepare the roadmap.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Draft First Plan
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                    {item.venture?.code || 'HOV'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {item.venture?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Planned Initiative
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {item.title}
                </h4>

                {item.comments && (
                  <p className="text-xs text-slate-400 mt-1 italic">{item.comments}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-300">
                      Target: {formatDateDDMMYYYY(item.date)}
                    </span>
                  </div>

                  <span>•</span>

                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: item.assignee?.avatar_color || '#3b82f6' }}
                    >
                      {item.assignee?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-slate-300">
                      Lead: {item.assignee?.full_name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-Click Promote Button */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  disabled={promotingId === item.id}
                  onClick={() => handlePromote(item)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform group-hover:scale-105"
                >
                  <ArrowRightCircle className="w-4 h-4" />
                  <span>
                    {promotingId === item.id ? 'Promoting...' : 'Promote to Daily Work'}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
