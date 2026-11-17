'use client';

import React, { useState } from 'react';
import { ActionItem, KeyResult, Objective, Profile, Venture } from '@/lib/types';

interface MobileTrackerFeedProps {
  member: Profile;
  ventures: Venture[];
  objectives: Objective[];
  keyResults: KeyResult[];
  actionItems: ActionItem[];
  onAddObjective: (ventureId?: string) => void;
  onAddKR: (objectiveId: string) => void;
  onAddTask: (ventureId?: string, objectiveId?: string) => void;
  onImportExcel: () => void;
}

export function InstaMobileFeed({
  member,
  ventures,
  objectives,
  keyResults,
  actionItems,
  onAddObjective,
  onAddKR,
  onAddTask,
}: MobileTrackerFeedProps) {
  const [sheetMode, setSheetMode] = useState<'objectives' | 'krs' | 'tasks' | 'ventures'>('objectives');
  const [selectedVentureId, setSelectedVentureId] = useState<string>('all');

  const filteredObjs = objectives.filter(
    (o) => selectedVentureId === 'all' || o.venture_id === selectedVentureId
  );
  const filteredKrs = keyResults.filter(
    (k) => selectedVentureId === 'all' || k.venture_id === selectedVentureId
  );
  const filteredActs = actionItems.filter(
    (a) => !a.is_planned && (selectedVentureId === 'all' || a.venture_id === selectedVentureId)
  );

  return (
    <div className="md:hidden pb-20">
      {/* Clean Mobile Operator & Action Header (No Story Rings, No 7 Sheets Button) */}
      <div className="p-3.5 border-b border-[#FFF7E6]/15 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-xs font-bold uppercase tracking-widest">
              {member.full_name} • {member.lead_title}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAddObjective()}
              className="px-2.5 py-1.5 rounded-lg border border-[#FFF7E6]/35 text-[10px] font-bold uppercase tracking-wider"
            >
              + Objective
            </button>
            <button
              onClick={() => onAddTask()}
              className="px-2.5 py-1.5 rounded-lg bg-[#FFF7E6] text-[#0A122A] text-[10px] font-bold uppercase tracking-wider"
            >
              + Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#FFF7E6]/10 text-center">
          {[
            { id: 'objectives', label: `Objectives (${objectives.length})` },
            { id: 'krs', label: `Key Results (${keyResults.length})` },
            { id: 'tasks', label: `Daily Tasks (${filteredActs.length})` },
            { id: 'ventures', label: `Ventures (${ventures.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSheetMode(tab.id as any)}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                sheetMode === tab.id ? 'bg-[#FFF7E6] text-[#0A122A]' : 'opacity-70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {sheetMode === 'ventures' && (
        <div className="p-3 space-y-2.5">
          {ventures.map((v) => {
            const vObjs = objectives.filter((o) => o.venture_id === v.id);
            return (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVentureId(v.id);
                  setSheetMode('objectives');
                }}
                className="liquid-card p-3.5 flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-display font-bold uppercase">{v.name}</span>
                <span className="text-xs font-bold">{vObjs.length} Objectives</span>
              </div>
            );
          })}
        </div>
      )}

      {sheetMode === 'objectives' && (
        <div className="p-3 space-y-3">
          {filteredObjs.map((o) => {
            const v = ventures.find((x) => x.id === o.venture_id);
            const oKrs = keyResults.filter((k) => k.objective_id === o.id);
            const doneKrs = oKrs.filter((k) => k.status === 'completed').length;
            const pct = oKrs.length ? Math.round((doneKrs / oKrs.length) * 100) : o.status === 'completed' ? 100 : 0;

            return (
              <article key={o.id} className="liquid-card overflow-hidden shadow">
                <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-[#FFF7E6]/10">
                  <span className="text-xs font-display font-bold uppercase">{v?.name}</span>
                  <span className="text-[10px] font-bold">#{o.sl_no}</span>
                </div>
                <div className="p-3.5 space-y-3">
                  <p className="text-sm font-bold leading-relaxed">{o.title}</p>
                  <div className="p-2.5 rounded-lg border border-[#FFF7E6]/15">
                    <div className="flex justify-between text-xs mb-1">
                      <span>KR Progress: {doneKrs}/{oKrs.length} KRs</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#FFF7E6]/15 overflow-hidden">
                      <div className="h-full bg-[#FFF7E6]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-2.5 border-t border-[#FFF7E6]/10 flex justify-between">
                  <button onClick={() => onAddKR(o.id)} className="px-2.5 py-1 rounded border border-[#FFF7E6]/30 text-xs font-bold">
                    + KR
                  </button>
                  <button
                    onClick={() => onAddTask(o.venture_id, o.id)}
                    className="px-3 py-1 rounded bg-[#FFF7E6] text-[#0A122A] text-xs font-bold"
                  >
                    + Task
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {sheetMode === 'krs' && (
        <div className="p-3 space-y-3">
          {filteredKrs.map((kr) => (
            <article key={kr.id} className="liquid-card p-4 space-y-2">
              <div className="text-xs font-bold">KR {kr.kr_code}</div>
              <p className="text-sm font-bold">{kr.title}</p>
            </article>
          ))}
        </div>
      )}

      {sheetMode === 'tasks' && (
        <div className="p-3 space-y-3">
          {filteredActs.map((a) => (
            <article key={a.id} className="liquid-card p-4 space-y-2">
              <div className="text-xs opacity-75">{a.date}</div>
              <p className="text-sm font-bold">{a.title}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
