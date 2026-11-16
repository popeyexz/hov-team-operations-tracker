'use client';

import React, { useEffect, useState } from 'react';
import { getPlannedItems } from '@/app/actions/plan-actions';
import { getWorkData } from '@/app/actions/work-actions';
import { NextPlansBoard } from '@/components/next-plans/NextPlansBoard';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileGate } from '@/components/auth/ProfileGate';
import { Loader2 } from 'lucide-react';

export default function NextPlansPage() {
  return (
    <ProfileGate>
      <NextPlansContent />
    </ProfileGate>
  );
}

function NextPlansContent() {
  const { activeProfile, effectiveProfile } = useActiveProfile();
  const [plannedItems, setPlannedItems] = useState<any[]>([]);
  const [ventures, setVentures] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeProfile) return;
    try {
      const [items, workData] = await Promise.all([
        getPlannedItems(),
        getWorkData(activeProfile.id, effectiveProfile?.id),
      ]);
      setPlannedItems(items);
      setVentures(workData.ventures);
      setProfiles(workData.profiles);
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
  }, [activeProfile?.id, effectiveProfile?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-zinc-400 animate-spin" />
        <p className="text-xs text-zinc-500 font-mono">Loading forward plans and future milestones...</p>
      </div>
    );
  }

  return (
    <NextPlansBoard
      plannedItems={plannedItems}
      ventures={ventures}
      profiles={profiles}
      onRefresh={loadData}
    />
  );
}
