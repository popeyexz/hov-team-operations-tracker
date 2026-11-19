'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { NetflixAvatar } from './NetflixAvatar';

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
}: ProfileCardProps) {
  const isFounder = profile.role === 'founder';
  const initials = profile.full_name.slice(0, 2).toUpperCase();

  const handleCardClick = () => {
    if (isManageMode && onEdit) {
      onEdit(profile);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col items-center text-center w-28 sm:w-36 transition-transform duration-200 hover:-translate-y-1 relative"
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 border-[#FFF7E6]/25 group-hover:border-[#FFF7E6] bg-[#101B3B] flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-all">
        {profile.avatar_url && profile.avatar_url !== '' ? (
          <NetflixAvatar
            name={profile.full_name}
            role={profile.role}
            avatarColor={profile.avatar_color}
            avatarUrl={profile.avatar_url}
            size="lg"
          />
        ) : (
          <span className="font-display text-3xl sm:text-4xl font-bold tracking-wider text-[#FFF7E6] select-none">
            {initials}
          </span>
        )}
        {isFounder && (
          <span className="absolute bottom-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#FFF7E6] text-[#0A122A] font-bold z-10 shadow">
            Founder
          </span>
        )}
        {isManageMode && (
          <div className="absolute inset-0 bg-[#0A122A]/85 flex items-center justify-center text-xs font-mono uppercase tracking-widest text-[#FFF7E6] z-20">
            Edit
          </div>
        )}
      </div>
      <span className="mt-3 font-display text-sm sm:text-base font-bold tracking-wide text-[#FFF7E6]/85 group-hover:text-[#FFF7E6] transition-colors">
        {profile.full_name}
      </span>
    </div>
  );
}
