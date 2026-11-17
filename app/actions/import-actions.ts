'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface ParsedExcelPayload {
  fileName: string;
  fileSize?: number;
  actorId?: string | null;
  clearExisting?: boolean;
  ventures?: {
    name: string;
    code: string;
    lead_slug: string;
    lead_title: string;
    display_order: number;
  }[];
  objectives: {
    venture_name: string;
    venture_code: string;
    lead_slug: string;
    lead_title: string;
    sl_no: number;
    title: string;
    status: string;
    owner_name: string;
    due_date: string | null;
    comments: string;
  }[];
  keyResults: {
    venture_name: string;
    parent_sl_no: number;
    kr_code: string;
    title: string;
    target_measure: string;
    status: string;
    owner_name: string;
    due_date: string | null;
    comments: string;
  }[];
  actionItems: {
    venture_name: string;
    member_name: string;
    title: string;
    date: string | null;
    status: string;
    comments: string;
  }[];
}

export async function importExcelWorkbookToSupabase(payload: ParsedExcelPayload) {
  try {
    if (payload.clearExisting) {
      await supabaseAdmin.from('action_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('key_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('objectives').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, slug, full_name');
    const profileByName: Record<string, string> = {};
    (profiles || []).forEach((p) => {
      profileByName[p.full_name.trim().toLowerCase()] = p.id;
      profileByName[p.slug.trim().toLowerCase()] = p.id;
    });
    profileByName['atharva'] = profileByName['atharav'];
    profileByName['athrava'] = profileByName['atharav'];

    // Discover & Upsert Ventures from Excel so ventures are stored directly in Supabase on import
    const discoveredVenturesMap = new Map<string, { name: string; code: string; lead_id: string | null; lead_title: string; display_order: number }>();
    let orderIdx = 1;
    for (const o of payload.objectives) {
      const vKey = o.venture_name.trim().toLowerCase();
      if (!discoveredVenturesMap.has(vKey)) {
        const leadId = profileByName[(o.lead_slug || '').trim().toLowerCase()] || null;
        discoveredVenturesMap.set(vKey, {
          name: o.venture_name.trim(),
          code: o.venture_code || o.venture_name.trim().slice(0, 6).toUpperCase(),
          lead_id: leadId,
          lead_title: o.lead_title || 'Venture Lead',
          display_order: orderIdx++,
        });
      }
    }

    if (discoveredVenturesMap.size > 0) {
      await supabaseAdmin
        .from('ventures')
        .upsert(Array.from(discoveredVenturesMap.values()), { onConflict: 'name' });
    }

    const { data: ventures } = await supabaseAdmin.from('ventures').select('id, name, code, lead_id');
    const ventureByName: Record<string, { id: string; lead_id: string | null }> = {};
    (ventures || []).forEach((v) => {
      ventureByName[v.name.trim().toLowerCase()] = { id: v.id, lead_id: v.lead_id };
      ventureByName[v.code.trim().toLowerCase()] = { id: v.id, lead_id: v.lead_id };
    });

    // 1. Insert Objectives
    const objRowsToInsert = [];
    for (const o of payload.objectives) {
      const vRef = ventureByName[o.venture_name.trim().toLowerCase()];
      if (!vRef) continue;
      const ownerKey = (o.owner_name || '').trim().toLowerCase();
      const resolvedOwnerId = ownerKey && profileByName[ownerKey] ? profileByName[ownerKey] : vRef.lead_id;
      objRowsToInsert.push({
        venture_id: vRef.id,
        sl_no: o.sl_no,
        title: o.title,
        status: o.status || 'no_krs',
        owner_id: resolvedOwnerId,
        due_date: o.due_date || null,
        comments: o.comments || '',
      });
    }

    let insertedObjectives: any[] = [];
    if (objRowsToInsert.length > 0) {
      const { data: insObjs, error: objErr } = await supabaseAdmin
        .from('objectives')
        .insert(objRowsToInsert)
        .select('id, venture_id, sl_no');
      if (objErr) return { success: false, error: objErr.message };
      insertedObjectives = insObjs || [];
    }

    // 2. Insert Key Results
    const krRowsToInsert = [];
    for (const k of payload.keyResults) {
      const vRef = ventureByName[k.venture_name.trim().toLowerCase()];
      if (!vRef) continue;
      const parentObj = insertedObjectives.find(
        (io) => io.venture_id === vRef.id && io.sl_no === k.parent_sl_no
      );
      if (!parentObj) continue;
      const ownerKey = (k.owner_name || '').trim().toLowerCase();
      const resolvedOwnerId = ownerKey && profileByName[ownerKey] ? profileByName[ownerKey] : vRef.lead_id;
      krRowsToInsert.push({
        objective_id: parentObj.id,
        venture_id: vRef.id,
        kr_code: k.kr_code,
        title: k.title,
        target_measure: k.target_measure || '',
        status: k.status || 'pending',
        owner_id: resolvedOwnerId,
        due_date: k.due_date || null,
        comments: k.comments || '',
      });
    }

    if (krRowsToInsert.length > 0) {
      const { error: krErr } = await supabaseAdmin.from('key_results').insert(krRowsToInsert);
      if (krErr) return { success: false, error: krErr.message };
    }

    // 3. Insert Action Items
    const actRowsToInsert = [];
    for (const a of payload.actionItems) {
      const vRef =
        ventureByName[(a.venture_name || '').trim().toLowerCase()] ||
        Object.values(ventureByName)[0];
      if (!vRef) continue;
      const memKey = (a.member_name || '').trim().toLowerCase();
      const assignedId = memKey && profileByName[memKey] ? profileByName[memKey] : null;
      actRowsToInsert.push({
        venture_id: vRef.id,
        title: a.title,
        assigned_to: assignedId,
        date: a.date || null,
        status: a.status || 'in_progress',
        is_planned: false,
        comments: a.comments || '',
      });
    }

    if (actRowsToInsert.length > 0) {
      const { error: actErr } = await supabaseAdmin.from('action_items').insert(actRowsToInsert);
      if (actErr) return { success: false, error: actErr.message };
    }

    revalidatePath('/');
    revalidatePath('/daily-work');
    revalidatePath('/next-plans');
    revalidatePath('/progress');
    revalidatePath('/all-tabs');

    return {
      success: true,
      counts: {
        ventures: discoveredVenturesMap.size,
        objectives: objRowsToInsert.length,
        keyResults: krRowsToInsert.length,
        actionItems: actRowsToInsert.length,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Excel import failed' };
  }
}

export async function clearAllTrackerDataFromSupabase() {
  try {
    await supabaseAdmin.from('action_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('key_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('objectives').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('ventures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    revalidatePath('/');
    revalidatePath('/daily-work');
    revalidatePath('/next-plans');
    revalidatePath('/progress');
    revalidatePath('/all-tabs');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
