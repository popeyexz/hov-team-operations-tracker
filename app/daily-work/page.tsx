'use client';

import React, { useEffect, useState } from 'react';
import { getWorkData } from '@/app/actions/work-actions';
import { DailyWorkContainer } from '@/components/daily-work/DailyWorkContainer';
import { useActiveProfile } from '@/context/ActiveProfileContext';
import { ProfileGate } from '@/components/auth/ProfileGate';
import { EXCEL_SEED_DATA } from '@/lib/data/excel-seed-data';

export default function DailyWorkPage() {
  return (
    <ProfileGate>
      <DailyWorkContent />
    </ProfileGate>
  );
}

const defaultInitialData = {
  profiles: EXCEL_SEED_DATA.profiles as any,
  ventures: EXCEL_SEED_DATA.ventures as any,
  objectives: EXCEL_SEED_DATA.objectives as any,
  keyResults: EXCEL_SEED_DATA.keyResults as any,
  actionItems: EXCEL_SEED_DATA.actionItems as any,
  myVentureIds: EXCEL_SEED_DATA.ventures.map((v) => v.id),
  assignedFromOtherVentures: [],
  venturesLed: EXCEL_SEED_DATA.ventures as any,
};

function DailyWorkContent() {
  const { activeProfile, impersonatedMember, effectiveProfile } = useActiveProfile();
  const [data, setData] = useState<any>(defaultInitialData);

  const loadData = async () => {
    if (!activeProfile) return;
    try {
      const res = await getWorkData(activeProfile.id, impersonatedMember?.id);
      if (res && res.ventures) {
        setData(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeProfile) {
      loadData();
    }
  }, [activeProfile?.id, impersonatedMember?.id, effectiveProfile?.id]);

  return <DailyWorkContainer key={effectiveProfile?.id} initialData={data} onRefresh={loadData} />;
}
