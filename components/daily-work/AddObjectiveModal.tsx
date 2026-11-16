'use client';

import React, { useState } from 'react';
import { X, Target, ShieldAlert } from 'lucide-react';
import { Profile, Venture } from '@/lib/types';
import { createObjective } from '@/app/actions/work-actions';
import { DatePickerDDMMYYYY } from './DatePickerDDMMYYYY';

interface AddObjectiveModalProps {
  ventures: Venture[];
  profiles: Profile[];
  preselectedVentureId?: string;
  founderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddObjectiveModal({
  ventures,
  profiles,
  preselectedVentureId,
  founderId,
  isOpen,
  onClose,
  onSuccess,
}: AddObjectiveModalProps) {
  const [ventureId, setVentureId] = useState(preselectedVentureId || ventures[0]?.id || '');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const founder = profiles.find((p) => p.role === 'founder');

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
      dueDate: dueDate || null,
      comments: comments.trim() || undefined,
      actorId: founderId || founder?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-zinc-100">Define Strategic Objective</h3>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                FOUNDER ONLY
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Strategic objectives can only be defined by the Founder</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 font-mono">VENTURE</label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
            >
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 font-mono">
              OBJECTIVE TITLE <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finalise the Content Buckets of PS.HOV"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1 font-mono">
                AUTHORITY / ISSUER
              </label>
              <div className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between">
                <span>{founder?.full_name || 'Pratap'} (Founder)</span>
                <span className="text-[10px] text-[#F4AEBE] font-bold font-mono">FOUNDER</span>
              </div>
            </div>

            <DatePickerDDMMYYYY
              label="Target Due Date"
              value={dueDate}
              onChange={setDueDate}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 font-mono">STRATEGIC NOTES</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Key strategic context or rationale"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
