'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ActionItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getPlannedItems(): Promise<ActionItem[]> {
  const { data, error } = await supabaseAdmin
    .from('action_items')
    .select('*, assignee:assigned_to(*), venture:venture_id(*), objective:objective_id(*), key_result:key_result_id(*)')
    .eq('is_planned', true)
    .order('date', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching planned items:', error);
    return [];
  }
  return data as ActionItem[];
}

export async function createPlannedItem(params: {
  ventureId: string;
  objectiveId?: string | null;
  title: string;
  assignedTo?: string | null;
  targetDate?: string | null;
  comments?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('action_items')
    .insert({
      venture_id: params.ventureId,
      objective_id: params.objectiveId || null,
      title: params.title.trim(),
      assigned_to: params.assignedTo || null,
      date: params.targetDate || null,
      status: 'not_started',
      is_planned: true,
      comments: params.comments?.trim() || '',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await supabaseAdmin.from('task_activity_log').insert({
    action_item_id: data.id,
    actor_id: params.assignedTo || null,
    action: 'created',
    content: `Scheduled forward initiative: "${params.title}"`,
  });

  revalidatePath('/next-plans');
  revalidatePath('/daily-work');
  return { success: true, item: data };
}

export async function promotePlanToDailyWork(actionItemId: string, promoterId?: string) {
  const { data: item, error: fetchErr } = await supabaseAdmin
    .from('action_items')
    .select('*')
    .eq('id', actionItemId)
    .single();

  if (fetchErr || !item) {
    return { success: false, error: fetchErr?.message || 'Item not found' };
  }

  const { error: updateErr } = await supabaseAdmin
    .from('action_items')
    .update({
      is_planned: false,
      status: 'not_started',
      updated_at: new Date().toISOString(),
    })
    .eq('id', actionItemId);

  if (updateErr) return { success: false, error: updateErr.message };

  await supabaseAdmin.from('task_activity_log').insert({
    action_item_id: actionItemId,
    actor_id: promoterId || null,
    action: 'promoted',
    content: 'Promoted forward plan into active Daily Work on Tab 1.',
  });

  revalidatePath('/next-plans');
  revalidatePath('/daily-work');
  return { success: true };
}
