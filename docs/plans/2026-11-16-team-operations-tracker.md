# HOV Team Operations & Personal Work Tracker — Full-Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and full-stack-orchestration-full-stack-feature to implement this plan task-by-task.

**Goal:** Build a responsive, liquid glass team operations & OKR operating system for HOV managing 13 ventures across 7 members (1 Founder + 6 Team Members) with Netflix-style passwordless profile switching, email collection for alerts, automated venture health (Red/Amber/Green), cross-venture visibility, document uploads per venture, and multi-channel notifications (In-app, Resend Email, and Web Push for PC & Mobile).

**Architecture:** Next.js 15+ (App Router, React 19, TypeScript) backed by Supabase PostgreSQL (RLS, Storage, and Realtime). Passwordless profile switcher with first-time email collection, two-stage review workflows with threaded feedback logs, unified forward planning, full Progress Analytics suite from `PS.HOV_Work_Tracker.xlsx` with automated Red/Amber/Green venture health, and Supabase Storage for per-venture document attachments.

**Tech Stack:** Next.js 15+ (App Router), Tailwind CSS v4, Framer Motion, Lucide React, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Supabase Storage, web-push (VAPID), Resend / Nodemailer, Vercel.

---

### Phase 1: Architecture & Design Foundation

#### Task 1: Environment & Project Scaffolding
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `.env.local`
- Create: `public/manifest.json`
- Create: `public/sw.js`

**Step 1: Install dependencies**
Install `next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`, `framer-motion`, `tailwindcss`, `clsx`, `tailwind-merge`, `web-push`, `resend`. Dev dependencies: `typescript`, `@types/node`, `@types/react`, `@types/web-push`.

**Step 2: Configure Tailwind CSS v4 with Liquid Glass Utilities**
In `app/globals.css`, configure translucent glassmorphism classes:
- `.glass-card`: `backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-white/10 shadow-lg rounded-2xl`
- `.glass-pill`: `backdrop-blur-sm bg-white/40 dark:bg-white/5 border border-white/10 rounded-full`
- `.glass-input`: `bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm rounded-xl`

**Step 3: Setup .env.local with verified credentials**
Pre-fill with verified credentials from `.env new.txt`:
- `NEXT_PUBLIC_SUPABASE_URL=https://cjmdzulucwuvzybvtgdz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `ADMIN_DEV_EMAIL=houseofventures.dev@gmail.com`
- `VERCEL_TOKEN=...`
- `RESEND_API_KEY=...`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY=...`
- `VAPID_PRIVATE_KEY=...`

---

### Phase 2: Database Layer & Data Ingestion

