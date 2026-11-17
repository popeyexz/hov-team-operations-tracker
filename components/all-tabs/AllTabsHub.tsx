'use client';

import React, { useState } from 'react';
import { EXCEL_SEED_DATA } from '@/lib/data/excel-seed-data';
import { Layers, BookOpen, CheckCircle2, ArrowRight, Download, Sparkles, Shield, Target } from 'lucide-react';

export function AllTabsHub() {
  const [subTab, setSubTab] = useState<'guide' | 'objectives' | 'krs' | 'actions' | 'lists'>('guide');
  const [ventureFilter, setVentureFilter] = useState<string>('all');

  const ventures = EXCEL_SEED_DATA.ventures;
  const profiles = EXCEL_SEED_DATA.profiles;
  const objectives = EXCEL_SEED_DATA.objectives.filter(
    (o) => ventureFilter === 'all' || o.venture_id === ventureFilter
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="liquid-card !rounded-3xl p-6 border border-[#F4AEBE]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F4AEBE]/20 text-[#F4AEBE] font-bold">
              TAB 04 • ALL TABS & OPERATING GUIDE
            </span>
            <h1 className="text-2xl font-bold text-white font-display mt-1">
              Master Workbook Explorer & Team Operating Guide
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              Built directly from <strong>PS.HOV_Work_Tracker.xlsx</strong> so every team member and the Founder can see how Objectives, Key Results, Cross-Venture Tasks, and Analytics connect.
            </p>
          </div>
          <a
            href="/PS.HOV_Work_Tracker.xlsx"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4AEBE] text-[#03153D] font-mono text-xs font-extrabold shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download Embedded Excel (.xlsx)</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          {[
            { id: 'guide', label: '📖 How It Works (Visual Guide)' },
            { id: 'objectives', label: '1. Objectives by Ventures (73)' },
            { id: 'krs', label: '2. Key Results (1.1–1.5)' },
            { id: 'actions', label: '3. Team Action Plan & Next Plans' },
            { id: 'lists', label: '4. Master Lists (13 Ventures & 7 Members)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                subTab === t.id
                  ? 'bg-[#F4AEBE] text-[#03153D] font-bold'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="liquid-card p-5 border-t-4 border-t-[#F4AEBE]">
            <div className="text-xs font-mono font-bold text-[#F4AEBE] mb-1">STEP 01 • NETFLIX PROFILE LOGIN</div>
            <h3 className="text-sm font-bold text-white mb-2">Click Your Profile Avatar</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Each of the 7 operators (Pratap, Sharuk, Atharav, Rufus, Shristy, Sarth, Rohini) clicks their profile to enter their tailored workspace with zero passwords.
            </p>
          </div>
          <div className="liquid-card p-5 border-t-4 border-t-indigo-400">
            <div className="text-xs font-mono font-bold text-indigo-300 mb-1">STEP 02 • DUAL TASK VISIBILITY</div>
            <h3 className="text-sm font-bold text-white mb-2">Led Ventures + Cross-Venture Tasks</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              In Tab 1, you immediately see <strong>(A) Ventures You Lead</strong> (all objectives under your ventures) AND <strong>(B) Tasks Assigned to You from Other Ventures</strong>.
            </p>
          </div>
          <div className="liquid-card p-5 border-t-4 border-t-amber-400">
            <div className="text-xs font-mono font-bold text-amber-300 mb-1">STEP 03 • OKR → DAILY TASK FLOW</div>
            <h3 className="text-sm font-bold text-white mb-2">Objective → KR (1.1) → Action Item</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Every Objective from the Excel sheet breaks down into measurable Key Results (1.1, 1.2) and Daily Action Items with strict DD-MM-YYYY dates.
            </p>
          </div>
          <div className="liquid-card p-5 border-t-4 border-t-emerald-400">
            <div className="text-xs font-mono font-bold text-emerald-300 mb-1">STEP 04 • 2-STAGE FOUNDER REVIEW</div>
            <h3 className="text-sm font-bold text-white mb-2">Submit Outcome → Founder Confirm</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Members submit their Outcome Achieved (Submitted for Review). Founder (Pratap) approves as Completed or requests changes (Needs Work).
            </p>
          </div>
        </div>
      )}

      {subTab === 'objectives' && (
        <div className="liquid-card p-5 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-white">All 73 Seeded Objectives from PS.HOV_Work_Tracker.xlsx</h3>
            <select
              value={ventureFilter}
              onChange={(e) => setVentureFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#020B20] border border-white/15 text-xs font-mono text-white"
            >
              <option value="all">All 13 Ventures (73 Objectives)</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>{v.code} — {v.name}</option>
              ))}
            </select>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/15 font-mono text-[10px] uppercase text-zinc-400">
                <th className="py-2 px-2">Venture</th>
                <th className="py-2 px-2">Sl No</th>
                <th className="py-2 px-2">Objective</th>
                <th className="py-2 px-2">Owner</th>
                <th className="py-2 px-2">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {objectives.map((o) => {
                const v = ventures.find((x) => x.id === o.venture_id);
                const owner = profiles.find((p) => p.id === o.owner_id);
                return (
                  <tr key={o.id}>
                    <td className="py-2 px-2 font-mono font-bold text-[#F4AEBE]">{v?.code}</td>
                    <td className="py-2 px-2 font-mono">#{o.sl_no}</td>
                    <td className="py-2 px-2 text-white">{o.title}</td>
                    <td className="py-2 px-2 font-mono text-zinc-300">{owner?.full_name || o.excel_owner || 'Lead'}</td>
                    <td className="py-2 px-2 font-mono text-zinc-400">{o.due_date || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'krs' && (
        <div className="liquid-card p-5 overflow-x-auto">
          <h3 className="text-base font-bold text-white mb-4">Seeded Key Results Across Ventures</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/15 font-mono text-[10px] uppercase text-zinc-400">
                <th className="py-2 px-2">KR Code</th>
                <th className="py-2 px-2">Key Result</th>
                <th className="py-2 px-2">Target</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {EXCEL_SEED_DATA.keyResults.map((kr) => (
                <tr key={kr.id}>
                  <td className="py-2 px-2 font-mono text-cyan-300">{kr.kr_code}</td>
                  <td className="py-2 px-2 text-white">{kr.title}</td>
                  <td className="py-2 px-2 font-mono text-zinc-300">{kr.target_measure}</td>
                  <td className="py-2 px-2 font-mono uppercase text-[#F4AEBE]">{kr.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'actions' && (
        <div className="liquid-card p-5 overflow-x-auto">
          <h3 className="text-base font-bold text-white mb-4">Daily Action Items & Forward Plans</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/15 font-mono text-[10px] uppercase text-zinc-400">
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Action Item</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {EXCEL_SEED_DATA.actionItems.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 px-2 font-mono text-zinc-300">{a.date}</td>
                  <td className="py-2 px-2 text-white">{a.title}</td>
                  <td className="py-2 px-2 font-mono">{a.is_planned ? 'Next Plan (Tab 2)' : 'Daily Work (Tab 1)'}</td>
                  <td className="py-2 px-2 font-mono text-[#F4AEBE]">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'lists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="liquid-card p-5">
            <h3 className="text-base font-bold text-white mb-3">7 Core Operators</h3>
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between text-xs">
                  <span className="font-bold text-white">{p.full_name}</span>
                  <span className="font-mono text-[#F4AEBE]">{p.lead_title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="liquid-card p-5">
            <h3 className="text-base font-bold text-white mb-3">13 Core Ventures</h3>
            <div className="space-y-2">
              {ventures.map((v) => (
                <div key={v.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between text-xs">
                  <span className="font-bold text-white">{v.code} — {v.name}</span>
                  <span className="font-mono text-zinc-300">{v.description.split('•')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
