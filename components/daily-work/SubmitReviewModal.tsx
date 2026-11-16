'use client';

import React, { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';
import { ActionItem } from '@/lib/types';
import { submitActionItemForReview } from '@/app/actions/work-actions';

interface SubmitReviewModalProps {
  actionItem: ActionItem | null;
  actorId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitReviewModal({
  actionItem,
  actorId,
  isOpen,
  onClose,
  onSuccess,
}: SubmitReviewModalProps) {
  const [outcome, setOutcome] = useState(actionItem?.outcome_achieved || '');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (actionItem && isOpen) {
      setOutcome(actionItem.outcome_achieved || '');
      setComments('');
      setError(null);
    }
  }, [actionItem, isOpen]);

  if (!isOpen || !actionItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) {
      setError('Please describe the outcome achieved.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await submitActionItemForReview({
      actionItemId: actionItem.id,
      actorId,
      outcomeAchieved: outcome.trim(),
      comments: comments.trim() || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      setOutcome('');
      setComments('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Submission failed');
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Stage 1: Member Submission
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Submit Work for Review</h3>
          </div>
        </div>

        <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <span className="text-slate-400 font-medium">Task: </span>
          <span className="font-semibold text-white">{actionItem.title}</span>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Outcome Achieved <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Describe deliverables finalized, links, metrics, or key results accomplished..."
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Additional Notes / Context for Founder (optional)
            </label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any dependencies or next steps"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
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
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit to Founder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
