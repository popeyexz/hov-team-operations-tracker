'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/app/actions/analytics-actions';
import { ProgressAnalyticsDashboard } from '@/components/progress/ProgressAnalyticsDashboard';
import { Loader2 } from 'lucide-react';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading portfolio analytics & venture scorecards...</p>
      </div>
    );
  }

  return <ProgressAnalyticsDashboard data={data} />;
}
