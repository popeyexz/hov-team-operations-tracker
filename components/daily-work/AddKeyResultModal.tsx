'use client';

import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { Objective, Profile } from '@/lib/types';
import { createKeyResult } from '@/app/actions/work-actions';
import { DatePickerDDMMYYYY } from './DatePickerDDMMYYYY';

interface AddKeyResultModalProps {
  objective: Objective | null;
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddKeyResultModal({
  objective,
  profiles,
  isOpen,
  onClose,
  onSuccess,
}: AddKeyResultModalProps) {
  const [krCode, setKrCode] = useState(() => `${objective?.sl_no || 1}.1`);
  const [title, setTitle] = useState('');
  const [targetMeasure, setTargetMeasure] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && objective) {
      setKrCode(`${objective.sl_no}.1`);
      setTitle('');
      setTargetMeasure('');
      setOwnerId('');
      setDueDate('');
      setError(null);
    }
  }, [isOpen, objective]);

  if (!isOpen || !objective) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Key Result title is required');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await createKeyResult({
      objectiveId: objective.id,
      ventureId: objective.venture_id,
      krCode: krCode.trim(),
      title: title.trim(),
      targetMeasure: targetMeasure.trim() || undefined,
      ownerId: ownerId || null,
      dueDate: dueDate || null,
    });

    setSaving(false);

    if (res.success) {
      setTitle('');
      setTargetMeasure('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to create key result');
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
              Quantitative Milestone
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Add Key Result</h3>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <span className="text-slate-400">Parent Objective: </span>
          <span className="font-semibold text-white">#{objective.sl_no} {objective.title}</span>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">KR #</label>
              <input
                type="text"
                required
                value={krCode}
                onChange={(e) => setKrCode(e.target.value)}
                placeholder="1.1"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs sm:text-sm font-mono text-center"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target / Metric Measure
              </label>
              <input
                type="text"
                value={targetMeasure}
                onChange={(e) => setTargetMeasure(e.target.value)}
                placeholder="e.g. 100% live with SSL"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Result Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch responsive user dashboard"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">KR Owner</label>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              {saving ? 'Creating...' : 'Add Key Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
