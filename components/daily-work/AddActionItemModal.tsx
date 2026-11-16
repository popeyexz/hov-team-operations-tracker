'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Plus } from 'lucide-react';
import { Objective, Profile, Venture, KeyResult } from '@/lib/types';
import { createActionItem, createKeyResult } from '@/app/actions/work-actions';
import { DatePickerDDMMYYYY } from './DatePickerDDMMYYYY';

interface AddActionItemModalProps {
  ventures: Venture[];
  profiles: Profile[];
  objectives: Objective[];
  keyResults: KeyResult[];
  preselectedVentureId?: string;
  preselectedObjectiveId?: string;
  preselectedKeyResultId?: string;
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
  preselectedKeyResultId,
  isOpen,
  onClose,
  onSuccess,
}: AddActionItemModalProps) {
  const [ventureId, setVentureId] = useState(preselectedVentureId || ventures[0]?.id || '');
  const [objectiveId, setObjectiveId] = useState(preselectedObjectiveId || '');
  const [keyResultId, setKeyResultId] = useState(preselectedKeyResultId || '');
  const [localKeyResults, setLocalKeyResults] = useState<KeyResult[]>(keyResults);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(profiles[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('not_started');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Add Key Result state
  const [isCreatingKr, setIsCreatingKr] = useState(false);
  const [newKrCode, setNewKrCode] = useState('');
  const [newKrTitle, setNewKrTitle] = useState('');
  const [newKrTarget, setNewKrTarget] = useState('');
  const [krSaving, setKrSaving] = useState(false);
  const [krError, setKrError] = useState<string | null>(null);

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
      if (preselectedKeyResultId !== undefined) {
        setKeyResultId(preselectedKeyResultId || '');
        if (preselectedKeyResultId && !preselectedObjectiveId) {
          const kr = keyResults.find((k) => k.id === preselectedKeyResultId);
          if (kr?.objective_id) {
            setObjectiveId(kr.objective_id);
          }
        }
      } else {
        setKeyResultId('');
      }
      setLocalKeyResults(keyResults);
      setTitle('');
      setComments('');
      setStatus('not_started');
      setDate(new Date().toISOString().split('T')[0]);
      setIsCreatingKr(false);
      setNewKrTitle('');
      setNewKrTarget('');
      setKrError(null);
      setError(null);
    }
  }, [isOpen, preselectedVentureId, preselectedObjectiveId, preselectedKeyResultId, ventures, keyResults]);

  if (!isOpen) return null;

  const currentObjectives = objectives.filter((o) => o.venture_id === ventureId);
  const currentKrs = objectiveId
    ? localKeyResults.filter((k) => k.objective_id === objectiveId)
    : localKeyResults.filter((k) => k.venture_id === ventureId);

  const calculateNextKrCode = (objId: string) => {
    const existingForObj = localKeyResults.filter((k) => k.objective_id === objId);
    const selectedObj = objectives.find((o) => o.id === objId);
    const objSlNo = selectedObj?.sl_no || 1;
    let maxSuffix = 0;
    for (const kr of existingForObj) {
      const parts = kr.kr_code.split('.');
      if (parts.length >= 2) {
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxSuffix) maxSuffix = num;
      }
    }
    const nextNum = maxSuffix > 0 ? maxSuffix + 1 : existingForObj.length + 1;
    return `${objSlNo}.${nextNum}`;
  };

  const handleStartCreateKr = () => {
    if (!objectiveId) return;
    setNewKrCode(calculateNextKrCode(objectiveId));
    setNewKrTitle('');
    setNewKrTarget('');
    setKrError(null);
    setIsCreatingKr(true);
  };

  const handleSaveQuickKr = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newKrTitle.trim()) {
      setKrError('KR Title is required');
      return;
    }
    if (!objectiveId) {
      setKrError('Please select a parent objective first');
      return;
    }

    setKrSaving(true);
    setKrError(null);

    const res = await createKeyResult({
      objectiveId,
      ventureId,
      krCode: newKrCode.trim() || calculateNextKrCode(objectiveId),
      title: newKrTitle.trim(),
      targetMeasure: newKrTarget.trim() || undefined,
      ownerId: assignedTo || null,
    });

    setKrSaving(false);

    if (res.success && res.keyResult) {
      const newKr = res.keyResult as KeyResult;
      setLocalKeyResults((prev) => [...prev, newKr]);
      setKeyResultId(newKr.id);
      setIsCreatingKr(false);
      setNewKrTitle('');
      setNewKrTarget('');
    } else {
      setKrError(res.error || 'Failed to create key result');
    }
  };

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
                  setIsCreatingKr(false);
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
                  const newObjId = e.target.value;
                  setObjectiveId(newObjId);
                  setIsCreatingKr(false);
                  if (keyResultId) {
                    const currentKr = localKeyResults.find((k) => k.id === keyResultId);
                    if (currentKr && currentKr.objective_id !== newObjId) {
                      setKeyResultId('');
                    }
                  }
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Key Result (optional)
                </label>
                {objectiveId && !isCreatingKr && (
                  <button
                    type="button"
                    onClick={handleStartCreateKr}
                    className="text-[10px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add a new Key Result to this objective"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>New KR</span>
                  </button>
                )}
              </div>

              {!isCreatingKr ? (
                <>
                  <select
                    value={keyResultId}
                    onChange={(e) => {
                      const chosenKrId = e.target.value;
                      setKeyResultId(chosenKrId);
                      if (chosenKrId && !objectiveId) {
                        const chosenKr = localKeyResults.find((k) => k.id === chosenKrId);
                        if (chosenKr?.objective_id) {
                          setObjectiveId(chosenKr.objective_id);
                        }
                      }
                    }}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-200"
                  >
                    {currentKrs.length === 0 ? (
                      <option value="">
                        {objectiveId
                          ? 'None (No KRs defined yet for this objective)'
                          : 'None (No KRs in this venture)'}
                      </option>
                    ) : (
                      <>
                        <option value="">None / Standalone Task</option>
                        {currentKrs.map((k) => (
                          <option key={k.id} value={k.id}>
                            KR {k.kr_code}: {k.title.length > 35 ? k.title.substring(0, 35) + '...' : k.title}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {objectiveId && currentKrs.length === 0 && (
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-zinc-400">
                      <span>No KRs yet for #{objectives.find((o) => o.id === objectiveId)?.sl_no || ''}.</span>
                      <button
                        type="button"
                        onClick={handleStartCreateKr}
                        className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        + Create KR now
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-teal-300 font-bold flex items-center gap-1">
                      <Plus className="w-2.5 h-2.5" /> Quick Add Key Result
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingKr(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {krError && (
                    <div className="text-[10px] text-rose-400 font-mono">
                      {krError}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={newKrCode}
                        onChange={(e) => setNewKrCode(e.target.value)}
                        placeholder="1.1"
                        className="w-full glass-input px-2 py-1 text-[11px] font-mono text-center rounded-lg"
                        title="KR Code"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={newKrTitle}
                        onChange={(e) => setNewKrTitle(e.target.value)}
                        placeholder="Key Result title..."
                        className="w-full glass-input px-2.5 py-1 text-[11px] rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={newKrTarget}
                    onChange={(e) => setNewKrTarget(e.target.value)}
                    placeholder="Target / Metric (e.g. 100% complete)"
                    className="w-full glass-input px-2.5 py-1 text-[10px] rounded-lg"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingKr(false)}
                      className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={krSaving}
                      onClick={handleSaveQuickKr}
                      className="px-2.5 py-1 text-[10px] font-mono font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {krSaving ? 'Saving...' : 'Save & Select KR'}
                    </button>
                  </div>
                </div>
              )}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              {saving ? 'Creating...' : 'Create Action Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
