'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer border shadow-sm min-h-[40px] min-w-[40px] justify-center ${
        theme === 'dark'
          ? 'bg-[#071D49] hover:bg-[#0c2a68] border-[#F4AEBE]/30 text-[#F4AEBE] hover:text-white'
          : 'bg-[#F4AEBE]/25 hover:bg-[#F4AEBE]/40 border-[#03153D]/15 text-[#03153D]'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#F4AEBE] transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#03153D] transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-mono font-medium">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
