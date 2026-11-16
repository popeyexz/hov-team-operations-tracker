export type UserRole = 'founder' | 'member';

export type VentureHealth = 'green' | 'amber' | 'red';

export type ObjectiveStatus = 'no_krs' | 'pending' | 'on_hold' | 'blocker' | 'completed' | 'dropped';

export type KRStatus = 'pending' | 'on_hold' | 'blocker' | 'completed' | 'dropped';

export type ActionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'submitted_for_review' 
  | 'needs_work' 
  | 'completed' 
  | 'on_hold' 
  | 'blocker' 
  | 'dropped';

export interface Profile {
  id: string;
  slug: string;
  full_name: string;
  role: UserRole;
  lead_title: string;
  email: string;
  avatar_color: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Venture {
  id: string;
  name: string;
  code: string;
  lead_id: string | null;
  lead_title: string;
  description: string;
  health: VentureHealth;
  is_active: boolean;
  display_order: number;
  lead?: Profile;
  objectives_count?: number;
  completed_objectives_count?: number;
  krs_count?: number;
  completed_krs_count?: number;
  actions_count?: number;
  blockers_count?: number;
  overdue_count?: number;
  due_soon_count?: number;
}

export interface Objective {
  id: string;
  venture_id: string;
  sl_no: number;
  title: string;
  status: ObjectiveStatus;
  owner_id: string | null;
  due_date: string | null;
  comments: string;
  created_at: string;
  owner?: Profile;
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  objective_id: string;
  venture_id: string;
  kr_code: string;
  title: string;
  target_measure: string;
  status: KRStatus;
  owner_id: string | null;
  due_date: string | null;
  comments: string;
  owner?: Profile;
  action_items?: ActionItem[];
}

export interface ActionItem {
  id: string;
  venture_id: string;
  objective_id: string | null;
  key_result_id: string | null;
  title: string;
  assigned_to: string | null;
  date: string | null;
  status: ActionStatus;
  is_member_completed: boolean;
  is_founder_confirmed: boolean;
  outcome_achieved: string;
  is_planned: boolean;
  comments: string;
  created_at: string;
  assignee?: Profile;
  venture?: Venture;
  objective?: Objective;
  key_result?: KeyResult;
}

export interface VentureDocument {
  id: string;
  venture_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  created_at: string;
  uploader?: Profile;
}

export interface TaskActivityLog {
  id: string;
  action_item_id: string;
  actor_id: string | null;
  action: 'created' | 'status_change' | 'submission' | 'feedback' | 'approval' | 'assignment' | 'promoted';
  content: string;
  created_at: string;
  actor?: Profile;
}

export interface InAppNotification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  action_item_id: string;
  type: 'submitted_for_review' | 'needs_work' | 'completed' | 'assigned' | 'general';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}
