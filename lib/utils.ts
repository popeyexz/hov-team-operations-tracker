import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VentureHealth } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format any date string or Date object strictly as DD-MM-YYYY
 */
export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  
  try {
    let d: Date;
    if (typeof dateInput === 'string') {
      // If already in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
        return dateInput;
      }
      // If YYYY-MM-DD
      const parts = dateInput.split('T')[0].split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
      d = new Date(dateInput);
    } else {
      d = dateInput;
    }

    if (isNaN(d.getTime())) return '—';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '—';
  }
}

/**
 * Convert DD-MM-YYYY string to standard YYYY-MM-DD for database storage
 */
export function toISODateString(ddmmyyyy: string | null | undefined): string | null {
  if (!ddmmyyyy) return null;
  const match = ddmmyyyy.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(ddmmyyyy)) return ddmmyyyy;
    return null;
  }
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is past due
 */
export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const iso = toISODateString(dateStr) || dateStr.split('T')[0];
  const target = new Date(iso + 'T23:59:59');
  const now = new Date();
  return target.getTime() < now.getTime();
}

/**
 * Check if a date is within next 7 days
 */
export function isDueWithin7Days(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const iso = toISODateString(dateStr) || dateStr.split('T')[0];
  const target = new Date(iso + 'T23:59:59');
  const now = new Date();
  const diffDays = (target.getTime() - now.getTime()) / (1000 * 3600 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

/**
 * Calculate Venture Health:
 * 🔴 Red: Contains any blocker or overdue item
 * 🟡 Amber: Contains items due within 7 days or on-hold
 * 🟢 Green: On track
 */
export function calculateVentureHealth(params: {
  hasBlocker: boolean;
  hasOverdue: boolean;
  hasDueSoon: boolean;
  hasOnHold: boolean;
}): VentureHealth {
  if (params.hasBlocker || params.hasOverdue) {
    return 'red';
  }
  if (params.hasDueSoon || params.hasOnHold) {
    return 'amber';
  }
  return 'green';
}

export function getHealthBadge(health: VentureHealth) {
  switch (health) {
    case 'red':
      return {
        label: 'Red',
        dotClass: 'bg-red-500 shadow-red-500/50',
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
      };
    case 'amber':
      return {
        label: 'Amber',
        dotClass: 'bg-amber-400 shadow-amber-400/50',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'green':
    default:
      return {
        label: 'Green',
        dotClass: 'bg-emerald-400 shadow-emerald-400/50',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
  }
}
