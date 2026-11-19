'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { ChangeAvatarModal } from './ChangeAvatarModal';
import { ExcelImportModal } from '../import/ExcelImportModal';
import { Profile } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ProfileGrid() {
  const router = useRouter();
  const { profiles, setActiveProfile, refreshProfiles } = useActiveProfile();
  const { theme, toggleTheme } = useTheme();
  const [selectedForEmail, setSelectedForEmail] = useState<Profile | null>(null);
  const [selectedForAvatar, setSelectedForAvatar] = useState<Profile | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  const handleProfileClick = (profile: Profile) => {
    setActiveProfile(profile);
    router.push('/daily-work');
  };

  const founder = profiles.find((p) => p.role === 'founder');
  const others = profiles.filter((p) => p.role !== 'founder');
  const sortedProfiles = founder ? [founder, ...others] : profiles;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between px-6 sm:px-12 py-8 bg-[#0A122A] text-[#FFF7E6] select-none">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFF7E6] text-[#0A122A] flex items-center justify-center font-display font-black text-sm tracking-widest">
            HOV
          </div>
          <span className="font-display text-sm sm:text-base font-bold tracking-widest uppercase">
            Personal Tracker
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#FFF7E6] text-[#0A122A] font-display text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
          >
            Import Excel
          </button>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg border border-[#FFF7E6]/30 text-[#FFF7E6] font-display text-xs font-bold uppercase tracking-widest hover:border-[#FFF7E6] transition-all cursor-pointer"
          >
            {theme === 'dark' ? 'LIGHT VANILLA' : 'DARK BLUE'}
          </button>
        </div>
      </div>

      {/* Center Minimalist Profile Selector */}
      <div className="my-auto py-12 text-center max-w-4xl mx-auto w-full">
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider uppercase mb-12 text-[#FFF7E6]">
          {isManageMode ? 'Manage Profiles' : "Who's Working?"}
        </h1>

        <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
          {sortedProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => handleProfileClick(profile)}
              isManageMode={isManageMode}
              onEdit={(p) => {
                setSelectedForAvatar(p);
                setIsAvatarModalOpen(true);
              }}
            />
          ))}

          {/* Add Profile Tile */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="group cursor-pointer flex flex-col items-center text-center w-28 sm:w-36 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-[#FFF7E6]/30 group-hover:border-[#FFF7E6] flex items-center justify-center transition-all">
              <Plus className="w-10 h-10 text-[#FFF7E6]/70 group-hover:text-[#FFF7E6]" />
            </div>
            <span className="mt-3 font-display text-sm sm:text-base font-bold tracking-wide text-[#FFF7E6]/70 group-hover:text-[#FFF7E6] uppercase">
              Add Profile
            </span>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-center">
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className="px-7 py-2.5 rounded border border-[#FFF7E6]/35 hover:border-[#FFF7E6] font-display text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer"
          >
            {isManageMode ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] font-mono text-[#FFF7E6]/50">
        Select your profile to begin
      </div>

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refreshProfiles()}
      />

      <ChangeAvatarModal
        profile={selectedForAvatar}
        isOpen={isAvatarModalOpen}
        onClose={() => {
          setIsAvatarModalOpen(false);
          setSelectedForAvatar(null);
        }}
        onSuccess={() => refreshProfiles()}
      />

      <EmailPromptModal
        profile={selectedForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedForEmail(null);
        }}
        onSuccess={() => refreshProfiles()}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newProfile) => {
          refreshProfiles();
          setActiveProfile(newProfile);
          router.push('/daily-work');
        }}
      />
    </div>
  );
}
