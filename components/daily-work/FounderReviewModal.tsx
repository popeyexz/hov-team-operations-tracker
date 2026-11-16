'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { ActionItem } from '@/lib/types';
import { founderReviewActionItem } from '@/app/actions/work-actions';

interface FounderReviewModalProps {
  actionItem: ActionItem | null;
  founderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FounderReviewModal({
  actionItem,
  founderId,
  isOpen,
  onClose,
  onSuccess,
}: FounderReviewModalProps) {
  const [decision, setDecision] = useState<'approve' | 'needs_work'>('approve');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !actionItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'needs_work' && !feedback.trim()) {
      setError('Please provide feedback comments so the team member knows what to revise.');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await founderReviewActionItem({
      actionItemId: actionItem.id,
      founderId,
      approved: decision === 'approve',
      feedback: feedback.trim() || undefined,
    });

    setSaving(false);

    if (res.success) {
      setFeedback('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Review submission failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
              Stage 2: Founder Evaluation
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Review Task Deliverable</h3>
          </div>
        </div>

        {/* Task & Outcome Details */}
        <div className="mb-4 space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <div>
            <span className="text-slate-400">Task: </span>
            <span className="font-semibold text-white">{actionItem.title}</span>
          </div>
          <div>
            <span className="text-slate-400">Assigned Member: </span>
            <span className="font-semibold text-sky-300">
              {actionItem.assignee?.full_name || 'Unassigned'}
            </span>
          </div>
          {actionItem.outcome_achieved && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-slate-400 font-medium">Submitted Outcome: </span>
              <p className="text-slate-200 mt-1 italic leading-relaxed">
                "{actionItem.outcome_achieved}"
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  decision === 'approve'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/15'
                    : 'glass-card border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Approve (Completed)
              </button>

              <button
                type="button"
                onClick={() => setDecision('needs_work')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  decision === 'needs_work'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/15'
                    : 'glass-card border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Request Changes (Needs Work)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {decision === 'needs_work' ? (
                <span>
                  Corrective Feedback <span className="text-rose-400">*</span>
                </span>
              ) : (
                <span>Feedback / Praise Notes (optional)</span>
              )}
            </label>
            <textarea
              rows={3}
              required={decision === 'needs_work'}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                decision === 'needs_work'
                  ? 'Specify what needs adjustment, missing items, or next steps...'
                  : 'Great work! Confirmed and completed.'
              }
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg flex items-center gap-2 text-white ${
                decision === 'approve'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/20'
              }`}
            >
              {saving
                ? 'Processing...'
                : decision === 'approve'
                ? 'Confirm & Mark Completed'
                : 'Send Changes to Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
