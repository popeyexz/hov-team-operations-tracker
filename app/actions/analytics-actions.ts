'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ActionItem, KeyResult, Objective, Profile, Venture } from '@/lib/types';
import { calculateVentureHealth, isDueWithin7Days, isOverdue } from '@/lib/utils';

export interface PortfolioSnapshotData {
  objectivesCompleted: number;
  objectivesTotal: number;
  objectivesPercent: number;
  krsCompleted: number;
  krsTotal: number;
  krsPercent: number;
  openBlockers: number;
  overdueItems: number;
  todayActionsDone: number;
  todayActionsTotal: number;
  thisWeekActionsDone: number;
  thisWeekActionsTotal: number;
  venturesInRed: number;
  venturesTotal: number;
  planningGapsTotal: number;
}

export interface VentureProgressRow {
  id: string;
  name: string;
  leadName: string;
  totalObjectives: number;
  completedObjectives: number;
  pendingObjectives: number;
  onHoldObjectives: number;
  blockerObjectives: number;
  droppedObjectives: number;
  objectivePercent: number;
  krsTotal: number;
  krsCompleted: number;
  krPercent: number;
  overdueCount: number;
  blockedKrs: number;
  dueSoonCount: number;
  actionsThisWeek: number;
  health: 'green' | 'amber' | 'red';
}

export interface MemberProgressRow {
  id: string;
  name: string;
  status: string;
  objectivesOwned: number;
  objectivesDone: number;
  krsOpen: number;
  krsDone: number;
  krsOverdue: number;
  krsBlocked: number;
  actionsTodayDone: number;
  actionsTodayTotal: number;
  actionsWeekDone: number;
  actionsWeekTotal: number;
  percentActionsCompleted: number;
  percentLinkedToKR: number;
  activeDays: number;
  flag: 'normal' | 'attention';
}

export interface PlanningGapRow {
  ventureId: string;
  ventureName: string;
  objsWithoutOwner: number;
  objsWithoutDueDate: number;
  objsWithoutKrs: number;
  krsWithoutOwner: number;
  krsWithoutDueDate: number;
  totalGaps: number;
}

export interface WeeklyTrendRow {
  weekStarting: string;
  actionsPlanned: number;
  actionsCompleted: number;
  memberCounts: Record<string, number>;
}

