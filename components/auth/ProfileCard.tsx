'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { NetflixAvatar } from './NetflixAvatar';
import { Edit2, Camera } from 'lucide-react';

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isManageMode && onEdit) {
      onEdit(profile);
    } else {
      onClick();
    }
  };

  const handleAvatarButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChangeAvatar) {
      onChangeAvatar(profile);
    } else if (onEdit) {
      onEdit(profile);
    }
  };

  return (
    <div className="group flex flex-col items-center justify-start text-center select-none p-2 relative">
      {/* Avatar Container with Hover Scale & Glow */}
      <div className="relative">
        <button
          onClick={handleClick}
          className="relative rounded-lg overflow-hidden transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgba(244,174,190,0.3)] group-focus:scale-105 group-hover:ring-4 group-hover:ring-[#F4AEBE] group-focus:ring-4 group-focus:ring-[#F4AEBE] cursor-pointer focus:outline-none"
        >
          <NetflixAvatar
            name={profile.full_name}
            role={profile.role}
            avatarColor={profile.avatar_color}
            avatarUrl={profile.avatar_url}
            size="lg"
          />

          {/* Manage Mode Overlay with Edit Pencil */}
          {isManageMode ? (
            <div className="absolute inset-0 bg-[#03153D]/80 flex flex-col items-center justify-center transition-all animate-in fade-in duration-150 gap-1.5 p-2">
              <div className="w-9 h-9 rounded-full border border-[#F4AEBE] bg-[#020B20] flex items-center justify-center text-[#F4AEBE] group-hover:bg-[#F4AEBE] group-hover:text-[#03153D] transition-colors shadow-lg">
                <Edit2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#F4AEBE] font-bold font-mono tracking-tight uppercase">
                Edit Info
              </span>
            </div>
          ) : null}
        </button>

        {/* Change Picture Quick Trigger Button */}
        <button
          onClick={handleAvatarButtonClick}
          className="absolute -bottom-1 -right-1 z-20 p-1.5 rounded-full bg-[#03153D] border border-[#F4AEBE] text-[#F4AEBE] hover:bg-[#F4AEBE] hover:text-[#03153D] shadow-lg transition-all transform hover:scale-110 cursor-pointer opacity-90 group-hover:opacity-100"
          title="Change Profile Picture"
          aria-label="Change Profile Picture"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Operator Name Beneath Avatar */}
      <button
        onClick={handleClick}
        className="mt-3.5 sm:mt-4 flex flex-col items-center max-w-[140px] sm:max-w-[160px] cursor-pointer focus:outline-none"
      >
        <span className="text-base sm:text-lg text-zinc-300 group-hover:text-[#F4AEBE] transition-colors duration-200 font-display font-medium tracking-wide truncate w-full text-center">
          {profile.full_name}
        </span>

        {/* Role Tag (Zero Crown) */}
        <span className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate w-full text-center">
          {isFounder ? 'Founder' : profile.lead_title || 'Collaborator'}
        </span>

        {/* Action prompt */}
        {isManageMode ? (
          <span className="text-[10px] text-[#F4AEBE] font-mono truncate w-full text-center mt-1 font-semibold">
            Click to edit photo/info
          </span>
        ) : (
          <span
            onClick={handleAvatarButtonClick}
            className="text-[10px] text-zinc-500 hover:text-[#F4AEBE] font-mono mt-1 transition-colors cursor-pointer"
          >
            Change photo
          </span>
        )}
      </button>
    </div>
  );
}
