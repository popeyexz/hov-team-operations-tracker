'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { importExcelWorkbookToSupabase, clearAllTrackerDataFromSupabase } from '@/app/actions/import-actions';
import { uploadVentureDocument } from '@/app/actions/document-actions';
import { Upload, Trash2, CheckCircle2, FileSpreadsheet, X, Loader2 } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  actorId?: string | null;
  defaultVentureId?: string;
  onSuccess: () => void;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  actorId,
  defaultVentureId,
  onSuccess,
}: ExcelImportModalProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [clearBeforeImport, setClearBeforeImport] = useState(true);

  if (!isOpen) return null;

  const formatExcelDate = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString().slice(0, 10);
    }
    const s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBusy(true);
    setStatusMsg(`Parsing "${file.name}" and syncing to Supabase...`);

    try {
      // 1. Upload raw .xlsx file to Supabase Storage (venture-documents bucket)
      if (defaultVentureId) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('ventureId', defaultVentureId);
        if (actorId) fd.append('uploadedBy', actorId);
        await uploadVentureDocument(fd);
      }

      // 2. Parse workbook sheets via SheetJS (Zero Fabrication)
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
      const sheetNames = wb.SheetNames || [];

      const objectives: any[] = [];
      const keyResults: any[] = [];
      const actionItems: any[] = [];

      const objSheet = sheetNames.find(
        (s) => s === 'Objectives by Ventures' || s.includes('Objectives') || s.includes('Work breakdown')
      );
      if (objSheet) {
        const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[objSheet], { header: 1, defval: null });
        const row0 = rows[0] || [];
        const row1 = rows[1] || [];
        const row2 = rows[2] || [];
        for (let c = 0; c < row0.length; c++) {
          const vName = row0[c] ? String(row0[c]).trim() : '';
          if (!vName || vName.toLowerCase() === 'grow me social') continue;
          const leadRaw = row1[c] ? String(row1[c]).trim() : '';
          const parts = leadRaw.split('-');
          const leadTitle = parts[0]?.trim() || 'Venture Lead';
          const leadSlug = parts[1]?.trim().toLowerCase() || 'atharav';
          const is7Col = String(row2[c + 3] || '').toLowerCase().includes('kr');

          for (let r = 3; r < rows.length; r++) {
            const rData = rows[r] || [];
            const sl = parseInt(rData[c], 10);
            const title = rData[c + 1] ? String(rData[c + 1]).trim() : '';
            if (isNaN(sl) || !title) continue;
            objectives.push({
              venture_name: vName,
              venture_code: vName.slice(0, 6).toUpperCase(),
              lead_slug: leadSlug,
              lead_title: leadTitle,
              sl_no: sl,
              title,
              status: 'no_krs',
              owner_name: (is7Col ? rData[c + 4] : rData[c + 3]) ? String(is7Col ? rData[c + 4] : rData[c + 3]).trim() : '',
              due_date: is7Col ? formatExcelDate(rData[c + 5]) : null,
              comments: is7Col && rData[c + 6] ? String(rData[c + 6]).trim() : '',
            });
          }
        }
      }

      if (sheetNames.includes('Key Results by Ventures')) {
        const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['Key Results by Ventures'], { header: 1, defval: null });
        const row0 = rows[0] || [];
        for (let c = 0; c < row0.length; c++) {
          const vName = row0[c] ? String(row0[c]).trim() : '';
          if (!vName) continue;
          for (let r = 3; r < rows.length; r++) {
            const rData = rows[r] || [];
            const codeStr = rData[c] ? String(rData[c]).trim() : '';
            const krTitle = rData[c + 1] ? String(rData[c + 1]).trim() : '';
            if (!codeStr.includes('.') || !krTitle) continue;
            keyResults.push({
              venture_name: vName,
              parent_sl_no: parseInt(codeStr.split('.')[0], 10),
              kr_code: codeStr,
              title: krTitle,
              target_measure: rData[c + 2] ? String(rData[c + 2]).trim() : '',
              status: 'pending',
              owner_name: rData[c + 4] ? String(rData[c + 4]).trim() : '',
              due_date: formatExcelDate(rData[c + 5]),
              comments: rData[c + 6] ? String(rData[c + 6]).trim() : '',
            });
          }
        }
      }

      if (sheetNames.includes('Team Action Plan')) {
        const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['Team Action Plan'], { header: 1, defval: null });
        const row0 = rows[0] || [];
        for (let c = 0; c < row0.length; c++) {
          const memName = row0[c] ? String(row0[c]).trim() : '';
          if (!memName || memName.includes('spare')) continue;
          for (let r = 3; r < rows.length; r++) {
            const rData = rows[r] || [];
            const actTitle = rData[c + 2] ? String(rData[c + 2]).trim() : '';
            if (!actTitle) continue;
            actionItems.push({
              venture_name: rData[c + 1] ? String(rData[c + 1]).trim() : 'PS.HOV',
              member_name: memName,
              title: actTitle,
              date: formatExcelDate(rData[c]),
              status: 'in_progress',
              comments: rData[c + 6] ? String(rData[c + 6]).trim() : '',
            });
          }
        }
      }

      const res = await importExcelWorkbookToSupabase({
        fileName: file.name,
        fileSize: file.size,
        actorId,
        clearExisting: clearBeforeImport,
        objectives,
        keyResults,
        actionItems,
      });

      if (!res.success) {
        setStatusMsg(`Error: ${res.error}`);
      } else {
        setStatusMsg(
          `Imported ${res.counts?.objectives} Objectives, ${res.counts?.keyResults} KRs, and ${res.counts?.actionItems} Tasks into Supabase!`
        );
        onSuccess();
      }
    } catch (err: any) {
      setStatusMsg(`Import failed: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleWipeAll = async () => {
    setIsBusy(true);
    setStatusMsg('Wiping all objectives, KRs, and tasks from Supabase...');
    const res = await clearAllTrackerDataFromSupabase();
    setIsBusy(false);
    if (res.success) {
      setStatusMsg('All tasks, KRs, and objectives removed (0 rows).');
      onSuccess();
    } else {
      setStatusMsg(`Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="liquid-card !rounded-3xl p-6 max-w-lg w-full border border-[#F4AEBE]/40 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#F4AEBE]" />
            <h3 className="text-lg font-bold font-display">Import Excel Sheet (.xlsx) to Supabase</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Select your <code>.xlsx</code> workbook. The file is uploaded to Supabase Storage (<code>venture-documents</code>) and its exact Objectives, Key Results, and Action Items are stored in Supabase PostgreSQL with <strong>zero fabricated tasks</strong>.
        </p>

        <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={clearBeforeImport}
            onChange={(e) => setClearBeforeImport(e.target.checked)}
            className="rounded border-white/20"
          />
          <span>Replace existing Objectives, KRs & Tasks on import</span>
        </label>

        <div className="p-6 rounded-2xl border-2 border-dashed border-[#F4AEBE]/40 bg-white/[0.02] text-center">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4AEBE] text-[#03153D] font-mono text-xs font-extrabold cursor-pointer shadow-lg">
            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isBusy ? 'Syncing to Supabase...' : 'Choose .xlsx File to Import'}</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" disabled={isBusy} />
          </label>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#F4AEBE]">
            {statusMsg}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handleWipeAll}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-mono text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data (0 Rows)</span>
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-xs font-mono cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
