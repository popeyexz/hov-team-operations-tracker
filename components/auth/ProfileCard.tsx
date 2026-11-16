'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { NetflixAvatar } from './NetflixAvatar';
import { Edit2, Crown } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
  isManageMode?: boolean;
  onEdit?: (profile: Profile) => void;
}

export function ProfileCard({
  profile,
  onClick,
  isManageMode = false,
  onEdit,
}: ProfileCardProps) {
  const isFounder = profile.role === 'founder';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isManageMode && onEdit) {
      onEdit(profile);
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center justify-start text-center focus:outline-none cursor-pointer transition-all duration-200 select-none p-2"
    >
      {/* Square Netflix Avatar with Scale & Crisp White Outline Ring on Hover */}
      <div className="relative rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] group-focus:scale-105 group-hover:ring-4 group-hover:ring-white group-focus:ring-4 group-focus:ring-white">
        <NetflixAvatar
          name={profile.full_name}
          role={profile.role}
          avatarColor={profile.avatar_color}
          size="lg"
        />

        {/* Manage Mode Overlay with Edit Pencil */}
        {isManageMode ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-full border border-white/80 bg-black/40 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
              <Edit2 className="w-5 h-5" />
            </div>
          </div>
        ) : null}

        {/* Subtle Founder Crown Badge */}
        {isFounder && !isManageMode && (
          <div className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-full border border-amber-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
        )}
      </div>

      {/* Operator Name Beneath Avatar */}
      <div className="mt-3 sm:mt-4 flex flex-col items-center max-w-[140px] sm:max-w-[160px]">
        <span className="text-sm sm:text-base text-zinc-400 group-hover:text-white transition-colors duration-200 font-normal truncate w-full text-center">
          {profile.full_name}
        </span>

        {/* Role Tag */}
        <span className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate w-full text-center">
          {isFounder ? 'Founder' : profile.lead_title || 'Collaborator'}
        </span>

        {/* Email indicator in manage mode or if missing */}
        {isManageMode && (
          <span className="text-[10px] text-zinc-400 font-mono truncate w-full text-center mt-1">
            {profile.email || 'Click to set email'}
          </span>
        )}
      </div>
    </button>
  );
}
