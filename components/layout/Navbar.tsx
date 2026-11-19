'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { EmailPromptModal } from '../auth/EmailPromptModal';
import { AddMemberModal } from '../auth/AddMemberModal';
import { FounderAdminModal } from '../admin/FounderAdminModal';
import { ExcelImportModal } from '../import/ExcelImportModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  ChevronDown,
  UserPlus,
  Mail,
  LogOut,
  Eye,
  Menu,
  X,
  Shield,
  Layers,
  Smartphone,
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
  const [isFounderAdminOpen, setIsFounderAdminOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on Home page, ProfileGrid has its own dedicated top bar matching Image 3
  if (pathname === '/') {
    return null;
  }

  const isFounder = activeProfile?.role === 'founder';
  const effectiveProfile = impersonatedMember || activeProfile;

  const navLinks = [
    { href: '/daily-work', label: '01 DAILY TRACKER' },
    { href: '/next-plans', label: '02 NEXT PLANS' },
    { href: '/progress', label: '03 ANALYTICS' },
    { href: '/all-tabs', label: '04 ALL TABS OVERVIEW' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-200 bg-[#071026]/95 border-b border-[#FFF7E6]/15 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Controls: Profiles Back & Active Profile Dropdown */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FFF7E6]/30 hover:border-[#FFF7E6] text-[#FFF7E6] text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:bg-[#FFF7E6]/5"
            >
              <span>&larr; PROFILES</span>
            </Link>

            {/* Profile Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#FFF7E6]/30 hover:border-[#FFF7E6] text-[#FFF7E6] text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer bg-[#0E1836] shadow-sm"
              >
                <span>
                  {effectiveProfile
                    ? `${effectiveProfile.full_name.toUpperCase()} (${effectiveProfile.role.toUpperCase()})`
                    : 'SELECT OPERATOR'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0E1836] border border-[#FFF7E6]/25 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] font-mono text-[#FFF7E6]/60 uppercase tracking-widest border-b border-[#FFF7E6]/10">
                    Switch Active Operator
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (activeProfile?.role === 'founder' && p.role !== 'founder') {
                            setImpersonatedMember(p);
                          } else {
                            setActiveProfile(p);
                            setImpersonatedMember(null);
                          }
                          router.push('/daily-work');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                          effectiveProfile?.id === p.id
                            ? 'bg-[#FFF7E6] text-[#0A122A] font-bold'
                            : 'text-[#FFF7E6]/80 hover:bg-white/5 hover:text-[#FFF7E6]'
                        }`}
                      >
                        <span className="truncate">{p.full_name}</span>
                        <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                          {p.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#FFF7E6]/10 space-y-1">
                    {isFounder && (
                      <button
                        onClick={() => setIsFounderAdminOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#FFF7E6] hover:bg-white/5 text-left font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Founder Admin Studio</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#FFF7E6] hover:bg-white/5 text-left"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Team Member</span>
                    </button>

                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#FFF7E6] hover:bg-white/5 text-left"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Update Alert Email</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveProfile(null);
                        setImpersonatedMember(null);
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 text-left font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch / Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Tabs: Pill Group Matching Image 4 */}
          <nav className="hidden lg:flex items-center bg-[#071026] p-1 rounded-full border border-[#FFF7E6]/25 shadow-inner gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#FFF7E6] text-[#0A122A] shadow-md'
                      : 'text-[#FFF7E6]/80 hover:text-[#FFF7E6] hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Import Excel, Mobile View, Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#FFF7E6] text-[#0A122A] font-display text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              IMPORT EXCEL
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('toggle-mobile-view'));
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FFF7E6]/30 hover:border-[#FFF7E6] text-[#FFF7E6] font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-white/5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>MOBILE VIEW</span>
            </button>

            <ThemeToggle className="!rounded-full !min-h-[32px] !min-w-[32px] !p-1.5 border-[#FFF7E6]/30 bg-transparent text-[#FFF7E6]" />

            <NotificationBell />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#FFF7E6] border border-[#FFF7E6]/25"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#FFF7E6]/15 bg-[#071026] px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-center text-xs font-bold font-display uppercase tracking-wider ${
                    pathname.startsWith(link.href)
                      ? 'bg-[#FFF7E6] text-[#0A122A]'
                      : 'border border-[#FFF7E6]/20 text-[#FFF7E6]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#FFF7E6]/10 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('toggle-mobile-view'));
                  }
                }}
                className="w-full py-2 rounded-xl text-xs font-display font-bold uppercase border border-[#FFF7E6]/30 text-[#FFF7E6]"
              >
                Toggle Mobile Feed View
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="w-full py-2 rounded-xl text-xs font-display font-bold uppercase bg-[#FFF7E6] text-[#0A122A]"
              >
                Import Excel (.xlsx)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Subheader Bar: Fx Bar & Operator Status Matching Image 4 */}
      <div className="w-full bg-[#071026]/90 border-b border-[#FFF7E6]/10 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] font-mono text-[#FFF7E6]/75 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#FFF7E6]/15 text-[#FFF7E6] font-bold text-[10px]">
              Fx
            </span>
            <span>Click any cell to edit inline, or click &quot;Import Excel&quot; to load your workbook.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>
              Operator: <strong className="text-[#FFF7E6]">{effectiveProfile?.full_name || 'Pratap'}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Role: <strong className="text-[#FFF7E6]">{effectiveProfile?.role?.toUpperCase() || 'FOUNDER'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => refreshProfiles()}
      />

      <EmailPromptModal
        profile={activeProfile}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={() => refreshProfiles()}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={() => refreshProfiles()}
      />

      {isFounder && (
        <FounderAdminModal
          isOpen={isFounderAdminOpen}
          onClose={() => setIsFounderAdminOpen(false)}
          profiles={profiles}
          onRefresh={refreshProfiles}
        />
      )}
    </>
  );
}
