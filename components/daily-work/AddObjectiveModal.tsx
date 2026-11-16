'use client';

import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Profile, Venture } from '@/lib/types';
import { createObjective } from '@/app/actions/work-actions';
import { DatePickerDDMMYYYY } from './DatePickerDDMMYYYY';

interface AddObjectiveModalProps {
  ventures: Venture[];
  profiles: Profile[];
  preselectedVentureId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddObjectiveModal({
  ventures,
  profiles,
  preselectedVentureId,
  isOpen,
  onClose,
  onSuccess,
}: AddObjectiveModalProps) {
  const [ventureId, setVentureId] = useState(preselectedVentureId || ventures[0]?.id || '');
  const [title, setTitle] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (preselectedVentureId) {
        setVentureId(preselectedVentureId);
      } else if (ventures.length > 0 && !ventureId) {
        setVentureId(ventures[0].id);
      }
      setError(null);
    }
  }, [isOpen, preselectedVentureId, ventures]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Objective title is required');
      return;
    }
    if (!ventureId) {
      setError('Please select a venture');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await createObjective({
      ventureId,
      title: title.trim(),
      ownerId: ownerId || null,
      dueDate: dueDate || null,
      comments: comments.trim() || undefined,
    });

    setSaving(false);

    if (res.success) {
      setTitle('');
      setComments('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to create objective');
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Strategic Goal
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Add New Objective</h3>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Venture</label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
            >
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objective Title <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Expand outreach pipeline to 50 prospective partners"
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner (optional)
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>

            <DatePickerDDMMYYYY
              label="Target Due Date"
              value={dueDate}
              onChange={setDueDate}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Comments</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Strategic rationale or notes"
              className="w-full glass-input px-3 py-2 rounded-xl text-xs placeholder:text-slate-500"
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Add Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
