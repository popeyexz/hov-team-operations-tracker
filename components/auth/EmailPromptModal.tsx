'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: profile.avatar_color || '#3b82f6' }}
          >
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Setup Alerts Email</h3>
            <p className="text-xs text-slate-400">Welcome, {profile.full_name}!</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          Enter your email to receive real-time review alerts, Founder feedback, and task updates.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Notification Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@houseofventures.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
