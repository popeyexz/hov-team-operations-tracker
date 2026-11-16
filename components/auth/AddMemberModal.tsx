'use client';

import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { addMember } from '@/app/actions/profile-actions';
import { Profile } from '@/lib/types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: (newProfile: Profile) => void;
  onSuccess?: (newProfile: Profile) => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // Cobalt Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
];

export function AddMemberModal({ isOpen, onClose, onMemberAdded, onSuccess }: AddMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'founder' | 'member'>('member');
  const [leadTitle, setLeadTitle] = useState('Venture Lead');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Provision Operator Credential</h3>
            <p className="text-xs text-zinc-500 font-mono">Create new profile in House of Ventures OS</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
              OPERATOR NAME <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">ROLE TYPE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'founder' | 'member')}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
              >
                <option value="member">Team Member / Lead</option>
                <option value="founder">Founder / Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">OPERATIONAL TITLE</label>
              <input
                type="text"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
                placeholder="e.g. Venture Lead"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
              NOTIFICATION EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@houseofventures.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 px-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 font-mono">COLOR ACCENT</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
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
              {saving ? 'Provisioning...' : 'Provision Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