export async function getAnalyticsData() {
  try {
    // 1. Fetch raw data
    const [{ data: venturesRaw }, { data: profilesRaw }, { data: objectivesRaw }, { data: krsRaw }, { data: actionsRaw }] =
      await Promise.all([
        supabaseAdmin.from('ventures').select('*, lead:lead_id(*)').eq('is_active', true).order('display_order', { ascending: true }),
        supabaseAdmin.from('profiles').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabaseAdmin.from('objectives').select('*, owner:owner_id(*)').order('sl_no', { ascending: true }),
        supabaseAdmin.from('key_results').select('*, owner:owner_id(*)'),
        supabaseAdmin.from('action_items').select('*, assignee:assigned_to(*)'),
      ]);

    const ventures = (venturesRaw || []) as Venture[];
    const profiles = (profilesRaw || []) as Profile[];
    const objectives = (objectivesRaw || []) as Objective[];
    const keyResults = (krsRaw || []) as KeyResult[];
    const actionItems = (actionsRaw || []) as ActionItem[];

    // Date range helpers
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // This week start (Monday) and end (Sunday)
    const dayOfWeek = (now.getDay() + 6) % 7; // Mon = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const isInThisWeek = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      const d = new Date(dateStr.split('T')[0]);
      return d >= monday && d <= sunday;
    };

    const isToday = (dateStr: string | null | undefined) => {
      if (!dateStr) return false;
      return dateStr.split('T')[0] === todayStr;
    };

    // 2. Venture Progress Rows
    let totalBlockers = 0;
    let totalOverdue = 0;
    let redVenturesCount = 0;

    const ventureRows: VentureProgressRow[] = ventures.map((v) => {
      const vObjs = objectives.filter((o) => o.venture_id === v.id);
      const vKrs = keyResults.filter((k) => k.venture_id === v.id);
      const vActions = actionItems.filter((a) => a.venture_id === v.id && !a.is_planned);

      const totalObjs = vObjs.length;
      const completedObjs = vObjs.filter((o) => o.status === 'completed').length;
      const pendingObjs = vObjs.filter((o) => o.status === 'pending').length;
      const onHoldObjs = vObjs.filter((o) => o.status === 'on_hold').length;
      const blockerObjs = vObjs.filter((o) => o.status === 'blocker').length;
      const droppedObjs = vObjs.filter((o) => o.status === 'dropped').length;

      const totalKrs = vKrs.length;
      const completedKrs = vKrs.filter((k) => k.status === 'completed').length;
      const blockedKrs = vKrs.filter((k) => k.status === 'blocker').length;

      const objPercent = totalObjs > 0 ? Math.round((completedObjs / totalObjs) * 100) : 0;
      const krPercent = totalKrs > 0 ? Math.round((completedKrs / totalKrs) * 100) : 0;

      const overdueObjs = vObjs.filter((o) => o.status !== 'completed' && o.status !== 'dropped' && isOverdue(o.due_date)).length;
      const overdueKrs = vKrs.filter((k) => k.status !== 'completed' && k.status !== 'dropped' && isOverdue(k.due_date)).length;
      const overdueActions = vActions.filter((a) => a.status !== 'completed' && a.status !== 'dropped' && isOverdue(a.date)).length;
      const overdueCount = overdueObjs + overdueKrs;

      const dueSoonCount =
        vObjs.filter((o) => o.status !== 'completed' && o.status !== 'dropped' && isDueWithin7Days(o.due_date)).length +
        vKrs.filter((k) => k.status !== 'completed' && k.status !== 'dropped' && isDueWithin7Days(k.due_date)).length;

      const actionsThisWeek = vActions.filter((a) => isInThisWeek(a.date)).length;

      const hasBlocker = blockerObjs > 0 || blockedKrs > 0 || vActions.some((a) => a.status === 'blocker');
      const hasOverdue = overdueCount > 0 || overdueActions > 0;
      const hasDueSoon = dueSoonCount > 0;
      const hasOnHold = onHoldObjs > 0 || vKrs.some((k) => k.status === 'on_hold');

      const health = calculateVentureHealth({ hasBlocker, hasOverdue, hasDueSoon, hasOnHold });

      if (hasBlocker) totalBlockers += (blockerObjs + blockedKrs + vActions.filter((a) => a.status === 'blocker').length);
      if (hasOverdue) totalOverdue += (overdueCount + overdueActions);
      if (health === 'red') redVenturesCount++;

      return {
        id: v.id,
        name: v.name,
        leadName: v.lead?.full_name || 'Unassigned',
        totalObjectives: totalObjs,
        completedObjectives: completedObjs,
        pendingObjectives: pendingObjs,
        onHoldObjectives: onHoldObjs,
        blockerObjectives: blockerObjs,
        droppedObjectives: droppedObjs,
        objectivePercent: objPercent,
        krsTotal: totalKrs,
        krsCompleted: completedKrs,
        krPercent,
        overdueCount,
        blockedKrs,
        dueSoonCount,
        actionsThisWeek,
        health,
      };
    });

    // 3. Member Progress Rows (Exclude Founder from Member Table, like Excel)
    const nonFounderMembers = profiles.filter((p) => p.role !== 'founder');
    const memberRows: MemberProgressRow[] = nonFounderMembers.map((m) => {
      const mObjs = objectives.filter((o) => o.owner_id === m.id);
      const mKrs = keyResults.filter((k) => k.owner_id === m.id);
      const mActions = actionItems.filter((a) => a.assigned_to === m.id && !a.is_planned);

      const objsOwned = mObjs.length;
      const objsDone = mObjs.filter((o) => o.status === 'completed').length;

      const krsOpen = mKrs.filter((k) => k.status !== 'completed' && k.status !== 'dropped').length;
      const krsDone = mKrs.filter((k) => k.status === 'completed').length;
      const krsOverdue = mKrs.filter((k) => k.status !== 'completed' && k.status !== 'dropped' && isOverdue(k.due_date)).length;
      const krsBlocked = mKrs.filter((k) => k.status === 'blocker').length;

      const actionsToday = mActions.filter((a) => isToday(a.date));
      const actionsTodayDone = actionsToday.filter((a) => a.status === 'completed').length;
      const actionsTodayTotal = actionsToday.length;

      const actionsWeek = mActions.filter((a) => isInThisWeek(a.date));
      const actionsWeekDone = actionsWeek.filter((a) => a.status === 'completed').length;
      const actionsWeekTotal = actionsWeek.length;

      const totalMemberActions = mActions.length;
      const completedMemberActions = mActions.filter((a) => a.status === 'completed').length;
      const percentActionsCompleted = totalMemberActions > 0 ? Math.round((completedMemberActions / totalMemberActions) * 100) : 0;

      const linkedActions = mActions.filter((a) => a.key_result_id !== null).length;
      const percentLinkedToKR = totalMemberActions > 0 ? Math.round((linkedActions / totalMemberActions) * 100) : 0;

      // Active days with action items
      const uniqueDays = new Set(mActions.filter((a) => a.date).map((a) => a.date!.split('T')[0])).size;

      const flag: 'normal' | 'attention' = (krsOverdue > 0 || krsBlocked > 0) ? 'attention' : 'normal';

      return {
        id: m.id,
        name: m.full_name,
        status: 'Active',
        objectivesOwned: objsOwned,
        objectivesDone: objsDone,
        krsOpen,
        krsDone,
        krsOverdue,
        krsBlocked,
        actionsTodayDone,
        actionsTodayTotal,
        actionsWeekDone,
        actionsWeekTotal,
        percentActionsCompleted,
        percentLinkedToKR,
        activeDays: uniqueDays,
        flag,
      };
    });

    // 4. Planning Gaps
    let grandTotalGaps = 0;
    const planningGaps: PlanningGapRow[] = ventures.map((v) => {
      const vObjs = objectives.filter((o) => o.venture_id === v.id);
      const vKrs = keyResults.filter((k) => k.venture_id === v.id);

      const objsWithoutOwner = vObjs.filter((o) => !o.owner_id).length;
      const objsWithoutDueDate = vObjs.filter((o) => !o.due_date).length;
      const objsWithoutKrs = vObjs.filter((o) => o.status === 'no_krs' || !vKrs.some((k) => k.objective_id === o.id)).length;

      const krsWithoutOwner = vKrs.filter((k) => !k.owner_id).length;
      const krsWithoutDueDate = vKrs.filter((k) => !k.due_date).length;

      const totalGaps = objsWithoutOwner + objsWithoutDueDate + objsWithoutKrs + krsWithoutOwner + krsWithoutDueDate;
      grandTotalGaps += totalGaps;

      return {
        ventureId: v.id,
        ventureName: v.name,
        objsWithoutOwner,
        objsWithoutDueDate,
        objsWithoutKrs,
        krsWithoutOwner,
        krsWithoutDueDate,
        totalGaps,
      };
    });

    // 5. Rolling 8-Week Trend
    const weeklyTrend: WeeklyTrendRow[] = [];
    for (let i = 7; i >= 0; i--) {
      const wMonday = new Date(monday);
      wMonday.setDate(monday.getDate() - i * 7);
      const wSunday = new Date(wMonday);
      wSunday.setDate(wMonday.getDate() + 6);
      wSunday.setHours(23, 59, 59, 999);

      const wActions = actionItems.filter((a) => {
        if (!a.date) return false;
        const d = new Date(a.date.split('T')[0]);
        return d >= wMonday && d <= wSunday;
      });

      const memberCounts: Record<string, number> = {};
      profiles.forEach((p) => {
        memberCounts[p.full_name] = wActions.filter((a) => a.assigned_to === p.id && a.status === 'completed').length;
      });

      weeklyTrend.push({
        weekStarting: wMonday.toISOString().split('T')[0],
        actionsPlanned: wActions.length,
        actionsCompleted: wActions.filter((a) => a.status === 'completed').length,
        memberCounts,
      });
    }

    // 6. Portfolio Snapshot
    const totalObjs = objectives.length;
    const completedObjs = objectives.filter((o) => o.status === 'completed').length;
    const totalKrs = keyResults.length;
    const completedKrs = keyResults.filter((k) => k.status === 'completed').length;

    const todayActions = actionItems.filter((a) => isToday(a.date) && !a.is_planned);
    const todayDone = todayActions.filter((a) => a.status === 'completed').length;

    const weekActions = actionItems.filter((a) => isInThisWeek(a.date) && !a.is_planned);
    const weekDone = weekActions.filter((a) => a.status === 'completed').length;

    const portfolioSnapshot: PortfolioSnapshotData = {
      objectivesCompleted: completedObjs,
      objectivesTotal: totalObjs,
      objectivesPercent: totalObjs > 0 ? Math.round((completedObjs / totalObjs) * 100) : 0,
      krsCompleted: completedKrs,
      krsTotal: totalKrs,
      krsPercent: totalKrs > 0 ? Math.round((completedKrs / totalKrs) * 100) : 0,
      openBlockers: totalBlockers,
      overdueItems: totalOverdue,
      todayActionsDone: todayDone,
      todayActionsTotal: todayActions.length,
      thisWeekActionsDone: weekDone,
      thisWeekActionsTotal: weekActions.length,
      venturesInRed: redVenturesCount,
      venturesTotal: ventures.length,
      planningGapsTotal: grandTotalGaps,
    };

    return {
      portfolioSnapshot,
      ventureRows,
      memberRows,
      planningGaps,
      weeklyTrend,
      rawVentures: ventures,
      rawProfiles: profiles,
    };
  } catch (error) {
    console.error('getAnalyticsData error:', error);
    return null;
  }
}
