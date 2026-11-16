'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/app/actions/analytics-actions';
import { ProgressAnalyticsDashboard } from '@/components/progress/ProgressAnalyticsDashboard';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileGate } from '@/components/auth/ProfileGate';
import { Loader2 } from 'lucide-react';

export default function ProgressPage() {
  return (
    <ProfileGate>
      <ProgressContent />
    </ProfileGate>
  );
}

function ProgressContent() {
  const { activeProfile } = useActiveProfile();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeProfile) return;
    try {
      const res = await getAnalyticsData();
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
  }, [activeProfile?.id]);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
        </div>
        <p className="text-xs text-zinc-500 font-mono">Synthesizing portfolio metrics & venture scorecards...</p>
      </div>
    );
  }

  return <ProgressAnalyticsDashboard data={data} />;
}
