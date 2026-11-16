'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { EmailPromptModal } from '../auth/EmailPromptModal';
import { AddMemberModal } from '../auth/AddMemberModal';
import {
  Briefcase,
  Calendar,
  BarChart3,
  ChevronDown,
  UserPlus,
  Mail,
  LogOut,
  Eye,
  Shield,
  Menu,
  X,
  Sparkles,
  Layers,
  Crown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeProfile,
    setActiveProfile,
    impersonatedMember,
    setImpersonatedMember,
    profiles,
    refreshProfiles,
  } = useActiveProfile();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFounder = activeProfile?.role === 'founder';

  const navLinks = [
    { href: '/daily-work', label: 'Daily Work & OKRs', icon: Briefcase },
    { href: '/next-plans', label: 'Next Plans', icon: Calendar },
    { href: '/progress', label: 'Progress Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-2 z-40 w-full max-w-7xl mx-auto px-3 sm:px-6 transition-all duration-300">
        <div className="glass-panel rounded-2xl sm:rounded-3xl border border-white/[0.12] shadow-2xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-400 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-1 ring-white/30">
                HOV
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white tracking-tight leading-tight flex items-center gap-1.5 group-hover:text-sky-300 transition-colors">
                  House of Ventures
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wide">OPERATIONS OS</div>
              </div>
            </Link>

            {/* Impersonation Indicator Pill */}
            {impersonatedMember && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm animate-pulse">
                <Eye className="w-3.5 h-3.5" />
                <span>Viewing as {impersonatedMember.full_name}</span>
                <button
                  onClick={() => setImpersonatedMember(null)}
                  className="ml-1 text-slate-400 hover:text-white transition-colors"
                  title="Clear View As"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs (Luxury Segmented Glass Control) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/[0.08] shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Founder "View As" Dropdown */}
            {isFounder && (
              <div className="hidden sm:block relative">
                <select
                  value={impersonatedMember?.id || 'master'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'master') {
                      setImpersonatedMember(null);
                    } else {
                      const member = profiles.find((p) => p.id === val);
                      setImpersonatedMember(member || null);
                    }
                  }}
                  className="glass-input text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-200 cursor-pointer bg-slate-900/90 border-white/10 hover:border-indigo-400/40 focus:border-indigo-500 transition-colors shadow-sm"
                >
                  <option value="master">Founder View (All 13)</option>
                  <optgroup label="View As Member">
                    {profiles
                      .filter((p) => p.role !== 'founder')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.lead_title || 'Member'})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            )}

            {/* Notification Center */}
            <NotificationBell />

            {/* Active Profile Switcher Pill */}
            {activeProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl glass-card hover:bg-white/10 border border-white/15 transition-all focus:outline-none cursor-pointer shadow-md group"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-white/30"
                    style={{ backgroundColor: activeProfile.avatar_color || '#6366f1' }}
                  >
                    {activeProfile.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {activeProfile.full_name}
                      {isFounder && <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                      {activeProfile.lead_title || 'Active'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-3xl glass-panel border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2.5 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {activeProfile.full_name}
                          {isFounder && (
                            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                              Founder
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                          {activeProfile.email || 'No alert email set'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsEmailModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-colors text-left cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>Update Alert Email</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAddMemberModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-colors text-left cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add Team Member</span>
                      </button>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveProfile(null);
                          setImpersonatedMember(null);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Switch Profile</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 border border-white/20 transition-all cursor-pointer"
              >
                Select Profile
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 px-4 pt-3 pb-4 glass-panel rounded-2xl border border-white/10 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAddMemberModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-white/5 rounded-xl"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Team Member</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsEmailModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-sky-300 hover:bg-white/5 rounded-xl"
              >
                <Mail className="w-4 h-4" />
                <span>Update Alert Email</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveProfile(null);
                  setImpersonatedMember(null);
                  router.push('/');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Switch Profile</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <EmailPromptModal
        profile={activeProfile}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={() => {
          refreshProfiles();
        }}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={() => {
          refreshProfiles();
        }}
      />
    </>
  );
}
