'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { NetflixAvatar } from './NetflixAvatar';
import { Camera, Edit2 } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
  isManageMode?: boolean;
  onEdit?: (profile: Profile) => void;
  onChangeAvatar?: (profile: Profile) => void;
}

export function ProfileCard({
  profile,
  onClick,
  isManageMode = false,
  onEdit,
  onChangeAvatar,
}: ProfileCardProps) {
  const isFounder = profile.role === 'founder';

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isManageMode && onEdit) {
      onEdit(profile);
    } else {
      onClick();
    }
  };

  const handleAvatarTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChangeAvatar) {
      onChangeAvatar(profile);
    } else if (onEdit) {
      onEdit(profile);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col items-center text-center w-28 sm:w-36 transition-transform duration-200 hover:-translate-y-1 relative"
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 border-[#FFF7E6]/25 group-hover:border-[#FFF7E6] bg-[#101B3B] flex items-center justify-center overflow-hidden shadow-xl transition-all">
        <NetflixAvatar
          name={profile.full_name}
          role={profile.role}
          avatarColor={profile.avatar_color}
          avatarUrl={profile.avatar_url}
          size="lg"
        />

        {isFounder && (
          <span className="absolute bottom-1.5 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#FFF7E6] text-[#0A122A] font-bold z-10 shadow">
            Founder
          </span>
        )}

        {isManageMode && (
          <div className="absolute inset-0 bg-[#0A122A]/85 z-20 flex flex-col items-center justify-center gap-1 text-[#FFF7E6]">
            <Edit2 className="w-5 h-5 text-[#F4AEBE]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              Edit
            </span>
          </div>
        )}
      </div>

      {/* Quick Camera Trigger */}
      <button
        onClick={handleAvatarTrigger}
        type="button"
        title="Change Avatar"
        aria-label="Change Avatar"
        className="absolute top-0 right-1 sm:right-3 p-1 rounded-full bg-[#0A122A] border border-[#FFF7E6]/40 text-[#FFF7E6] opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:scale-110 cursor-pointer shadow-md"
      >
        <Camera className="w-3 h-3" />
      </button>

      <span className="mt-3 font-display text-sm sm:text-base font-bold tracking-wide text-[#FFF7E6]/85 group-hover:text-[#FFF7E6] transition-colors">
        {profile.full_name}
      </span>
      <span className="text-[11px] font-mono text-[#FFF7E6]/50 uppercase tracking-wider">
        {isFounder ? 'Founder' : profile.lead_title || 'Collaborator'}
      </span>
    </div>
  );
}
