'use client';

import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { updateProfileEmail } from '@/app/actions/profile-actions';
import { Profile } from '@/lib/types';

interface EmailPromptModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: Profile) => void;
}

export function EmailPromptModal({ profile, isOpen, onClose, onSuccess }: EmailPromptModalProps) {
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile && isOpen) {
      setEmail(profile.email || '');
      setError(null);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSkip = () => {
    onSuccess(profile);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await updateProfileEmail(profile.id, email.trim());
    setSaving(false);

    if (res.success) {
      onSuccess({ ...profile, email: email.trim().toLowerCase() });
      onClose();
    } else {
      setError(res.error || 'Failed to save email');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-zinc-800 border border-zinc-700 text-zinc-200">
            {profile.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Setup Notification Email</h3>
            <p className="text-xs text-zinc-500 font-mono">Operator: {profile.full_name}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Configure an alert email to receive real-time review updates, founder feedback, and task verification notices.
        </p>

        {error && (
          <div className="p-2.5 mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@houseofventures.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-zinc-100 pl-9 pr-3 py-2 rounded-lg text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
