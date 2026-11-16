'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { EmailPromptModal } from '../auth/EmailPromptModal';
import { AddMemberModal } from '../auth/AddMemberModal';
import { NetflixAvatar } from '../auth/NetflixAvatar';
import {
  Briefcase,
  Calendar,
  BarChart3,
  ChevronDown,
  UserPlus,
  Mail,
  LogOut,
  Eye,
  Menu,
  X,
  Crown,
  Bell,
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
  const isHomePage = pathname === '/';

  const navLinks = [
    { href: '/daily-work', label: 'Daily Work & OKRs', icon: Briefcase },
    { href: '/next-plans', label: 'Next Plans', icon: Calendar },
    { href: '/progress', label: 'Progress Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isHomePage
            ? 'bg-[#141414]/95 border-b border-zinc-800/40 backdrop-blur-md'
            : 'bg-[#0b0c14]/85 border-b border-white/[0.06] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              {/* Netflix-styled bold red HOV mark */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-mono font-black text-xs tracking-wider shadow-lg shadow-red-600/30 transition-transform group-hover:scale-105">
                HOV
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight leading-none group-hover:text-zinc-200 transition-colors">
                  House of Ventures
                </div>
                <div className="text-[9px] text-zinc-400 font-mono tracking-widest mt-0.5">
                  OPERATIONS OS
                </div>
              </div>
            </Link>

            {/* Impersonation Indicator Pill */}
            {!isHomePage && impersonatedMember && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>VIEWING: {impersonatedMember.full_name}</span>
                <button
                  onClick={() => setImpersonatedMember(null)}
                  className="ml-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear View As"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs (Liquid Segmented Control) */}
          {!isHomePage && activeProfile && (
            <nav className="hidden md:flex items-center bg-[#13141f]/90 p-1 rounded-2xl border border-white/[0.08] shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_12px_rgba(124,58,237,0.4)] border border-violet-400/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Founder "View As" Dropdown */}
            {!isHomePage && activeProfile && isFounder && (
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
                  className="text-[11px] font-mono px-3 py-1.5 rounded-xl text-zinc-200 cursor-pointer bg-[#141624] border border-white/[0.08] hover:border-violet-500/50 focus:outline-none transition-colors shadow-sm"
                >
                  <option value="master">Founder Mode (All 13)</option>
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
            {!isHomePage && activeProfile && <NotificationBell />}

            {/* Active Profile Switcher */}
            {activeProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#141624]/90 hover:bg-[#1a1d30] border border-white/[0.08] hover:border-white/20 transition-all focus:outline-none cursor-pointer group shadow-sm"
                >
                  <NetflixAvatar
                    name={activeProfile.full_name}
                    role={activeProfile.role}
                    avatarColor={activeProfile.avatar_color}
                    size="sm"
                    className="!w-6 !h-6 rounded-md shadow"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-zinc-100 flex items-center gap-1">
                      {activeProfile.full_name}
                      {isFounder && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-[#12131d]/95 backdrop-blur-2xl border border-white/[0.1] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)] z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2.5 border-b border-zinc-800/80 mb-1">
                        <div className="text-xs font-semibold text-zinc-100 flex items-center justify-between">
                          <span>{activeProfile.full_name}</span>
                          {isFounder && (
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                              FOUNDER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                          {activeProfile.email || 'No email configured'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsEmailModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Update Alert Email</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAddMemberModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Add Team Member</span>
                      </button>

                      <div className="border-t border-zinc-800/80 my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveProfile(null);
                          setImpersonatedMember(null);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Switch Profile (Netflix Picker)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Select Profile
              </Link>
            )}

            {/* Mobile menu trigger */}
            {!isHomePage && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#141624] border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu drawer */}
        {!isHomePage && isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 px-4 py-3 bg-[#0b0c14] space-y-2">
            {activeProfile ? (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <div className="border-t border-zinc-800 pt-2 mt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAddMemberModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-300 hover:bg-zinc-900 rounded-xl text-left"
                  >
                    <UserPlus className="w-4 h-4 text-zinc-400" />
                    <span>Add Team Member</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsEmailModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-zinc-300 hover:bg-zinc-900 rounded-xl text-left"
                  >
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span>Update Alert Email</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveProfile(null);
                      setImpersonatedMember(null);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Switch Profile</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2 text-center">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-block w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs"
                >
                  Select Operator Profile
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Floating Bottom Dock (For quick thumb navigation on mobile phones) */}
      {!isHomePage && activeProfile && (
        <div className="md:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-auto">
          <div className="liquid-card !rounded-2xl p-1.5 flex items-center justify-around shadow-[0_10px_35px_rgba(0,0,0,0.8)] border border-white/[0.12] bg-[#0e101a]/95 backdrop-blur-2xl">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'text-white bg-violet-600/30 border border-violet-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{link.label.split(' ')[0]}</span>
                </Link>
              );
            })}

            {/* Profile avatar link to switch profile */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-white transition-all min-h-[44px]"
            >
              <NetflixAvatar
                name={activeProfile.full_name}
                role={activeProfile.role}
                avatarColor={activeProfile.avatar_color}
                size="sm"
                className="!w-4 !h-4 rounded-sm mb-0.5"
              />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}

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
