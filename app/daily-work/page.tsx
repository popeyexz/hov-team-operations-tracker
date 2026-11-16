'use client';

import React, { useEffect, useState } from 'react';
import { getWorkData } from '@/app/actions/work-actions';
import { DailyWorkContainer } from '@/components/daily-work/DailyWorkContainer';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { Loader2 } from 'lucide-react';

export default function DailyWorkPage() {
  const { activeProfile, effectiveProfile } = useActiveProfile();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getWorkData(activeProfile?.id, effectiveProfile?.id);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProfile?.id, effectiveProfile?.id]);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading daily operations and OKRs...</p>
      </div>
    );
  }

  return <DailyWorkContainer initialData={data} onRefresh={loadData} />;
}
