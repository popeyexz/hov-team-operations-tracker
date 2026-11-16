'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileCard } from './ProfileCard';
import { EmailPromptModal } from './EmailPromptModal';
import { AddMemberModal } from './AddMemberModal';
import { Profile } from '@/lib/types';
import { Plus, Shield, Layers, Building2, CheckCircle2 } from 'lucide-react';
import { getGatewayData } from '@/app/actions/work-actions';

interface BasicVenture {
  id: string;
  name: string;
  code: string;
  lead_id: string;
}

export function ProfileGrid() {
  const router = useRouter();
  const { profiles, setActiveProfile, refreshProfiles } = useActiveProfile();
  const [ventures, setVentures] = useState<BasicVenture[]>([]);
  const [objectiveCount, setObjectiveCount] = useState<number>(73);
  const [selectedForEmail, setSelectedForEmail] = useState<Profile | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    getGatewayData().then((data) => {
      setVentures(data.ventures as BasicVenture[]);
      setObjectiveCount(data.objectivesCount);
    });
  }, []);

  const handleProfileClick = (profile: Profile) => {
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

  // Group profiles logically: Founder, Leads, Collaborators
  const founder = profiles.find((p) => p.role === 'founder');
  const nonFounders = profiles.filter((p) => p.role !== 'founder');

  // Helper to find ventures assigned to a profile
  const getAssignedVentures = (profileId: string) => {
    return ventures.filter((v) => v.lead_id === profileId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-14">
      {/* Precision Header & Telemetry */}
      <div className="w-full mb-10 pb-8 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Operations Gateway</span>
            <span className="text-zinc-600">/</span>
            <span>HOV OS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-100">
            Select Operator Profile
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl font-normal leading-relaxed">
            Enter your credential to access portfolio venture dashboards, daily OKRs, and two-stage review pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-zinc-500 mr-2">VENTURES</span>
            <span className="font-semibold text-zinc-100">{ventures.length || 13}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-zinc-500 mr-2">OBJECTIVES</span>
            <span className="font-semibold text-zinc-100">{objectiveCount || 73}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LIVE SYNC</span>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
        {/* Founder Hero Card (Top Priority) */}
        {founder && (
          <ProfileCard
            key={founder.id}
            profile={founder}
            assignedVentures={ventures}
            onClick={() => handleProfileClick(founder)}
          />
        )}

        {/* Dynamic Add Member Tile */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40 transition-all duration-150 cursor-pointer text-center focus:outline-none min-h-[160px]"
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-700 transition-all mb-3">
            <Plus className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">
            Provision Operator
          </div>
          <div className="text-xs text-zinc-500 mt-1 font-mono">
            Add team member credential
          </div>
        </button>

        {/* Team Members & Venture Leads */}
        {nonFounders.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            assignedVentures={getAssignedVentures(profile.id)}
            onClick={() => handleProfileClick(profile)}
          />
        ))}
      </div>

      {/* Architecture & Protocol Strip */}
      <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-zinc-500" />
          <span>Frictionless Passwordless Mode Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Deterministic State Sync</span>
          <span className="text-zinc-700">•</span>
          <span>Role-Based Access Control</span>
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
