'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDateDDMMYYYY, toISODateString } from '@/lib/utils';

interface DatePickerDDMMYYYYProps {
  value: string; // ISO YYYY-MM-DD or DD-MM-YYYY
  onChange: (isoValue: string) => void;
  label?: string;
  required?: boolean;
}

export function DatePickerDDMMYYYY({
  value,
  onChange,
  label = 'Due Date (DD-MM-YYYY)',
  required = false,
}: DatePickerDDMMYYYYProps) {
  // convert value to ISO for input[type=date]
  const isoVal = toISODateString(value) || '';
  const displayVal = formatDateDDMMYYYY(value);

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {displayVal !== '—' && (
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
              {displayVal}
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
        <input
          type="date"
          required={required}
          value={isoVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm font-mono text-slate-200 cursor-pointer"
        />
      </div>
    </div>
  );
}
