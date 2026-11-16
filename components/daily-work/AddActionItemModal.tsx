'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Plus, Zap, AlertCircle } from 'lucide-react';
import { Objective, Profile, Venture, KeyResult } from '@/lib/types';
import { createActionItem, createKeyResult } from '@/app/actions/work-actions';
import { useActiveProfile } from '@/context/ActiveProfileContext';
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
  const { activeProfile, effectiveProfile } = useActiveProfile();
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

  const selectedVenture = ventures.find((v) => v.id === ventureId);
  const selectedAssignee = profiles.find((p) => p.id === assignedTo);
  const ventureLead = selectedVenture?.lead || profiles.find((p) => p.id === selectedVenture?.lead_id);
  const isCrossVentureAssignment =
    selectedVenture &&
    selectedAssignee &&
    selectedVenture.lead_id &&
    selectedAssignee.id !== selectedVenture.lead_id;

  const calculateNextKrCode = (objId: string) => {
    const existingForObj = localKeyResults.filter((k) => k.objective_id === objId);
    const selectedObj = objectives.find((o) => o.id === objId);
    const objSlNo = selectedObj?.sl_no || 1;
    let maxSuffix = 0;
    for (const kr of existingForObj) {
      const match = kr.kr_code.match(/(\d+)\.(\d+)/);
      if (match) {
        const s = parseInt(match[2], 10);
        if (s > maxSuffix) maxSuffix = s;
      }
    }
    return `${objSlNo}.${maxSuffix + 1}`;
  };

  const handleStartCreateKr = () => {
    if (!objectiveId) return;
    const nextCode = calculateNextKrCode(objectiveId);
    setNewKrCode(nextCode);
    setNewKrTitle('');
    setNewKrTarget('');
    setKrError(null);
    setIsCreatingKr(true);
  };

  const handleSaveQuickKr = async () => {
    if (!objectiveId || !newKrTitle.trim()) {
      setKrError('Key Result title is required');
      return;
    }
    setKrSaving(true);
    setKrError(null);
    const res = await createKeyResult({
      objectiveId,
      ventureId,
      krCode: newKrCode || calculateNextKrCode(objectiveId),
      title: newKrTitle.trim(),
      targetMeasure: newKrTarget.trim() || undefined,
      ownerId: assignedTo || null,
    });
    setKrSaving(false);

    if (res.success && res.keyResult) {
      const createdKr = res.keyResult as KeyResult;
      setLocalKeyResults((prev) => [...prev, createdKr]);
      setKeyResultId(createdKr.id);
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
      assignedBy: effectiveProfile?.id || activeProfile?.id || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#03153D]/95 border border-[#F4AEBE]/30 p-5 sm:p-7 shadow-[0_20px_70px_rgba(2,11,32,0.95)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-[#F4AEBE]/20 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F4AEBE]/15 border border-[#F4AEBE]/35 flex items-center justify-center text-[#F4AEBE] shadow-[0_0_15px_rgba(244,174,190,0.3)]">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4AEBE] font-mono">
              OPERATIONAL TASK // ALLOCATION
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">Create Action Item</h3>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete responsive UI testing and connect Supabase auth"
              className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                Venture <span className="text-rose-400">*</span>
              </label>
              <select
                value={ventureId}
                onChange={(e) => {
                  setVentureId(e.target.value);
                  setObjectiveId('');
                  setKeyResultId('');
                  setIsCreatingKr(false);
                }}
                className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
              >
                {ventures.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} - {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
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

          {/* Cross-Venture Assignment Helper Pill */}
          {isCrossVentureAssignment && (
            <div className="p-3 rounded-xl bg-[#020B20] border border-[#F4AEBE]/35 text-xs font-mono text-[#F4AEBE] flex items-start gap-2.5 shadow-sm">
              <Zap className="w-4 h-4 text-[#F4AEBE] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-sans">⚡ Cross-Venture Assignment Detected</strong>
                <span>
                  This task belongs to <strong className="text-white">{selectedVenture?.name}</strong> (Lead:{' '}
                  <strong className="text-white">{ventureLead?.full_name || 'Unassigned'}</strong>). It will automatically
                  be routed to <strong className="text-white">{selectedAssignee?.full_name}</strong>'s task cockpit under
                  Cross-Venture Assignments.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
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
                className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
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
                <label className="text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold">
                  Key Result (optional)
                </label>
                {objectiveId && !isCreatingKr && (
                  <button
                    type="button"
                    onClick={handleStartCreateKr}
                    className="text-[10px] font-mono text-[#F4AEBE] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add a new Key Result to this objective"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>New KR</span>
                  </button>
                )}
              </div>

              {!isCreatingKr ? (
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
                  className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
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
              ) : (
                <div className="p-3 rounded-xl bg-[#020B20] border border-[#F4AEBE]/30 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#F4AEBE] uppercase font-bold">
                      Quick Add Key Result
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingKr(false)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                  {krError && <div className="text-[10px] text-rose-400 font-mono">{krError}</div>}
                  <input
                    type="text"
                    value={newKrTitle}
                    onChange={(e) => setNewKrTitle(e.target.value)}
                    placeholder="KR Title"
                    className="w-full bg-[#03153D] border border-[#F4AEBE]/25 px-2.5 py-1.5 rounded-lg text-xs text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={krSaving}
                      onClick={handleSaveQuickKr}
                      className="px-3 py-1 text-[11px] font-mono font-bold bg-[#F4AEBE] text-[#03153D] rounded-lg cursor-pointer"
                    >
                      {krSaving ? 'Saving...' : 'Save KR'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePickerDDMMYYYY
              label="Action Date (DD-MM-YYYY)"
              value={date}
              onChange={setDate}
            />

            <div>
              <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
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
            <label className="block text-xs font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">Comments / Notes</label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Additional instructions or notes"
              className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] px-3 py-2 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4AEBE]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] font-bold text-xs shadow-lg shadow-[#F4AEBE]/25 flex items-center gap-2 cursor-pointer font-display uppercase tracking-wider"
            >
              {saving ? 'Creating...' : 'Create Action Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
