'use client';

import React, { useEffect, useState } from 'react';
import { getPlannedItems } from '@/app/actions/plan-actions';
import { getWorkData } from '@/app/actions/work-actions';
import { NextPlansBoard } from '@/components/next-plans/NextPlansBoard';
import { Loader2 } from 'lucide-react';

export default function NextPlansPage() {
  const [plannedItems, setPlannedItems] = useState<any[]>([]);
  const [ventures, setVentures] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [items, workData] = await Promise.all([getPlannedItems(), getWorkData()]);
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
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading forward plans and future milestones...</p>
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
