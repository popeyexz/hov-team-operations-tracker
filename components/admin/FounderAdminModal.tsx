'use client';

import React, { useState } from 'react';
import { Profile, Venture } from '@/lib/types';
import { updateProfileAdmin } from '@/app/actions/profile-actions';
import { updateVentureAdmin, getVenturesForGateway } from '@/app/actions/work-actions';
import { NetflixAvatar } from '../auth/NetflixAvatar';
import {
  X,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
  Mail,
  Palette,
  Sliders,
} from 'lucide-react';

interface FounderAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  ventures?: Venture[];
  onRefresh: () => void;
  defaultTab?: 'profiles' | 'ventures';
  preselectedVentureId?: string;
}

export function FounderAdminModal({
  isOpen,
  onClose,
  profiles,
  ventures = [],
  onRefresh,
  defaultTab = 'profiles',
  preselectedVentureId,
}: FounderAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'profiles' | 'ventures'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVentures, setCurrentVentures] = useState<Venture[]>(ventures);

  React.useEffect(() => {
    if (ventures && ventures.length > 0) {
      setCurrentVentures(ventures);
    } else if (isOpen) {
      getVenturesForGateway().then((list) => {
        if (list) setCurrentVentures(list as Venture[]);
      });
    }
  }, [isOpen, ventures]);

  // Per-member form states
  const [editingProfiles, setEditingProfiles] = useState<Record<string, {
    fullName: string;
    leadTitle: string;
    email: string;
    role: 'founder' | 'member';
    avatarColor: string;
  }>>(() => {
    const init: Record<string, any> = {};
    profiles.forEach((p) => {
      init[p.id] = {
        fullName: p.full_name,
        leadTitle: p.lead_title || '',
        email: p.email || '',
        role: p.role,
        avatarColor: p.avatar_color || '#F4AEBE',
      };
    });
    return init;
  });

  // Per-venture form states
  const [editingVentures, setEditingVentures] = useState<Record<string, {
    name: string;
    code: string;
    description: string;
    leadId: string;
    leadTitle: string;
  }>>(() => {
    const init: Record<string, any> = {};
    ventures.forEach((v) => {
      init[v.id] = {
        name: v.name,
        code: v.code,
        description: v.description || '',
        leadId: v.lead_id || '',
        leadTitle: v.lead_title || '',
      };
    });
    return init;
  });

  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when modal opens or profiles/ventures change
  React.useEffect(() => {
    if (isOpen) {
      if (defaultTab) setActiveTab(defaultTab);
      const profInit: Record<string, any> = {};
      profiles.forEach((p) => {
        profInit[p.id] = {
          fullName: p.full_name,
          leadTitle: p.lead_title || '',
          email: p.email || '',
          role: p.role,
          avatarColor: p.avatar_color || '#F4AEBE',
        };
      });
      setEditingProfiles(profInit);

      const ventInit: Record<string, any> = {};
      currentVentures.forEach((v) => {
        ventInit[v.id] = {
          name: v.name,
          code: v.code,
          description: v.description || '',
          leadId: v.lead_id || '',
          leadTitle: v.lead_title || '',
        };
      });
      setEditingVentures(ventInit);
      setStatusMessage(null);
    }
  }, [isOpen, profiles, currentVentures, defaultTab]);

  if (!isOpen) return null;

  const handleSaveProfile = async (profileId: string) => {
    const form = editingProfiles[profileId];
    if (!form || !form.fullName.trim()) {
      setStatusMessage({ id: profileId, type: 'error', text: 'Member name cannot be empty.' });
      return;
    }

    setSavingId(profileId);
    setStatusMessage(null);

    const res = await updateProfileAdmin({
      profileId,
      fullName: form.fullName,
      leadTitle: form.leadTitle,
      email: form.email,
      role: form.role,
      avatarColor: form.avatarColor,
    });

    setSavingId(null);
    if (res.success) {
      setStatusMessage({ id: profileId, type: 'success', text: `Saved profile for ${form.fullName}.` });
      onRefresh();
    } else {
      setStatusMessage({ id: profileId, type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  const handleSaveVenture = async (ventureId: string) => {
    const form = editingVentures[ventureId];
    if (!form || !form.name.trim() || !form.code.trim()) {
      setStatusMessage({ id: ventureId, type: 'error', text: 'Venture name and code are required.' });
      return;
    }

    setSavingId(ventureId);
    setStatusMessage(null);

    const res = await updateVentureAdmin({
      ventureId,
      name: form.name,
      code: form.code,
      description: form.description,
      leadId: form.leadId || null,
      leadTitle: form.leadTitle,
    });

    setSavingId(null);
    if (res.success) {
      setStatusMessage({ id: ventureId, type: 'success', text: `Saved venture ${form.code} (${form.name}).` });
      onRefresh();
    } else {
      setStatusMessage({ id: ventureId, type: 'error', text: res.error || 'Failed to update venture.' });
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.lead_title && p.lead_title.toLowerCase().includes(q))
    );
  });

  const filteredVentures = currentVentures.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      (v.lead?.full_name && v.lead.full_name.toLowerCase().includes(q))
    );
  });

  const presetColors = [
    '#F4AEBE', // Rose Silk
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#03153D]/95 border border-[#F4AEBE]/30 shadow-[0_20px_70px_rgba(2,11,32,0.95)] overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#F4AEBE]/20 flex items-center justify-between gap-4 bg-[#020B20]/90">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F4AEBE]/15 border border-[#F4AEBE]/35 flex items-center justify-center text-[#F4AEBE] shadow-[0_0_15px_rgba(244,174,190,0.3)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#F4AEBE] font-bold">
                  FOUNDER EXECUTIVE STUDIO
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#F4AEBE]/20 text-[#F4AEBE] border border-[#F4AEBE]/30 font-bold">
                  Full Authority
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">
                Master Portfolio & Team Studio
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/[0.06] hover:bg-[#F4AEBE]/20 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
            title="Close Executive Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Controls Strip */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-[#F4AEBE]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#03153D]/60">
          {/* Tabs */}
          <div className="flex items-center bg-[#020B20] p-1 rounded-2xl border border-[#F4AEBE]/25 shadow-inner">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profiles'
                  ? 'bg-gradient-to-r from-[#F4AEBE] to-[#e895a9] text-[#03153D] font-bold shadow-[0_2px_14px_rgba(244,174,190,0.4)]'
                  : 'text-[#F4AEBE]/80 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Directory ({profiles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ventures')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ventures'
                  ? 'bg-gradient-to-r from-[#F4AEBE] to-[#e895a9] text-[#03153D] font-bold shadow-[0_2px_14px_rgba(244,174,190,0.4)]'
                  : 'text-[#F4AEBE]/80 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>13 Ventures & Leads ({currentVentures.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#F4AEBE]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'profiles' ? 'Search members...' : 'Search ventures...'}
              className="w-full bg-[#020B20] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'profiles' ? (
            /* TAB 1: TEAM PROFILES */
            <div className="space-y-4">
              <div className="text-xs text-zinc-300 font-mono flex items-center justify-between">
                <span>Directly modify team member names, leadership titles, alert emails, roles, and avatar themes.</span>
                <span className="text-[#F4AEBE] font-bold">{filteredProfiles.length} Members</span>
              </div>

              {filteredProfiles.map((p) => {
                const form = editingProfiles[p.id] || {
                  fullName: p.full_name,
                  leadTitle: p.lead_title || '',
                  email: p.email || '',
                  role: p.role,
                  avatarColor: p.avatar_color || '#F4AEBE',
                };
                const isSaving = savingId === p.id;
                const status = statusMessage?.id === p.id ? statusMessage : null;
                const leadingVentures = currentVentures.filter((v) => v.lead_id === p.id);

                return (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <NetflixAvatar
                          name={form.fullName || p.full_name}
                          role={form.role}
                          avatarColor={form.avatarColor}
                          avatarUrl={p.avatar_url}
                          size="md"
                          className="!w-12 !h-12 rounded-xl shadow-md shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-white font-display">
                              {p.full_name}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4AEBE]/15 text-[#F4AEBE] border border-[#F4AEBE]/25 uppercase font-bold">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            {leadingVentures.length > 0
                              ? `Leads ${leadingVentures.length} ventures: ${leadingVentures.map((v) => v.code).join(', ')}`
                              : 'Collaborator / Contributor'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveProfile(p.id)}
                        className="px-4 py-2 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-[0_2px_12px_rgba(244,174,190,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display uppercase tracking-wider disabled:opacity-50 shrink-0 self-end md:self-auto"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Member'}</span>
                      </button>
                    </div>

                    {status && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          status.type === 'success'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {status.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{status.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#F4AEBE]/10">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) =>
                            setEditingProfiles((prev) => ({
                              ...prev,
                              [p.id]: { ...form, fullName: e.target.value },
                            }))
                          }
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Lead / Role Title
                        </label>
                        <input
                          type="text"
                          value={form.leadTitle}
                          onChange={(e) =>
                            setEditingProfiles((prev) => ({
                              ...prev,
                              [p.id]: { ...form, leadTitle: e.target.value },
                            }))
                          }
                          placeholder="e.g. Venture Lead"
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Alert Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setEditingProfiles((prev) => ({
                              ...prev,
                              [p.id]: { ...form, email: e.target.value },
                            }))
                          }
                          placeholder="name@houseofventures.com"
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Avatar Color Theme
                        </label>
                        <div className="flex items-center gap-1.5 pt-1">
                          {presetColors.map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() =>
                                setEditingProfiles((prev) => ({
                                  ...prev,
                                  [p.id]: { ...form, avatarColor: col },
                                }))
                              }
                              style={{ backgroundColor: col }}
                              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                                form.avatarColor === col
                                  ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#020B20]'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB 2: VENTURES & LEADS */
            <div className="space-y-4">
              <div className="text-xs text-zinc-300 font-mono flex items-center justify-between">
                <span>Manage all 13 portfolio ventures, customize names, codes, descriptions, and assign venture leads.</span>
                <span className="text-[#F4AEBE] font-bold">{filteredVentures.length} Ventures</span>
              </div>

              {filteredVentures.map((v) => {
                const form = editingVentures[v.id] || {
                  name: v.name,
                  code: v.code,
                  description: v.description || '',
                  leadId: v.lead_id || '',
                  leadTitle: v.lead_title || '',
                };
                const isSaving = savingId === v.id;
                const status = statusMessage?.id === v.id ? statusMessage : null;

                return (
                  <div
                    key={v.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#020B20]/80 border border-[#F4AEBE]/20 hover:border-[#F4AEBE]/40 transition-all shadow-md space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#03153D] bg-[#F4AEBE] px-3 py-1 rounded-xl shadow-sm">
                          {form.code || v.code}
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white font-display">
                            {form.name || v.name}
                          </h4>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            Current Lead: <strong className="text-white">{v.lead?.full_name || 'Unassigned'}</strong> • {v.objectives_count ?? 0} Objectives
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveVenture(v.id)}
                        className="px-4 py-2 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] text-xs font-bold shadow-[0_2px_12px_rgba(244,174,190,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display uppercase tracking-wider disabled:opacity-50 shrink-0 self-end md:self-auto"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Venture'}</span>
                      </button>
                    </div>

                    {status && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          status.type === 'success'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {status.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{status.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#F4AEBE]/10">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Venture Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setEditingVentures((prev) => ({
                              ...prev,
                              [v.id]: { ...form, name: e.target.value },
                            }))
                          }
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Venture Code *
                        </label>
                        <input
                          type="text"
                          value={form.code}
                          onChange={(e) =>
                            setEditingVentures((prev) => ({
                              ...prev,
                              [v.id]: { ...form, code: e.target.value.toUpperCase() },
                            }))
                          }
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Assign Venture Lead
                        </label>
                        <select
                          value={form.leadId}
                          onChange={(e) => {
                            const newLeadId = e.target.value;
                            const leadProf = profiles.find((p) => p.id === newLeadId);
                            setEditingVentures((prev) => ({
                              ...prev,
                              [v.id]: {
                                ...form,
                                leadId: newLeadId,
                                leadTitle: leadProf?.lead_title || form.leadTitle || 'Venture Lead',
                              },
                            }));
                          }}
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">Unassigned</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.full_name} ({p.role === 'founder' ? 'Founder' : p.lead_title || 'Member'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Lead Title in Venture
                        </label>
                        <input
                          type="text"
                          value={form.leadTitle}
                          onChange={(e) =>
                            setEditingVentures((prev) => ({
                              ...prev,
                              [v.id]: { ...form, leadTitle: e.target.value },
                            }))
                          }
                          placeholder="e.g. Venture Lead"
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11px] font-mono uppercase text-[#F4AEBE]/90 font-bold mb-1">
                          Venture Purpose / Description
                        </label>
                        <input
                          type="text"
                          value={form.description}
                          onChange={(e) =>
                            setEditingVentures((prev) => ({
                              ...prev,
                              [v.id]: { ...form, description: e.target.value },
                            }))
                          }
                          placeholder="Brief operational mission of this venture..."
                          className="w-full bg-[#03153D] border border-[#F4AEBE]/25 focus:border-[#F4AEBE] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-[#F4AEBE]/20 flex items-center justify-between bg-[#020B20]/90 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Deterministic Sync • Role-Based Authority: Founder</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#F4AEBE]/30 hover:border-[#F4AEBE] text-[#F4AEBE] hover:text-white transition-all cursor-pointer font-bold font-display uppercase tracking-wider text-[11px]"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
}
