'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { Profile } from '@/lib/types';
import { Plus } from 'lucide-react';

export function ProfileGrid() {
  const router = useRouter();
  const { profiles, setActiveProfile, refreshProfiles } = useActiveProfile();
  const [selectedForEmail, setSelectedForEmail] = useState<Profile | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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
    setSelectedForEmail(profile);
    setIsEmailModalOpen(true);
  };

  const handleEmailSuccess = (updatedProfile: Profile) => {
    setActiveProfile(updatedProfile);
    refreshProfiles();
    if (!isManageMode) {
      router.push('/daily-work');
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 bg-[#141414] text-white select-none animate-in fade-in duration-300">
      {/* Netflix Headline */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-2">
          {isManageMode ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wider">
          HOUSE OF VENTURES • OPERATIONS OS
        </p>
      </div>

      {/* Netflix Profile Avatar Row */}
      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-7 lg:gap-8 max-w-5xl mx-auto">
        {sortedProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile)}
            isManageMode={isManageMode}
            onEdit={handleEditProfile}
          />
        ))}

        {/* Netflix-Style "Add Profile" Tile */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex flex-col items-center justify-start text-center focus:outline-none cursor-pointer p-2"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-md sm:rounded-lg border-2 border-zinc-700/60 group-hover:border-white group-hover:bg-zinc-800/40 flex items-center justify-center transition-all duration-200 transform group-hover:scale-105 group-focus:scale-105">
            <Plus className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-3 sm:mt-4 flex flex-col items-center max-w-[140px] sm:max-w-[160px]">
            <span className="text-sm sm:text-base text-zinc-400 group-hover:text-white transition-colors duration-200 font-normal">
              Add Profile
            </span>
            <span className="text-[11px] text-zinc-600 font-mono mt-0.5">
              New Operator
            </span>
          </div>
        </button>
      </div>

      {/* Netflix "Manage Profiles" or "Done" Button */}
      <div className="mt-12 sm:mt-16 text-center">
        <button
          onClick={() => setIsManageMode(!isManageMode)}
          className={`px-8 py-2.5 text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer ${
            isManageMode
              ? 'bg-white text-black hover:bg-zinc-200 shadow-lg'
              : 'border border-zinc-600 hover:border-zinc-300 text-zinc-400 hover:text-white bg-transparent'
          }`}
        >
          {isManageMode ? 'Done' : 'Manage Profiles'}
        </button>
      </div>

      {/* Modals */}
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
