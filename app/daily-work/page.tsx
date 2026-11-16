'use client';

import React, { useEffect, useState } from 'react';
import { getWorkData } from '@/app/actions/work-actions';
import { DailyWorkContainer } from '@/components/daily-work/DailyWorkContainer';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileGate } from '@/components/auth/ProfileGate';
import { Loader2 } from 'lucide-react';

export default function DailyWorkPage() {
  return (
    <ProfileGate>
      <DailyWorkContent />
    </ProfileGate>
  );
}

function DailyWorkContent() {
  const { activeProfile, impersonatedMember, effectiveProfile } = useActiveProfile();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeProfile) return;
    try {
      const res = await getWorkData(activeProfile.id, impersonatedMember?.id);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProfile) {
      loadData();
    }
  }, [activeProfile?.id, impersonatedMember?.id, effectiveProfile?.id]);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-zinc-400 animate-spin" />
        <p className="text-xs text-zinc-500 font-mono">Loading operations and OKR hierarchy...</p>
      </div>
    );
  }

  return <DailyWorkContainer key={effectiveProfile?.id} initialData={data} onRefresh={loadData} />;
}
