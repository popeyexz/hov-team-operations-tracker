'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { Shield, Mail, Crown, Compass, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const isFounder = profile.role === 'founder';
  const isVentureLead = profile.lead_title?.includes('Lead') || profile.lead_title?.includes('Venture');

  // Gradient themes based on role and custom avatar color
  const getAvatarGradient = () => {
    if (isFounder) return 'from-amber-400 via-rose-500 to-indigo-600';
    if (isVentureLead) return 'from-blue-500 via-indigo-600 to-violet-700';
    return 'from-emerald-400 via-teal-500 to-sky-600';
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-between p-7 rounded-3xl glass-panel glass-panel-hover text-center transition-all duration-300 w-full focus:outline-none cursor-pointer overflow-hidden border border-white/[0.08] hover:border-white/20"
    >
      {/* Ambient background glow on hover */}
      <div
        className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${profile.avatar_color || '#6366f1'}35 0%, transparent 70%)`,
        }}
      />

      {/* Top micro-badge */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse led-emerald" />
          ACTIVE
        </span>

        {isFounder ? (
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 text-[10px] font-bold tracking-wide border border-amber-500/30 flex items-center gap-1 shadow-sm">
            <Crown className="w-3 h-3 text-amber-400" />
            Founder
          </span>
        ) : isVentureLead ? (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-300 text-[10px] font-semibold border border-blue-500/20 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            Lead
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-medium border border-white/10">
            Team
          </span>
        )}
      </div>

      {/* Avatar with Halo Ring */}
      <div className="relative my-2">
        <div className="relative">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${getAvatarGradient()} flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-2xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40 shadow-indigo-500/20`}
          >
            {profile.full_name.charAt(0)}
          </div>
          {isFounder && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg border border-white/40">
              <Crown className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Name & Title */}
      <div className="mt-3 w-full">
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-sky-200 group-hover:to-indigo-300 transition-all">
          {profile.full_name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium truncate max-w-full">
          {profile.lead_title || (isFounder ? 'Founder' : 'Team Member')}
        </p>
      </div>

      {/* Alert Email Status Footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex items-center justify-center gap-1.5 text-[11px]">
        <Mail className="w-3 h-3 text-slate-500" />
        {profile.email ? (
          <span className="truncate max-w-[150px] text-slate-400 font-mono">{profile.email}</span>
        ) : (
          <span className="text-amber-400/90 font-medium">Add alert email →</span>
        )}
      </div>
    </button>
  );
}
