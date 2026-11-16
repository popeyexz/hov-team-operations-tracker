'use client';

import React from 'react';

interface NetflixAvatarProps {
  name: string;
  role?: string;
  avatarColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Genuine Netflix-style vector avatars with iconic expressions and vibrant colorways.
 */
export function NetflixAvatar({
  name,
  role,
  avatarColor,
  size = 'lg',
  className = '',
}: NetflixAvatarProps) {
  const isFounder = role === 'founder' || name.toLowerCase().includes('pratap');
  const lowerName = name.toLowerCase();

  // Determine avatar face style and color scheme based on name or role
  let theme = {
    bg: 'from-red-600 to-rose-700',
    bgColor: '#e50914',
    type: 'classic-smile',
  };

  if (isFounder) {
    theme = {
      bg: 'from-amber-500 via-rose-600 to-red-700',
      bgColor: '#b91c1c',
      type: 'founder-crown',
    };
  } else if (lowerName.includes('rufus')) {
    // Green alien / 3-eyed character like Netflix kids/original (far left in ref image)
    theme = {
      bg: 'from-emerald-400 to-emerald-600',
      bgColor: '#10b981',
      type: 'cyclops',
    };
  } else if (lowerName.includes('atharav')) {
    // Warm sunny yellow / amber smiling face
    theme = {
      bg: 'from-amber-400 to-yellow-500',
      bgColor: '#f59e0b',
      type: 'warm-smile',
    };
  } else if (lowerName.includes('sharuk')) {
    // Deep slate-cyan gradient with cool smile
    theme = {
      bg: 'from-slate-700 via-cyan-900 to-zinc-900',
      bgColor: '#0f172a',
      type: 'cool-smirk',
    };
  } else if (lowerName.includes('rohini')) {
    // Vibrant magenta / violet with joyful eyes
    theme = {
      bg: 'from-purple-500 to-indigo-600',
      bgColor: '#8b5cf6',
      type: 'joyful',
    };
  } else if (lowerName.includes('shristy')) {
    // Electric cyan / turquoise
    theme = {
      bg: 'from-cyan-400 to-teal-600',
      bgColor: '#06b6d4',
      type: 'friendly',
    };
  } else if (lowerName.includes('sarth')) {
    // Bold crimson / red
    theme = {
      bg: 'from-red-500 to-rose-600',
      bgColor: '#ef4444',
      type: 'classic-smile',
    };
  } else if (avatarColor) {
    theme = {
      bg: '',
      bgColor: avatarColor,
      type: 'classic-smile',
    };
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
        theme.bg ? `bg-gradient-to-br ${theme.bg}` : ''
      } ${className}`}
      style={!theme.bg && theme.bgColor ? { backgroundColor: theme.bgColor } : {}}
    >
      {/* Dynamic SVG Character Faces */}
      {theme.type === 'cyclops' ? (
        // Green 3-eyed monster face (exact copy of left-most Netflix character)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          {/* Big eye 1 */}
          <circle cx="34" cy="40" r="14" fill="#ffffff" />
          <circle cx="37" cy="40" r="6" fill="#1e293b" />
          <circle cx="35" cy="38" r="2.5" fill="#ffffff" />
          {/* Big eye 2 */}
          <circle cx="68" cy="48" r="16" fill="#ffffff" />
          <circle cx="68" cy="48" r="7" fill="#1e293b" />
          <circle cx="66" cy="46" r="3" fill="#ffffff" />
          {/* Third eye on left bottom */}
          <circle cx="24" cy="58" r="11" fill="#ffffff" />
          <circle cx="25" cy="58" r="5" fill="#1e293b" />
          <circle cx="23" cy="56" r="2" fill="#ffffff" />
          {/* Cute crooked smile */}
          <path
            d="M 44 76 Q 58 84 72 70"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Little tooth */}
          <polygon points="56,79 61,79 58,85" fill="#ffffff" />
        </svg>
      ) : theme.type === 'founder-crown' ? (
        // Founder Crown & Iconic Smile
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          {/* Crown on top */}
          <path
            d="M 28 32 L 34 46 L 50 30 L 66 46 L 72 32 L 70 52 L 30 52 Z"
            fill="#facc15"
            stroke="#b45309"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="31" r="2.5" fill="#ffffff" />
          <circle cx="50" cy="29" r="3" fill="#ffffff" />
          <circle cx="72" cy="31" r="2.5" fill="#ffffff" />
          {/* Two happy dot eyes */}
          <circle cx="36" cy="62" r="4.5" fill="#ffffff" />
          <circle cx="64" cy="62" r="4.5" fill="#ffffff" />
          {/* Smooth curved smile */}
          <path
            d="M 40 76 Q 50 86 60 76"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'warm-smile' ? (
        // Yellow Netflix smiley (middle one in ref image)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="46" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="46" r="5.5" fill="#ffffff" />
          {/* Upward curved smooth smile */}
          <path
            d="M 42 66 Q 54 80 72 64"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'cool-smirk' ? (
        // Slate-cyan cool smirk (4th one in ref image)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="48" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="48" r="5.5" fill="#ffffff" />
          {/* Gentle curved grin */}
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
          {/* Happy squinting curved eyes */}
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
          {/* Big happy smile */}
          <path
            d="M 36 66 Q 50 82 64 66"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : theme.type === 'friendly' ? (
        // Friendly turquoise face with wink
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="34" cy="46" r="5.5" fill="#ffffff" />
          {/* Wink eye */}
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
        // Classic Netflix red smile (2nd one in ref image)
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <circle cx="32" cy="46" r="5.5" fill="#ffffff" />
          <circle cx="68" cy="46" r="5.5" fill="#ffffff" />
          {/* Sleek white smile */}
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