#### Task 2: Supabase Schema, Storage Bucket, and Excel Seeder
**Files:**
- Create: `supabase/migrations/20261116000000_init_schema.sql`
- Create: `scripts/seed-from-excel.py`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`

**Step 1: Define Relational Tables & Storage**
Create tables in `supabase/migrations/20261116000000_init_schema.sql`:
- `profiles`: `id (uuid, PK)`, `slug (text, unique)`, `full_name`, `role ('founder'|'member')`, `email (text)`, `avatar_url`, `is_active (bool)`, `created_at`
- `ventures`: `id`, `name`, `code`, `lead_id (FK profiles)`, `description`, `health ('green'|'amber'|'red')`, `is_active (bool)`
- `objectives`: `id`, `venture_id`, `sl_no (int)`, `title`, `status ('no_krs'|'pending'|'on_hold'|'blocker'|'completed'|'dropped')`, `owner_id (FK profiles)`, `due_date (date)`, `comments (text)`, `created_at`
- `key_results`: `id`, `objective_id`, `venture_id`, `kr_code (text, e.g. 1.1)`, `title`, `target_measure (text)`, `status ('pending'|'on_hold'|'blocker'|'completed'|'dropped')`, `owner_id (FK profiles)`, `due_date (date)`, `comments (text)`
- `action_items`: `id`, `venture_id`, `objective_id (nullable)`, `key_result_id (nullable)`, `title`, `assigned_to (FK profiles)`, `date (date)`, `status ('not_started'|'in_progress'|'submitted_for_review'|'needs_work'|'completed')`, `is_member_completed (bool)`, `is_founder_confirmed (bool)`, `outcome_achieved (text)`, `is_planned (bool)`, `comments (text)`, `created_at`
- `venture_documents`: `id`, `venture_id (FK ventures)`, `name`, `file_url`, `file_type`, `file_size`, `uploaded_by (FK profiles)`, `created_at`
- `task_activity_log`: `id`, `action_item_id (FK action_items)`, `actor_id (FK profiles)`, `action ('status_change'|'feedback'|'submission'|'assignment')`, `content`, `created_at`
- `push_subscriptions`: `id`, `profile_id (FK profiles)`, `endpoint`, `keys (jsonb)`, `created_at`
- Storage bucket: `venture-documents` (public/authenticated read, authenticated write).

**Step 2: Seed Script from `PS.HOV_Work_Tracker.xlsx`**
Create `scripts/seed-from-excel.py` to:
- Seed Founder (`Pratap`) and 6 members (`Atharav`, `Sharuk`, `Rufus`, `Shristy`, `Sarth`, `Rohini`).
- Seed 13 ventures and initial leads (Atharav: 5, Sharuk: 5, Rufus: 3). Strictly exclude 'Grow Me Social'.
- Seed all 73 objectives from sheet `Objectives by Ventures`.
- Seed all Key Results from sheet `Key Results by Ventures`.
- Seed existing Action Items from sheet `Team Action Plan`.

---

### Phase 3: Core Application & Features Implementation

#### Task 3: Netflix-Style Profile Switcher & Global Shell
**Files:**
- Create: `app/page.tsx` (or `app/profiles/page.tsx`)
- Create: `components/auth/ProfileGrid.tsx`
- Create: `components/auth/ProfileCard.tsx`
- Create: `components/auth/EmailPromptModal.tsx`
- Create: `components/auth/AddMemberModal.tsx`
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/ProfileDropdown.tsx`
- Create: `context/ActiveProfileContext.tsx`
- Create: `app/actions/profile-actions.ts`

**Step 1: Netflix-Style Profile Screen**
- Grid of circular/rounded liquid glass profile cards: Pratap (Founder), Atharav, Sharuk, Rufus, Shristy, Sarth, Rohini, and "+ Add Member".
- 100% passwordless and PIN-free.
- Clicking a profile checks if `email` is set:
  - If null/empty: Opens `EmailPromptModal` to collect their notification email.
  - If set: Instantly activates profile session and redirects to `/daily-work`.

**Step 2: Navbar & Switcher**
- Top-right avatar dropdown showing active profile with "Switch Profile" and "Edit Alert Email" options.
- Founder "View As" toggle when active profile is Pratap.

#### Task 4: Tab 1 — Daily Work, OKR Hierarchy & Cross-Venture Visibility
**Files:**
- Create: `app/daily-work/page.tsx`
- Create: `components/daily-work/DualViewModeToggle.tsx`
- Create: `components/daily-work/VentureLeadView.tsx`
- Create: `components/daily-work/VentureBoardView.tsx`
- Create: `components/daily-work/OKRTreeItem.tsx`
- Create: `components/daily-work/ActionItemRow.tsx`
- Create: `components/daily-work/FeedbackLogModal.tsx`
- Create: `components/daily-work/DatePickerDDMMYYYY.tsx`
- Create: `app/actions/work-actions.ts`

**Step 1: Dual View Modes (Venture Lead vs Venture)**
- Toggle between viewing grouped by Venture Lead and grouped by individual Venture.

**Step 2: Cross-Venture Automatic Surfacing**
- If a member is assigned an action item or OKR under another venture, that venture automatically appears in their workspace.

**Step 3: Two-Stage Review & Feedback Log**
- Member completes + outcome notes -> status `submitted_for_review`.
- Founder confirms `completed` OR requests changes `needs_work` with corrective feedback.
- Threaded chronological feedback log modal with timestamps and author details.
- Strict DD-MM-YYYY interactive calendar picker.

