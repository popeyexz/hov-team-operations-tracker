'use client';

import React from 'react';
import { ProfileGate } from '@/components/auth/ProfileGate';
import { AllTabsHub } from '@/components/all-tabs/AllTabsHub';

export default function AllTabsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <ProfileGate>
          <AllTabsHub />
        </ProfileGate>
      </main>
    </div>
  );
}
