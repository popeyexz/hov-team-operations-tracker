'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ActionItem, KeyResult, Objective, Profile, TaskActivityLog, Venture } from '@/lib/types';
import { calculateVentureHealth, isDueWithin7Days, isOverdue } from '@/lib/utils';
import { sendEmailNotification } from '@/lib/notifications/email';
import { sendWebPushToProfile } from '@/lib/notifications/push';
import { revalidatePath } from 'next/cache';

export async function getWorkData(activeProfileId?: string, impersonatedMemberId?: string) {
  try {
    const effectiveProfileId = impersonatedMemberId || activeProfileId;

    // Fetch profiles
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('role', { ascending: false });
    const profiles = (profilesData || []) as Profile[];

    // Fetch ventures
    const { data: venturesData } = await supabaseAdmin
      .from('ventures')
      .select('*, lead:lead_id(*)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    let ventures = (venturesData || []) as Venture[];

    // Fetch objectives
    const { data: objectivesData } = await supabaseAdmin
      .from('objectives')
      .select('*, owner:owner_id(*)')
      .order('sl_no', { ascending: true });
    const objectives = (objectivesData || []) as Objective[];

    // Fetch key results
    const { data: krsData } = await supabaseAdmin
      .from('key_results')
      .select('*, owner:owner_id(*)')
      .order('kr_code', { ascending: true });
    const keyResults = (krsData || []) as KeyResult[];

    // Fetch action items (active daily work, not planned)
    const { data: actionsData } = await supabaseAdmin
      .from('action_items')
      .select('*, assignee:assigned_to(*)')
      .eq('is_planned', false)
      .order('date', { ascending: false, nullsFirst: false });
    const actionItems = (actionsData || []) as ActionItem[];

    // Calculate dynamic health and stats per venture
    const myVentureIds = new Set<string>();

    ventures = ventures.map((v) => {
      const vObjs = objectives.filter((o) => o.venture_id === v.id);
      const vKrs = keyResults.filter((k) => k.venture_id === v.id);
      const vActions = actionItems.filter((a) => a.venture_id === v.id);

      const hasBlocker =
        vObjs.some((o) => o.status === 'blocker') ||
        vKrs.some((k) => k.status === 'blocker') ||
        vActions.some((a) => a.status === 'blocker');

      const hasOverdue =
        vObjs.some((o) => o.status !== 'completed' && o.status !== 'dropped' && isOverdue(o.due_date)) ||
        vKrs.some((k) => k.status !== 'completed' && k.status !== 'dropped' && isOverdue(k.due_date)) ||
        vActions.some((a) => a.status !== 'completed' && a.status !== 'dropped' && isOverdue(a.date));

      const hasDueSoon =
        vObjs.some((o) => o.status !== 'completed' && o.status !== 'dropped' && isDueWithin7Days(o.due_date)) ||
        vKrs.some((k) => k.status !== 'completed' && k.status !== 'dropped' && isDueWithin7Days(k.due_date)) ||
        vActions.some((a) => a.status !== 'completed' && a.status !== 'dropped' && isDueWithin7Days(a.date));

      const hasOnHold =
        vObjs.some((o) => o.status === 'on_hold') ||
        vKrs.some((k) => k.status === 'on_hold') ||
        vActions.some((a) => a.status === 'on_hold');

      const health = calculateVentureHealth({ hasBlocker, hasOverdue, hasDueSoon, hasOnHold });

      // Check cross-venture visibility for effectiveProfileId
      if (effectiveProfileId) {
        const effProfile = profiles.find((p) => p.id === effectiveProfileId);
        if (effProfile?.role === 'founder' && !impersonatedMemberId) {
          myVentureIds.add(v.id);
        } else {
          if (v.lead_id === effectiveProfileId) {
            myVentureIds.add(v.id);
          }
          if (vObjs.some((o) => o.owner_id === effectiveProfileId)) {
            myVentureIds.add(v.id);
          }
          if (vKrs.some((k) => k.owner_id === effectiveProfileId)) {
            myVentureIds.add(v.id);
          }
          if (vActions.some((a) => a.assigned_to === effectiveProfileId)) {
            myVentureIds.add(v.id);
          }
        }
      }

      return {
        ...v,
        health,
        objectives_count: vObjs.length,
        completed_objectives_count: vObjs.filter((o) => o.status === 'completed').length,
        krs_count: vKrs.length,
        completed_krs_count: vKrs.filter((k) => k.status === 'completed').length,
        actions_count: vActions.length,
        blockers_count: (hasBlocker ? 1 : 0),
        overdue_count: (hasOverdue ? 1 : 0),
        due_soon_count: (hasDueSoon ? 1 : 0),
      };
    });

    return {
      profiles,
      ventures,
      objectives,
      keyResults,
      actionItems,
      myVentureIds: Array.from(myVentureIds),
    };
  } catch (error) {
    console.error('getWorkData error:', error);
    return {
      profiles: [],
      ventures: [],
      objectives: [],
      keyResults: [],
      actionItems: [],
      myVentureIds: [],
    };
  }
}

export async function submitActionItemForReview(params: {
  actionItemId: string;
  actorId?: string | null;
  outcomeAchieved: string;
  comments?: string;
}) {
  const { actionItemId, actorId, outcomeAchieved, comments } = params;
  const cleanActorId = actorId && actorId.trim() ? actorId.trim() : null;

  const { data: item, error: fetchErr } = await supabaseAdmin
    .from('action_items')
    .select('*, venture:venture_id(*)')
    .eq('id', actionItemId)
    .single();

  if (fetchErr || !item) {
    return { success: false, error: fetchErr?.message || 'Item not found' };
  }

  const { error: updateErr } = await supabaseAdmin
    .from('action_items')
    .update({
      status: 'submitted_for_review',
      is_member_completed: true,
      outcome_achieved: outcomeAchieved,
      comments: comments !== undefined ? comments : item.comments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', actionItemId);

  if (updateErr) return { success: false, error: updateErr.message };

  // Log activity
  await supabaseAdmin.from('task_activity_log').insert({
    action_item_id: actionItemId,
    actor_id: cleanActorId,
    action: 'submission',
    content: `Submitted for review: ${outcomeAchieved}`,
  });

  // Notify Founder (Pratap)
  const { data: founder } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name')
    .eq('role', 'founder')
    .single();

  let actorName = 'Team Member';
  if (cleanActorId) {
    const { data: actor } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', cleanActorId)
      .single();
    if (actor?.full_name) actorName = actor.full_name;
  }

  if (founder) {
    await supabaseAdmin.from('in_app_notifications').insert({
      recipient_id: founder.id,
      actor_id: cleanActorId,
      action_item_id: actionItemId,
      type: 'submitted_for_review',
      title: 'Review Required',
      message: `${actorName} submitted "${item.title}" for review.`,
    });

    if (founder.email) {
      await sendEmailNotification({
        to: founder.email,
        subject: `[HOV Tracker] Task Review: ${item.title}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #38bdf8;">Task Submitted for Review</h2>
            <p><strong>${actorName}</strong> has completed their work on <em>"${item.title}"</em> and submitted it for your review.</p>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #38bdf8; margin: 15px 0;">
              <strong>Outcome Achieved:</strong><br/>
              ${outcomeAchieved}
            </div>
            <p>Log in to HOV Operations Tracker to confirm completion or request changes.</p>
          </div>
        `,
      });
    }

    await sendWebPushToProfile(founder.id, {
      title: 'Task Review Required',
      body: `${actorName} submitted "${item.title}" for review.`,
      url: '/daily-work',
    });
  }

  revalidatePath('/daily-work');
  return { success: true };
}

export async function founderReviewActionItem(params: {
  actionItemId: string;
  founderId?: string | null;
  approved: boolean;
  feedback?: string;
}) {
  const { actionItemId, founderId, approved, feedback } = params;
  let cleanFounderId = founderId && founderId.trim() ? founderId.trim() : null;
  if (!cleanFounderId) {
    const { data: founder } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'founder')
      .maybeSingle();
    cleanFounderId = founder?.id || null;
  }

  const { data: item, error: fetchErr } = await supabaseAdmin
    .from('action_items')
    .select('*, assigned_profile:assigned_to(*)')
    .eq('id', actionItemId)
    .single();

  if (fetchErr || !item) {
    return { success: false, error: fetchErr?.message || 'Item not found' };
  }

  const newStatus = approved ? 'completed' : 'needs_work';
  const isFounderConfirmed = approved;
  const isMemberCompleted = approved;

  const { error: updateErr } = await supabaseAdmin
    .from('action_items')
    .update({
      status: newStatus,
      is_founder_confirmed: isFounderConfirmed,
      is_member_completed: isMemberCompleted,
      comments: feedback ? feedback : item.comments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', actionItemId);

  if (updateErr) return { success: false, error: updateErr.message };

  // Log activity
  await supabaseAdmin.from('task_activity_log').insert({
    action_item_id: actionItemId,
    actor_id: cleanFounderId,
    action: approved ? 'approval' : 'feedback',
    content: approved
      ? 'Founder approved task as Completed.'
      : `Founder requested changes: ${feedback || 'Please revise.'}`,
  });

  // Notify assigned member
  if (item.assigned_to) {
    const notifType = approved ? 'completed' : 'needs_work';
    const notifTitle = approved ? 'Task Completed & Confirmed' : 'Changes Requested (Needs Work)';
    const notifMsg = approved
      ? `Founder confirmed your task "${item.title}". Great work!`
      : `Founder requested changes on "${item.title}": ${feedback || 'Please review.'}`;

    await supabaseAdmin.from('in_app_notifications').insert({
      recipient_id: item.assigned_to,
      actor_id: cleanFounderId,
      action_item_id: actionItemId,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
    });

    const memberEmail = item.assigned_profile?.email;
    if (memberEmail) {
      await sendEmailNotification({
        to: memberEmail,
        subject: `[HOV Tracker] ${notifTitle}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: ${approved ? '#34d399' : '#f87171'};">${notifTitle}</h2>
            <p>The Founder has reviewed your deliverable for <em>"${item.title}"</em>.</p>
            ${
              feedback
                ? `<div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid ${
                    approved ? '#34d399' : '#f87171'
                  }; margin: 15px 0;">
                    <strong>Feedback from Founder:</strong><br/>
                    ${feedback}
                  </div>`
                : ''
            }
            <p>Visit HOV Tracker to see latest updates.</p>
          </div>
        `,
      });
    }

    await sendWebPushToProfile(item.assigned_to, {
      title: notifTitle,
      body: notifMsg,
      url: '/daily-work',
    });
  }

  revalidatePath('/daily-work');
  return { success: true };
}

export async function getActionItemLogs(actionItemId: string): Promise<TaskActivityLog[]> {
  const { data, error } = await supabaseAdmin
    .from('task_activity_log')
    .select('*, actor:actor_id(*)')
    .eq('action_item_id', actionItemId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return data as TaskActivityLog[];
}

export async function createActionItem(params: {
  ventureId: string;
  objectiveId?: string | null;
  keyResultId?: string | null;
  title: string;
  assignedTo?: string | null;
  date?: string | null; // ISO YYYY-MM-DD
  status?: string;
  comments?: string;
  isPlanned?: boolean;
}) {
  const { data, error } = await supabaseAdmin
    .from('action_items')
    .insert({
      venture_id: params.ventureId,
      objective_id: params.objectiveId || null,
      key_result_id: params.keyResultId || null,
      title: params.title.trim(),
      assigned_to: params.assignedTo || null,
      date: params.date || null,
      status: params.status || 'not_started',
      comments: params.comments?.trim() || '',
      is_planned: params.isPlanned || false,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await supabaseAdmin.from('task_activity_log').insert({
    action_item_id: data.id,
    actor_id: params.assignedTo || null,
    action: 'created',
    content: `Created action item: "${params.title}"`,
  });

  revalidatePath('/daily-work');
  revalidatePath('/next-plans');
  return { success: true, item: data };
}

export async function updateActionItem(params: {
  id: string;
  title?: string;
  assignedTo?: string | null;
  date?: string | null;
  status?: string;
  comments?: string;
}) {
  const updatePayload: any = { updated_at: new Date().toISOString() };
  if (params.title !== undefined) updatePayload.title = params.title.trim();
  if (params.assignedTo !== undefined) updatePayload.assigned_to = params.assignedTo;
  if (params.date !== undefined) updatePayload.date = params.date;
  if (params.status !== undefined) updatePayload.status = params.status;
  if (params.comments !== undefined) updatePayload.comments = params.comments;

  const { error } = await supabaseAdmin
    .from('action_items')
    .update(updatePayload)
    .eq('id', params.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  return { success: true };
}

export async function deleteActionItem(id: string) {
  const { error } = await supabaseAdmin.from('action_items').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  revalidatePath('/next-plans');
  return { success: true };
}

export async function createObjective(params: {
  ventureId: string;
  title: string;
  ownerId?: string | null;
  dueDate?: string | null;
  comments?: string;
}) {
  // calculate next sl_no
  const { data: existing } = await supabaseAdmin
    .from('objectives')
    .select('sl_no')
    .eq('venture_id', params.ventureId)
    .order('sl_no', { ascending: false })
    .limit(1);

  const nextSl = (existing && existing[0]?.sl_no ? existing[0].sl_no + 1 : 1);

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .insert({
      venture_id: params.ventureId,
      sl_no: nextSl,
      title: params.title.trim(),
      status: 'no_krs',
      owner_id: params.ownerId || null,
      due_date: params.dueDate || null,
      comments: params.comments?.trim() || '',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  return { success: true, objective: data };
}

export async function updateObjective(params: {
  id: string;
  title?: string;
  status?: string;
  ownerId?: string | null;
  dueDate?: string | null;
  comments?: string;
}) {
  const payload: any = { updated_at: new Date().toISOString() };
  if (params.title !== undefined) payload.title = params.title.trim();
  if (params.status !== undefined) payload.status = params.status;
  if (params.ownerId !== undefined) payload.owner_id = params.ownerId;
  if (params.dueDate !== undefined) payload.due_date = params.dueDate;
  if (params.comments !== undefined) payload.comments = params.comments;

  const { error } = await supabaseAdmin
    .from('objectives')
    .update(payload)
    .eq('id', params.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  return { success: true };
}

export async function createKeyResult(params: {
  objectiveId: string;
  ventureId: string;
  krCode: string;
  title: string;
  targetMeasure?: string;
  ownerId?: string | null;
  dueDate?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('key_results')
    .insert({
      objective_id: params.objectiveId,
      venture_id: params.ventureId,
      kr_code: params.krCode.trim(),
      title: params.title.trim(),
      target_measure: params.targetMeasure?.trim() || '',
      status: 'pending',
      owner_id: params.ownerId || null,
      due_date: params.dueDate || null,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Update objective status from no_krs to pending
  await supabaseAdmin
    .from('objectives')
    .update({ status: 'pending' })
    .eq('id', params.objectiveId)
    .eq('status', 'no_krs');

  revalidatePath('/daily-work');
  return { success: true, keyResult: data };
}

export async function updateKeyResult(params: {
  id: string;
  title?: string;
  targetMeasure?: string;
  status?: string;
  ownerId?: string | null;
  dueDate?: string | null;
}) {
  const payload: any = { updated_at: new Date().toISOString() };
  if (params.title !== undefined) payload.title = params.title.trim();
  if (params.targetMeasure !== undefined) payload.target_measure = params.targetMeasure;
  if (params.status !== undefined) payload.status = params.status;
  if (params.ownerId !== undefined) payload.owner_id = params.ownerId;
  if (params.dueDate !== undefined) payload.due_date = params.dueDate;

  const { error } = await supabaseAdmin
    .from('key_results')
    .update(payload)
    .eq('id', params.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  return { success: true };
}

export async function updateVentureLead(params: {
  ventureId: string;
  leadId: string | null;
  leadTitle?: string;
}) {
  const cleanLeadId = params.leadId && params.leadId.trim() ? params.leadId.trim() : null;
  const payload: any = {
    lead_id: cleanLeadId,
    updated_at: new Date().toISOString(),
  };
  if (params.leadTitle !== undefined) {
    payload.lead_title = params.leadTitle.trim() || 'Venture Lead';
  }

  const { data, error } = await supabaseAdmin
    .from('ventures')
    .update(payload)
    .eq('id', params.ventureId)
    .select('*, lead:lead_id(*)')
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  revalidatePath('/progress');
  return { success: true, venture: data as Venture };
}

export async function addActivityComment(params: {
  actionItemId: string;
  actorId?: string | null;
  content: string;
}) {
  const content = params.content?.trim();
  if (!content) return { success: false, error: 'Comment content cannot be empty' };

  const cleanActorId = params.actorId && params.actorId.trim() ? params.actorId.trim() : null;

  const { data, error } = await supabaseAdmin
    .from('task_activity_log')
    .insert({
      action_item_id: params.actionItemId,
      actor_id: cleanActorId,
      action: 'feedback',
      content,
    })
    .select('*, actor:actor_id(*)')
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/daily-work');
  return { success: true, log: data as TaskActivityLog };
}

export async function getVenturesForGateway() {
  const { data } = await supabaseAdmin
    .from('ventures')
    .select('id, name, code, lead_id')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return (data || []) as { id: string; name: string; code: string; lead_id: string }[];
}
