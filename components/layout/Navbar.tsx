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
  UserCheck,
  ChevronDown,
  UserPlus,
  Mail,
  LogOut,
  Eye,
  Shield,
  Menu,
  X,
  Layers,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeProfile,
    setActiveProfile,
    impersonatedMember,
    setImpersonatedMember,
    effectiveProfile,
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
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                HOV
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
                  House of Ventures
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Team Operations & OKRs</div>
              </div>
            </Link>

            {/* Impersonation Indicator Pill */}
            {impersonatedMember && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
                <Eye className="w-3 h-3" />
                <span>Viewing as {impersonatedMember.full_name}</span>
                <button
                  onClick={() => setImpersonatedMember(null)}
                  className="ml-1 text-slate-400 hover:text-white"
                  title="Clear View As"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
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
                  className="glass-input text-xs font-semibold px-2.5 py-1.5 rounded-xl text-slate-200 cursor-pointer bg-slate-900/90 border-white/10 hover:border-white/20"
                >
                  <option value="master">Founder View (All)</option>
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
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl glass-card hover:bg-white/10 border border-white/15 transition-all focus:outline-none"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: activeProfile.avatar_color || '#3b82f6' }}
                  >
                    {activeProfile.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {activeProfile.full_name}
                      {isFounder && <Shield className="w-2.5 h-2.5 text-rose-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {activeProfile.lead_title || 'Active'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white">
                          {activeProfile.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {activeProfile.email || 'No email registered'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsEmailModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
                      >
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>Update Alert Email</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAddMemberModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
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
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
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
          <div className="md:hidden px-4 pt-2 pb-4 glass-panel border-t border-white/10 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isFounder && (
              <div className="pt-2 border-t border-white/10">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  View As Perspective
                </label>
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
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full glass-input text-xs font-semibold p-2 rounded-xl text-slate-200 bg-slate-900/90"
                >
                  <option value="master">Founder View (All)</option>
                  {profiles
                    .filter((p) => p.role !== 'founder')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.lead_title})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Modals */}
      <EmailPromptModal
        profile={activeProfile}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={(updated) => {
          setActiveProfile(updated);
          refreshProfiles();
        }}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onMemberAdded={() => refreshProfiles()}
      />
    </>
  );
}