**Step 4: Full In-Tab Visibility**
- Completed and dropped items remain fully visible with status tags/filters (no hidden archive drawers).

#### Task 5: Venture Documents & Assets Manager
**Files:**
- Create: `components/venture/VentureDocumentsDrawer.tsx`
- Create: `components/venture/FileUploadZone.tsx`
- Create: `app/actions/document-actions.ts`

**Step 1: File Upload & Storage**
- Upload files (PDF, Word, Excel, images, decks) to Supabase Storage `venture-documents` bucket.
- Store metadata in `venture_documents` table linked to the active venture.
- List documents with file size, uploaded by, and instant download/preview link.

#### Task 6: Tab 2 — Next Plans (Forward Planning)
**Files:**
- Create: `app/next-plans/page.tsx`
- Create: `components/next-plans/UpcomingTimeline.tsx`
- Create: `components/next-plans/PlanTaskModal.tsx`
- Create: `app/actions/plan-actions.ts`

**Step 1: Forward Planning Board**
- Display upcoming scheduled tasks and planned OKRs across ventures and members.
- "Promote to Daily Work" button transitioning planned items into active daily tasks on Tab 1.

#### Task 7: Tab 3 — Progress Analytics & Health Suite
**Files:**
- Create: `app/progress/page.tsx`
- Create: `components/progress/PortfolioSnapshot.tsx`
- Create: `components/progress/FocusSelector.tsx`
- Create: `components/progress/ProgressByVentureTable.tsx`
- Create: `components/progress/ProgressByMemberTable.tsx`
- Create: `components/progress/PlanningGapsTable.tsx`
- Create: `components/progress/WeeklyTrendChart.tsx`
- Create: `lib/analytics/health.ts`

**Step 1: Automated Venture Health Engine**
- 🔴 Red: Contains any Blocker or Overdue item.
- 🟡 Amber: Contains items due within 7 days or on-hold.
- 🟢 Green: On track, healthy.

**Step 2: Progress Rollup Calculations**
- $\text{KR \%} = (\text{Founder-Confirmed Tasks} / \text{Total Tasks}) \times 100$ rolling up to Objectives, Monthly Goals, and Ventures.

**Step 3: Scorecards & Planning Gaps**
- Interactive Focus Selector (drill into any single venture or team member).
- Planning Gaps table highlighting missing owners, due dates, or KRs.
- 8-week rolling trend table/chart.

#### Task 8: Multi-Channel Notifications (In-App, Resend Email, and Web Push)
**Files:**
- Create: `lib/notifications/email.ts`
- Create: `lib/notifications/push.ts`
- Create: `app/api/notifications/web-push/route.ts`
- Create: `components/notifications/NotificationBell.tsx`

**Step 1: In-App Badges**
- Red counter for *Needs Work* on member profile; amber counter for *Submitted for Review* on Founder profile.

**Step 2: Resend / SMTP Email Delivery**
- Send email to member's collected email when task is marked *Needs Work* or *Completed*.
- Send email to Founder when task is *Submitted for Review*.

**Step 3: Web Push on PC & Mobile**
- Service Worker registration (`sw.js`) + VAPID push subscriptions stored in `push_subscriptions`.

---

### Phase 4: Integration, Testing & Vercel Deployment

#### Task 9: End-to-End Verification & Production Deployment
**Files:**
- Create: `tests/e2e/operations.test.ts`
- Create: `docs/deployment/DEPLOYMENT.md`

**Step 1: Automated E2E verification**
- Test Netflix profile switcher without passwords.
- Test first-time email collection prompt.
- Test cross-venture visibility.
- Test two-stage review loop and threaded feedback.
- Test document upload to Supabase Storage.
- Test automated Red/Amber/Green venture health calculation.

**Step 2: Deploy to Vercel**
- Link project using `VERCEL_TOKEN`.
- Configure environment variables and deploy production build.
