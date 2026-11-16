'use client';

import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import { Profile, Venture } from '@/lib/types';
import { createPlannedItem } from '@/app/actions/plan-actions';
import { DatePickerDDMMYYYY } from '../daily-work/DatePickerDDMMYYYY';

interface PlanTaskModalProps {
  ventures: Venture[];
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlanTaskModal({
  ventures,
  profiles,
  isOpen,
  onClose,
  onSuccess,
}: PlanTaskModalProps) {
  const [ventureId, setVentureId] = useState(ventures[0]?.id || '');
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(profiles[0]?.id || '');
  const [targetDate, setTargetDate] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!ventureId) {
      setError('Please select a venture');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await createPlannedItem({
      ventureId,
      title: title.trim(),
      assignedTo: assignedTo || null,
      targetDate: targetDate || null,
      comments: comments.trim() || undefined,
    });

    setSaving(false);

    if (res.success) {
      setTitle('');
      setComments('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to create plan');
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
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Tab 2: Forward Planning
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Draft Future Initiative</h3>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Initiative Title <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Growth Hack sprint for B2B client acquisition"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lead / Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
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
          </div>

          <DatePickerDDMMYYYY
            label="Target Implementation Date (DD-MM-YYYY)"
            value={targetDate}
            onChange={setTargetDate}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Planning Notes</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Strategic deliverables, target milestones, budget"
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
              className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              {saving ? 'Saving...' : 'Add to Next Plans'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
