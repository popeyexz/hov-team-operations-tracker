'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { Profile } from '@/lib/types';
import { Plus, Sparkles, Building2, Layers } from 'lucide-react';

export function ProfileGrid() {
  const router = useRouter();
  const { profiles, setActiveProfile, refreshProfiles } = useActiveProfile();
  const [selectedForEmail, setSelectedForEmail] = useState<Profile | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleProfileClick = (profile: Profile) => {
    // If profile has no email, prompt for email first
    if (!profile.email) {
      setSelectedForEmail(profile);
      setIsEmailModalOpen(true);
    } else {
      setActiveProfile(profile);
      router.push('/daily-work');
    }
  };

  const handleEmailSuccess = (updatedProfile: Profile) => {
    setActiveProfile(updatedProfile);
    refreshProfiles();
    router.push('/daily-work');
  };

  const handleMemberAdded = (newProfile: Profile) => {
    refreshProfiles();
    setActiveProfile(newProfile);
    router.push('/daily-work');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center">
      {/* Brand Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-sky-400 mb-4 border border-sky-400/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>House of Ventures Operating System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Who is working today?
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-lg mx-auto">
          Select your profile to enter your personalized dashboard, manage OKRs, and collaborate across 13 ventures.
        </p>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 w-full">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile)}
          />
        ))}

        {/* Add Member Card */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex flex-col items-center justify-center p-6 rounded-3xl glass-card border border-dashed border-white/20 hover:border-sky-400/50 hover:bg-sky-500/5 transition-all duration-300 w-full focus:outline-none"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 group-hover:text-white group-hover:scale-105 transition-all duration-300 mb-4 group-hover:border-sky-400/40">
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-300 group-hover:text-white">
            Add Member
          </h3>
          <p className="text-xs text-slate-500 mt-1">Create new profile</p>
        </button>
      </div>

      {/* Venture summary pill at bottom */}
      <div className="mt-14 inline-flex items-center gap-6 px-6 py-3 rounded-2xl glass-panel text-xs text-slate-400 border border-white/10">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>13 Active Ventures</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-600" />
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>73 Seeded OKRs</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-600" />
        <span className="text-slate-500">Zero PINs / Passwords</span>
      </div>

      {/* Modals */}
      <EmailPromptModal
        profile={selectedForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          // If skipped, still activate profile and go to daily-work
          if (selectedForEmail) {
            setActiveProfile(selectedForEmail);
            router.push('/daily-work');
          }
        }}
        onSuccess={handleEmailSuccess}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
