'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { Mail, Crown, ArrowRight, Layers } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
  assignedVentures?: { id: string; name: string; code: string }[];
}

export function ProfileCard({ profile, onClick, assignedVentures = [] }: ProfileCardProps) {
  const isFounder = profile.role === 'founder';
  const isVentureLead = assignedVentures.length > 0 || (profile.lead_title?.toLowerCase().includes('lead') ?? false);

  // Derive initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-xl text-left transition-all duration-150 cursor-pointer overflow-hidden border focus:outline-none ${
        isFounder
          ? 'bg-zinc-900/80 hover:bg-zinc-900 border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-950/20 md:col-span-2'
          : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/90 hover:border-zinc-700 shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            {/* Monogram Badge */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs tracking-wider border ${
                isFounder
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700/60'
              }`}
            >
              {getInitials(profile.full_name)}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {profile.full_name}
                </span>
                {isFounder && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {profile.lead_title || (isFounder ? 'Founder' : 'Member')}
              </div>
            </div>
          </div>

          {/* Role Status Tag */}
          <div>
            {isFounder ? (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 font-medium">
                FOUNDER
              </span>
            ) : isVentureLead ? (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-sky-300 font-medium">
                LEAD ({assignedVentures.length})
              </span>
            ) : (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-zinc-700/60 bg-zinc-800/60 text-zinc-400 font-medium">
                MEMBER
              </span>
            )}
          </div>
        </div>

        {/* Real Assigned Ventures (No Mock/Fabricated Tags) */}
        {assignedVentures.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-zinc-500" />
              <span>{isFounder ? 'Portfolio Ventures' : 'Assigned Ventures'} ({assignedVentures.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assignedVentures.map((v) => (
                <span
                  key={v.id}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 group-hover:border-zinc-600 transition-colors"
                >
                  {v.name.replace('PS.HOV - ', '').replace('House_of_', '')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Status & Action */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs w-full">
        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] truncate max-w-[200px]">
          <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
          {profile.email ? (
            <span className="truncate text-zinc-400">{profile.email}</span>
          ) : (
            <span className="text-amber-400/90 font-sans">Set alert email →</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors font-mono">
          <span>{isFounder ? 'ENTER COCKPIT' : 'ENTER'}</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
