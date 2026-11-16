'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { Profile } from '@/lib/types';
import { Plus, Sparkles, Building2, Layers, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center relative">
      {/* Brand & Hero Header */}
      <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-sky-300 mb-5 border border-sky-400/20 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>House of Ventures · Operating System</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none text-gradient-silver">
          Who is working today?
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed font-normal">
          Select your profile to enter your personal command center, manage live OKRs, and drive execution across 13 portfolio ventures.
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
          className="group flex flex-col items-center justify-center p-7 rounded-3xl glass-card border border-dashed border-white/20 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all duration-300 w-full focus:outline-none cursor-pointer"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-400 group-hover:text-white group-hover:scale-105 group-hover:border-indigo-400/40 transition-all duration-300 mb-4 shadow-lg">
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300 text-indigo-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-white">
            Add Member
          </h3>
          <p className="text-xs text-slate-500 mt-1">Create new profile</p>
        </button>
      </div>

      {/* Trust & Live Architecture Stats Bar */}
      <div className="mt-16 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-7 py-3.5 rounded-2xl glass-panel text-xs text-slate-400 border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">13 Active Ventures</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">73 Seeded Objectives</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Frictionless Passwordless Mode</span>
        </div>
      </div>

      {/* Modals */}
      <EmailPromptModal
        profile={selectedForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
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
