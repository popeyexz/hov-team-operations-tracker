'use client';

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Clock, User, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { TaskActivityLog, ActionItem } from '@/lib/types';
import { getActionItemLogs } from '@/app/actions/work-actions';
import { formatDateDDMMYYYY } from '@/lib/utils';

interface FeedbackLogModalProps {
  actionItem: ActionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackLogModal({ actionItem, isOpen, onClose }: FeedbackLogModalProps) {
  const [logs, setLogs] = useState<TaskActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && actionItem) {
      setLoading(true);
      getActionItemLogs(actionItem.id)
        .then((data) => setLogs(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, actionItem]);

  if (!isOpen || !actionItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Audit Trail & Feedback Log
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {actionItem.title}
            </h3>
            {actionItem.outcome_achieved && (
              <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="font-semibold text-sky-400">Latest Outcome Achieved: </span>
                {actionItem.outcome_achieved}
              </div>
            )}
          </div>
        </div>

        {/* Log Stream */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 divide-y divide-white/5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading feedback log...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No logged activities or feedback recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const isFeedback = log.action === 'feedback';
              const isApproval = log.action === 'approval';
              const isSubmission = log.action === 'submission';

              return (
                <div key={log.id} className="pt-3.5 first:pt-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: log.actor?.avatar_color || '#3b82f6' }}
                      >
                        {log.actor?.full_name ? log.actor.full_name.charAt(0) : 'U'}
                      </div>
                      <span className="font-semibold text-slate-200">
                        {log.actor?.full_name || 'System / Member'}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        ({log.actor?.role === 'founder' ? 'Founder' : 'Member'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateDDMMYYYY(log.created_at)}</span>
                    </div>
                  </div>

                  <div
                    className={`mt-1 p-3 rounded-2xl text-xs leading-relaxed ${
                      isApproval
                        ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40'
                        : isFeedback
                        ? 'bg-rose-950/30 text-rose-300 border border-rose-800/40'
                        : isSubmission
                        ? 'bg-sky-950/30 text-sky-200 border border-sky-800/40'
                        : 'bg-white/5 text-slate-300 border border-white/5'
                    }`}
                  >
                    <div className="font-medium">{log.content}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-pill hover:bg-white/10 text-xs font-semibold text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
