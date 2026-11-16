'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { ChangeAvatarModal } from './ChangeAvatarModal';
import { Profile } from '@/lib/types';
import { Plus, Camera, Sparkles } from 'lucide-react';

export function ProfileGrid() {
  const router = useRouter();
  const { profiles, setActiveProfile, refreshProfiles } = useActiveProfile();
  const [selectedForEmail, setSelectedForEmail] = useState<Profile | null>(null);
  const [selectedForAvatar, setSelectedForAvatar] = useState<Profile | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  const handleProfileClick = (profile: Profile) => {
    if (!profile.email) {
      setSelectedForEmail(profile);
      setIsEmailModalOpen(true);
    } else {
      setActiveProfile(profile);
      router.push('/daily-work');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    // In manage mode, open change avatar modal directly
    setSelectedForAvatar(profile);
    setIsAvatarModalOpen(true);
  };

  const handleChangeAvatar = (profile: Profile) => {
    setSelectedForAvatar(profile);
    setIsAvatarModalOpen(true);
  };

  const handleEmailSuccess = (updatedProfile: Profile) => {
    setActiveProfile(updatedProfile);
    refreshProfiles();
    if (!isManageMode) {
      router.push('/daily-work');
    }
  };

  const handleAvatarSuccess = (updatedProfile: Profile) => {
    refreshProfiles();
    if (updatedProfile) {
      setActiveProfile(updatedProfile);
    }
  };

  const handleMemberAdded = (newProfile: Profile) => {
    refreshProfiles();
    setActiveProfile(newProfile);
    router.push('/daily-work');
  };

  // Order profiles: Founder first, then team members
  const founder = profiles.find((p) => p.role === 'founder');
  const others = profiles.filter((p) => p.role !== 'founder');
  const sortedProfiles = founder ? [founder, ...others] : profiles;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#020B20] via-[#03153D] to-[#01091A] text-white select-none animate-in fade-in duration-300 relative overflow-hidden">
      {/* Ambient Rose Silk & Blue Velvet Mesh Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F4AEBE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#03153D]/80 rounded-full blur-3xl pointer-events-none" />

      {/* Luxury Editorial Headline */}
      <div className="text-center mb-8 sm:mb-12 relative z-10">
        <span className="text-[11px] sm:text-xs font-mono tracking-widest text-[#F4AEBE] uppercase font-bold block mb-2">
          HOUSE OF VENTURES • OPERATIONS OS
        </span>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2 font-display uppercase">
          {isManageMode ? 'Manage Profiles' : "Who's Watching?"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 font-mono tracking-wider max-w-md mx-auto">
          {isManageMode
            ? 'Click any avatar to change profile photo or styling'
            : 'Select operator profile to enter command center'}
        </p>
      </div>

      {/* Netflix Profile Avatar Row */}
      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-7 lg:gap-8 max-w-5xl mx-auto relative z-10">
        {sortedProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile)}
            isManageMode={isManageMode}
            onEdit={handleEditProfile}
            onChangeAvatar={handleChangeAvatar}
          />
        ))}

        {/* Netflix-Style "Add Profile" Tile */}
        <div className="group flex flex-col items-center justify-start text-center p-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-lg border-2 border-dashed border-[#F4AEBE]/40 hover:border-[#F4AEBE] hover:bg-[#F4AEBE]/10 flex items-center justify-center transition-all duration-200 transform group-hover:scale-105 group-focus:scale-105 cursor-pointer shadow-lg"
          >
            <Plus className="w-10 h-10 sm:w-14 sm:h-14 text-[#F4AEBE] group-hover:text-white transition-colors" />
          </button>
          <div className="mt-3 sm:mt-4 flex flex-col items-center max-w-[140px] sm:max-w-[160px]">
            <span className="text-sm sm:text-base text-zinc-300 group-hover:text-[#F4AEBE] transition-colors duration-200 font-display font-semibold">
              Add Profile
            </span>
            <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
              New Operator
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Strip */}
      <div className="mt-12 sm:mt-16 text-center flex flex-wrap items-center justify-center gap-4 relative z-10">
        <button
          onClick={() => setIsManageMode(!isManageMode)}
          className={`px-8 py-2.5 text-xs sm:text-sm uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer rounded-xl font-display ${
            isManageMode
              ? 'bg-[#F4AEBE] text-[#03153D] hover:bg-[#f7bac8] shadow-[0_0_25px_rgba(244,174,190,0.5)]'
              : 'border-2 border-[#F4AEBE]/40 hover:border-[#F4AEBE] text-[#F4AEBE] hover:text-white bg-[#03153D]/50 hover:bg-[#03153D]'
          }`}
        >
          {isManageMode ? 'Done' : 'Manage Profiles'}
        </button>
      </div>

      {/* Modals */}
      <ChangeAvatarModal
        profile={selectedForAvatar}
        isOpen={isAvatarModalOpen}
        onClose={() => {
          setIsAvatarModalOpen(false);
          setSelectedForAvatar(null);
        }}
        onSuccess={handleAvatarSuccess}
      />

      <EmailPromptModal
        profile={selectedForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedForEmail(null);
        }}
        onSuccess={handleEmailSuccess}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMemberAdded}
      />
    </div>
  );
}
