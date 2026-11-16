'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProfileGateProps {
  children: React.ReactNode;
}

export function ProfileGate({ children }: ProfileGateProps) {
  const { activeProfile, isLoading } = useActiveProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !activeProfile) {
      router.replace('/');
    }
  }, [isLoading, activeProfile, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
          <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            AUTHENTICATING SESSION
          </div>
          <div className="text-sm font-medium text-zinc-300">
            Checking operator credentials...
          </div>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
            OPERATOR CREDENTIAL REQUIRED
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
            Select Your Profile to Continue
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Direct access to portfolio operations requires an active operator credential. Redirecting to profile gateway...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
