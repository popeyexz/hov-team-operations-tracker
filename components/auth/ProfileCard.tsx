'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { Shield, Sparkles, Mail } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const isFounder = profile.role === 'founder';

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-6 rounded-3xl glass-panel glass-panel-hover text-center transition-all duration-300 w-full focus:outline-none"
    >
      {/* Liquid glow background on hover */}
      <div
        className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{
          background: `radial-gradient(circle, ${profile.avatar_color || '#3b82f6'}40 0%, transparent 70%)`,
        }}
      />

      {/* Avatar */}
      <div className="relative mb-4">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-xl transform group-hover:scale-105 transition-transform duration-300 ring-2 ring-white/20 group-hover:ring-white/40"
          style={{ backgroundColor: profile.avatar_color || '#3b82f6' }}
        >
          {profile.full_name.charAt(0)}
        </div>

        {isFounder && (
          <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold tracking-wide shadow-md flex items-center gap-1 border border-rose-300/30">
            <Shield className="w-2.5 h-2.5" />
            Founder
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
        {profile.full_name}
      </h3>

      {/* Title */}
      <p className="text-xs text-slate-400 mt-1 font-medium">
        {profile.lead_title || (isFounder ? 'Founder' : 'Team Member')}
      </p>

      {/* Email Indicator */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Mail className="w-3 h-3" />
        {profile.email ? (
          <span className="truncate max-w-[140px] text-slate-400">{profile.email}</span>
        ) : (
          <span className="text-amber-400/80">Set alert email</span>
        )}
      </div>
    </button>
  );
}
