'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { updateProfileAvatar } from '@/app/actions/profile-actions';
import { NetflixAvatar } from './NetflixAvatar';
import { X, Check, Image as ImageIcon, Sparkles, Upload, Palette } from 'lucide-react';

interface ChangeAvatarModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: Profile) => void;
}

export function ChangeAvatarModal({
  profile,
  isOpen,
  onClose,
  onSuccess,
}: ChangeAvatarModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('preset:rose-silk');
  const [selectedColor, setSelectedColor] = useState<string>('#F4AEBE');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'color' | 'custom'>('presets');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url && !profile.avatar_url.startsWith('preset:')) {
        setCustomImageUrl(profile.avatar_url);
        setActiveTab('custom');
      } else if (profile.avatar_url?.startsWith('preset:')) {
        setSelectedPreset(profile.avatar_url);
        setActiveTab('presets');
      }
      if (profile.avatar_color) {
        setSelectedColor(profile.avatar_color);
      }
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const presets = [
    { id: 'preset:rose-silk', name: 'Rose Silk', desc: 'Editorial Blush & Blue Velvet' },
    { id: 'preset:blue-velvet', name: 'Blue Velvet', desc: 'Midnight Luxury Navy' },
    { id: 'preset:cyclops', name: 'Alien Cyclops', desc: 'Iconic 3-Eyed Character' },
    { id: 'preset:warm-smile', name: 'Sunny Amber', desc: 'Warm Radiant Smile' },
    { id: 'preset:cool-smirk', name: 'Cool Slate', desc: 'Sleek Grin' },
    { id: 'preset:joyful', name: 'Joyful Violet', desc: 'Expressive Laugh' },
    { id: 'preset:friendly', name: 'Teal Wink', desc: 'Playful Wink' },
    { id: 'preset:classic-smile', name: 'Classic Crimson', desc: 'Netflix Iconic Red' },
  ];

  const colorPalette = [
    { hex: '#F4AEBE', name: 'Rose Silk' },
    { hex: '#03153D', name: 'Blue Velvet' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#8b5cf6', name: 'Violet' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#ef4444', name: 'Crimson' },
    { hex: '#ec4899', name: 'Fuchsia' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    let avatarUrlToSave = '';
    if (activeTab === 'presets') {
      avatarUrlToSave = selectedPreset;
    } else if (activeTab === 'custom') {
      avatarUrlToSave = customImageUrl.trim();
    }

    const res = await updateProfileAvatar({
      profileId: profile.id,
      avatarUrl: avatarUrlToSave,
      avatarColor: selectedColor,
    });

    setIsSaving(false);
    if (res.success && res.profile) {
      onSuccess(res.profile);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to update avatar');
    }
  };

  // Preview properties
  const currentAvatarUrl =
    activeTab === 'custom'
      ? customImageUrl.trim()
      : activeTab === 'presets'
      ? selectedPreset
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#03153D] border border-[#F4AEBE]/30 p-6 sm:p-8 shadow-[0_24px_60px_rgba(3,21,61,0.9),inset_0_1px_1px_rgba(244,174,190,0.3)] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono tracking-widest text-[#F4AEBE] uppercase font-bold">
            Profile Personalization
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">
            Choose Your Avatar
          </h2>
          <p className="text-xs text-zinc-300 mt-1">
            Updating profile picture for <strong className="text-[#F4AEBE]">{profile.full_name}</strong>
          </p>
        </div>

        {/* Live Preview Box */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-2 rounded-2xl bg-[#020B20] border-2 border-[#F4AEBE] shadow-[0_0_25px_rgba(244,174,190,0.3)]">
            <NetflixAvatar
              name={profile.full_name}
              role={profile.role}
              avatarUrl={currentAvatarUrl}
              avatarColor={selectedColor}
              size="lg"
              className="!w-24 !h-24 sm:!w-28 sm:!h-28 rounded-xl"
            />
          </div>
          <span className="text-xs text-zinc-300 mt-2 font-mono">Live Preview</span>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-[#020B20] border border-[#F4AEBE]/20 mb-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#F4AEBE] text-[#03153D] shadow-md font-bold'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Character Styles</span>
          </button>
          <button
            onClick={() => setActiveTab('color')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'color'
                ? 'bg-[#F4AEBE] text-[#03153D] shadow-md font-bold'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colorway</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#F4AEBE] text-[#03153D] shadow-md font-bold'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Custom Photo</span>
          </button>
        </div>

        {/* Tab 1: Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1 mb-6">
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#F4AEBE]/20 ring-2 ring-[#F4AEBE] scale-105'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]'
                  }`}
                >
                  <NetflixAvatar
                    name={profile.full_name}
                    avatarUrl={preset.id}
                    size="md"
                    className="!w-12 !h-12 rounded-lg mb-1.5 shadow"
                  />
                  <span className="text-[10px] text-zinc-300 font-medium truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Colorway */}
        {activeTab === 'color' && (
          <div className="space-y-4 mb-6">
            <div className="text-xs text-zinc-300 text-center font-mono">
              Select an accent tone for your profile badge
            </div>
            <div className="grid grid-cols-4 gap-3">
              {colorPalette.map((c) => {
                const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F4AEBE] bg-[#F4AEBE]/20 ring-2 ring-[#F4AEBE]'
                        : 'border-white/[0.1] bg-[#020B20]/60 hover:border-white/30'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-inner border border-white/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs text-zinc-200 font-medium truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Image URL */}
        {activeTab === 'custom' && (
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-mono text-zinc-300">
              Paste image link (Unsplash, Gravatar, hosted photo URL):
            </label>
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-[#020B20] border border-[#F4AEBE]/30 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F4AEBE] shadow-inner"
            />
            <p className="text-[11px] text-zinc-400">
              Supports any secure JPG, PNG, or WebP web link.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F4AEBE]/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-[#F4AEBE] hover:bg-[#f7bac8] text-[#03153D] font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 font-display uppercase tracking-wider"
          >
            {isSaving ? 'Updating...' : 'Save Picture'}
          </button>
        </div>
      </div>
    </div>
  );
}
