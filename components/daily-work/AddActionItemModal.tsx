'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Plus } from 'lucide-react';
import { Objective, Profile, Venture, KeyResult } from '@/lib/types';
import { createActionItem } from '@/app/actions/work-actions';
import { DatePickerDDMMYYYY } from './DatePickerDDMMYYYY';

interface AddActionItemModalProps {
  ventures: Venture[];
  profiles: Profile[];
  objectives: Objective[];
  keyResults: KeyResult[];
  preselectedVentureId?: string;
  preselectedObjectiveId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddActionItemModal({
  ventures,
  profiles,
  objectives,
  keyResults,
  preselectedVentureId,
  preselectedObjectiveId,
  isOpen,
  onClose,
  onSuccess,
}: AddActionItemModalProps) {
  const [ventureId, setVentureId] = useState(preselectedVentureId || ventures[0]?.id || '');
  const [objectiveId, setObjectiveId] = useState(preselectedObjectiveId || '');
  const [keyResultId, setKeyResultId] = useState('');
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(profiles[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('not_started');
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
      if (preselectedObjectiveId !== undefined) {
        setObjectiveId(preselectedObjectiveId || '');
      }
      setKeyResultId('');
      setError(null);
    }
  }, [isOpen, preselectedVentureId, preselectedObjectiveId, ventures]);

  if (!isOpen) return null;

  const currentObjectives = objectives.filter((o) => o.venture_id === ventureId);
  const currentKrs = keyResults.filter((k) => k.objective_id === objectiveId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!ventureId) {
      setError('Please select a venture');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await createActionItem({
      ventureId,
      objectiveId: objectiveId || null,
      keyResultId: keyResultId || null,
      title: title.trim(),
      assignedTo: assignedTo || null,
      date: date || null,
      status,
      comments: comments.trim() || undefined,
    });

    setSaving(false);

    if (res.success) {
      setTitle('');
      setComments('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to create action item');
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
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
              Operational Task
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Create Action Item</h3>
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
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete responsive UI testing and connect Supabase auth"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venture</label>
              <select
                value={ventureId}
                onChange={(e) => {
                  setVentureId(e.target.value);
                  setObjectiveId('');
                  setKeyResultId('');
                }}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role === 'founder' ? 'Founder' : p.lead_title || 'Member'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Parent Objective (optional)
              </label>
              <select
                value={objectiveId}
                onChange={(e) => {
                  setObjectiveId(e.target.value);
                  setKeyResultId('');
                }}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
              >
                <option value="">None / Standalone Task</option>
                {currentObjectives.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.sl_no} {o.title.length > 35 ? o.title.substring(0, 35) + '...' : o.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Key Result (optional)
              </label>
              <select
                value={keyResultId}
                disabled={!objectiveId || currentKrs.length === 0}
                onChange={(e) => setKeyResultId(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200 disabled:opacity-50"
              >
                <option value="">None</option>
                {currentKrs.map((k) => (
                  <option key={k.id} value={k.id}>
                    KR {k.kr_code}: {k.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerDDMMYYYY
              label="Action Date (DD-MM-YYYY)"
              value={date}
              onChange={setDate}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted_for_review">Submitted for Review</option>
                <option value="needs_work">Needs Work</option>
                <option value="on_hold">On-Hold</option>
                <option value="blocker">Blocker</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Comments / Notes</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Additional instructions or notes"
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              {saving ? 'Creating...' : 'Create Action Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
