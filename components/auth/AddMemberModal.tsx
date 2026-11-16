'use client';

import React, { useState } from 'react';
import { UserPlus, X, Shield, Sparkles } from 'lucide-react';
import { addMember } from '@/app/actions/profile-actions';
import { Profile } from '@/lib/types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: (newProfile: Profile) => void;
  onSuccess?: (newProfile: Profile) => void;
}

const COLOR_OPTIONS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export function AddMemberModal({ isOpen, onClose, onMemberAdded, onSuccess }: AddMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'founder' | 'member'>('member');
  const [leadTitle, setLeadTitle] = useState('Team Member');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[1]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await addMember({
      fullName: fullName.trim(),
      role,
      leadTitle: leadTitle.trim() || 'Team Member',
      email: email.trim(),
      avatarColor: selectedColor,
    });

    setSaving(false);

    if (res.success && res.profile) {
      if (onMemberAdded) onMemberAdded(res.profile);
      if (onSuccess) onSuccess(res.profile);
      setFullName('');
      setEmail('');
      onClose();
    } else {
      setError(res.error || 'Failed to add member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add New Team Member</h3>
            <p className="text-xs text-slate-400">Expand the HOV team & venture collaboration</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'founder' | 'member')}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900 text-slate-200"
              >
                <option value="member">Team Member</option>
                <option value="founder">Founder / Co-Founder</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operational Title</label>
              <input
                type="text"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
                placeholder="e.g. Venture Lead, Design Lead"
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email (for review alerts)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@houseofventures.com"
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar Color</label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
