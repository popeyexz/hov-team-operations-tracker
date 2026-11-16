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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-mono font-bold text-xs tracking-wider transition-transform group-hover:scale-105">
                HOV
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-zinc-100 tracking-tight leading-none group-hover:text-zinc-300 transition-colors">
                  House of Ventures
                </div>
                <div className="text-[10px] text-zinc-500 font-mono tracking-widest mt-0.5">
                  OPERATIONS OS
                </div>
              </div>
            </Link>

            {/* Impersonation Indicator Pill */}
            {impersonatedMember && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-mono">
                <Eye className="w-3 h-3" />
                <span>VIEWING: {impersonatedMember.full_name}</span>
                <button
                  onClick={() => setImpersonatedMember(null)}
                  className="ml-1 text-zinc-400 hover:text-white transition-colors"
                  title="Clear View As"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs (Tactile Segmented Control) */}
          <nav className="hidden md:flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
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
                  className="text-[11px] font-mono px-2.5 py-1 rounded-md text-zinc-300 cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:outline-none transition-colors"
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
            <NotificationBell />

            {/* Active Profile Switcher */}
            {activeProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all focus:outline-none cursor-pointer group"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: activeProfile.avatar_color || '#3b82f6' }}
                  >
                    {activeProfile.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-zinc-200 flex items-center gap-1">
                      {activeProfile.full_name}
                      {isFounder && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                        <div className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                          <span>{activeProfile.full_name}</span>
                          {isFounder && (
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-1 rounded border border-amber-500/20">
                              FOUNDER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                          {activeProfile.email || 'No email configured'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsEmailModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Update Alert Email</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAddMemberModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Add Team Member</span>
                      </button>

                      <div className="border-t border-zinc-800 my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveProfile(null);
                          setImpersonatedMember(null);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer font-medium"
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
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Select Profile
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 px-4 py-3 bg-[#09090b] space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-zinc-800 text-white'
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
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 rounded-lg"
              >
                <UserPlus className="w-4 h-4 text-zinc-400" />
                <span>Add Team Member</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsEmailModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 rounded-lg"
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
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
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
