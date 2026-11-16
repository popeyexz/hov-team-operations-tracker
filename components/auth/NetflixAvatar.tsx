'use client';

import React from 'react';

interface NetflixAvatarProps {
  name: string;
  role?: string;
  avatarColor?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Genuine Netflix-style vector avatars with iconic expressions and vibrant colorways,
 * featuring Blue Velvet (#03153D) and Rose Silk (#F4AEBE) color theory with zero crown symbols.
 */
export function NetflixAvatar({
  name,
  role,
  avatarColor,
  avatarUrl,
  size = 'lg',
  className = '',
}: NetflixAvatarProps) {
  const isFounder = role === 'founder' || name.toLowerCase().includes('pratap');
  const lowerName = name.toLowerCase();

  // If avatarUrl is an actual image URL or data URI, render the image
  const isCustomImage =
    avatarUrl &&
    (avatarUrl.startsWith('http://') ||
      avatarUrl.startsWith('https://') ||
      avatarUrl.startsWith('data:image') ||
      avatarUrl.startsWith('/'));

  // Determine avatar face style and color scheme
  let theme = {
    bg: 'from-[#03153D] to-[#072468]',
    bgColor: '#03153D',
    type: 'blue-velvet',
  };

  // Check preset override from avatarUrl (e.g. "preset:rose-silk")
  const presetKey = avatarUrl?.startsWith('preset:') ? avatarUrl.replace('preset:', '') : null;

  if (presetKey) {
    if (presetKey === 'rose-silk') {
      theme = { bg: 'from-[#F4AEBE] to-[#e895a9]', bgColor: '#F4AEBE', type: 'rose-silk' };
    } else if (presetKey === 'blue-velvet') {
      theme = { bg: 'from-[#03153D] to-[#072468]', bgColor: '#03153D', type: 'blue-velvet' };
    } else if (presetKey === 'cyclops') {
      theme = { bg: 'from-emerald-400 to-emerald-600', bgColor: '#10b981', type: 'cyclops' };
    } else if (presetKey === 'warm-smile') {
      theme = { bg: 'from-amber-400 to-yellow-500', bgColor: '#f59e0b', type: 'warm-smile' };
    } else if (presetKey === 'cool-smirk') {
      theme = { bg: 'from-slate-700 via-cyan-900 to-zinc-900', bgColor: '#0f172a', type: 'cool-smirk' };
    } else if (presetKey === 'joyful') {
      theme = { bg: 'from-purple-500 to-indigo-600', bgColor: '#8b5cf6', type: 'joyful' };
    } else if (presetKey === 'friendly') {
      theme = { bg: 'from-cyan-400 to-teal-600', bgColor: '#06b6d4', type: 'friendly' };
    } else if (presetKey === 'classic-smile') {
      theme = { bg: 'from-red-500 to-rose-600', bgColor: '#ef4444', type: 'classic-smile' };
    }
  } else if (isFounder) {
    // Founder: Rich Blue Velvet & Rose Silk luxury face (No crown)
    theme = {
      bg: 'from-[#03153D] via-[#072468] to-[#0a318a]',
      bgColor: '#03153D',
      type: 'blue-velvet',
    };
  } else if (lowerName.includes('rufus')) {
    theme = {
      bg: 'from-emerald-400 to-emerald-600',
      bgColor: '#10b981',
      type: 'cyclops',
    };
  } else if (lowerName.includes('atharav')) {
    theme = {
      bg: 'from-amber-400 to-yellow-500',
      bgColor: '#f59e0b',
      type: 'warm-smile',
    };
  } else if (lowerName.includes('sharuk')) {
    theme = {
      bg: 'from-slate-700 via-cyan-900 to-zinc-900',
      bgColor: '#0f172a',
      type: 'cool-smirk',
    };
  } else if (lowerName.includes('rohini')) {
    theme = {
      bg: 'from-[#F4AEBE] to-[#e895a9]',
      bgColor: '#F4AEBE',
      type: 'rose-silk',
    };
  } else if (lowerName.includes('shristy')) {
    theme = {
      bg: 'from-cyan-400 to-teal-600',
      bgColor: '#06b6d4',
      type: 'friendly',
    };
  } else if (lowerName.includes('sarth')) {
    theme = {
      bg: 'from-red-500 to-rose-600',
      bgColor: '#ef4444',
      type: 'classic-smile',
    };
  } else if (avatarColor) {
    if (avatarColor.toLowerCase() === '#f4aebe') {
      theme = { bg: 'from-[#F4AEBE] to-[#e895a9]', bgColor: '#F4AEBE', type: 'rose-silk' };
    } else if (avatarColor.toLowerCase() === '#03153d') {
      theme = { bg: 'from-[#03153D] to-[#072468]', bgColor: '#03153D', type: 'blue-velvet' };
    } else {
      theme = {
        bg: '',
        bgColor: avatarColor,
        type: 'classic-smile',
      };
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-sm text-[10px]',
    md: 'w-10 h-10 rounded-md text-xs',
    lg: 'w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-md sm:rounded-lg',
    xl: 'w-32 h-32 sm:w-40 sm:h-40 rounded-lg',
  }[size];

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center select-none shadow-md ${sizeClasses} ${
        !isCustomImage && theme.bg ? `bg-gradient-to-br ${theme.bg}` : ''
      } ${className}`}
      style={!isCustomImage && !theme.bg && theme.bgColor ? { backgroundColor: theme.bgColor } : {}}
    >
      {isCustomImage ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : theme.type === 'cyclops' ? (
        // Green 3-eyed monster face (Netflix original)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="34" cy="40" r="14" fill="#ffffff" />
          <circle cx="37" cy="40" r="6" fill="#1e293b" />
          <circle cx="35" cy="38" r="2.5" fill="#ffffff" />
          <circle cx="68" cy="48" r="16" fill="#ffffff" />
          <circle cx="68" cy="48" r="7" fill="#1e293b" />
          <circle cx="66" cy="46" r="3" fill="#ffffff" />
          <circle cx="24" cy="58" r="11" fill="#ffffff" />
          <circle cx="25" cy="58" r="5" fill="#1e293b" />
          <circle cx="23" cy="56" r="2" fill="#ffffff" />
          <path
            d="M 44 76 Q 58 84 72 70"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <polygon points="56,79 61,79 58,85" fill="#ffffff" />
        </svg>
      ) : theme.type === 'blue-velvet' ? (
        // Blue Velvet & Rose Silk luxury face (Deep midnight with Rose Silk eyes and smile)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="34" cy="46" r="6" fill="#F4AEBE" />
          <circle cx="66" cy="46" r="6" fill="#F4AEBE" />
          {/* Elegant curved Rose Silk smile */}
          <path
            d="M 40 68 Q 50 82 60 68"
            fill="none"
            stroke="#F4AEBE"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="36" cy="44" r="2" fill="#ffffff" />
          <circle cx="68" cy="44" r="2" fill="#ffffff" />
        </svg>
      ) : theme.type === 'rose-silk' ? (
        // Rose Silk face with deep Blue Velvet eyes and smile
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="34" cy="46" r="6" fill="#03153D" />
          <circle cx="66" cy="46" r="6" fill="#03153D" />
          <path
            d="M 40 68 Q 50 82 60 68"
            fill="none"
            stroke="#03153D"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="36" cy="44" r="2" fill="#ffffff" />
          <circle cx="68" cy="44" r="2" fill="#ffffff" />
        </svg>
      ) : theme.type === 'warm-smile' ? (
        // Yellow Netflix smiley
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="46" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="46" r="5.5" fill="#ffffff" />
          <path
            d="M 42 66 Q 54 80 72 64"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'cool-smirk' ? (
        // Slate-cyan cool smirk
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="48" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="48" r="5.5" fill="#ffffff" />
          <path
            d="M 44 68 Q 58 78 72 66"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'joyful' ? (
        // Purple joyful curved eyes & open smile
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <path
            d="M 28 48 Q 36 38 44 48"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 56 48 Q 64 38 72 48"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 36 66 Q 50 82 64 66"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'friendly' ? (
        // Friendly turquoise face with wink
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="34" cy="46" r="5.5" fill="#ffffff" />
          <path
            d="M 60 48 Q 67 42 74 48"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 38 68 Q 50 78 62 68"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Classic Netflix red smile
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="46" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="46" r="5.5" fill="#ffffff" />
          <path
            d="M 44 66 Q 56 78 72 64"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Tiny subtle shine highlight in top corner */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
