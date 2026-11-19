# HOV Operations & Personal Tracker — Master Handoff & Infrastructure Audit

> **Generated:** November 19, 2026  
> **Project Name:** House of Ventures (HOV) Team Operations & OKR Tracker  
> **Repository:** [https://github.com/popeyexz/hov-team-operations-tracker](https://github.com/popeyexz/hov-team-operations-tracker)  
> **Live Production URL:** [https://hov-team-tracker.vercel.app](https://hov-team-tracker.vercel.app)  

---

## 1. Quick Executive Reference

| Component | Identifier / URL | Location / Credentials Source |
| :--- | :--- | :--- |
| **Local Folder** | `c:\Users\ASUS\Downloads\personal tracker for hov` | Local Machine Working Directory |
| **Env File** | `.env.local` | Project root (`.env.local`) |
| **Supabase Project Ref** | `cjmdzulucwuvzybvtgdz` | `https://supabase.com/dashboard/project/cjmdzulucwuvzybvtgdz` |
| **Supabase API URL** | `https://cjmdzulucwuvzybvtgdz.supabase.co` | In `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` |
| **Vercel Project** | `hov-team-tracker` (`prj_Vy6p9QUVhMhKZ7zamfvsACLvsoXs`) | `https://vercel.com/hov9/hov-team-tracker` |
| **Vercel Team / Scope** | `team_alfUxsgPPcvdqbgUASI5d6WP` (`hov9`) | Linked via `.vercel/project.json` |
| **GitHub Remote** | `https://github.com/popeyexz/hov-team-operations-tracker.git` | `origin/master` (Default), `origin/main` |
| **Storage Bucket** | `venture-documents` | Public Supabase S3-compatible Storage Bucket |

---

## 2. Environment Variables Audit (`.env.local`)

The active `.env.local` file is stored at:  
`c:\Users\ASUS\Downloads\personal tracker for hov\.env.local`

### Variable Inventory

```env
# --- SUPABASE CONFIGURATION ---
NEXT_PUBLIC_SUPABASE_URL=https://cjmdzulucwuvzybvtgdz.supabase.co
# Keys stored in local .env.local (Protected by .gitignore):
# NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT anon token)
# SUPABASE_SERVICE_ROLE_KEY (JWT admin token)
# SUPABASE_ACCESS_TOKEN (sbp_... token in .env.local)
# SUPABASE_DB_PASSWORD (in .env.local)

# --- APP ADMIN CONFIGURATION ---
ADMIN_DEV_EMAIL=houseofventures.dev@gmail.com

# --- VERCEL CLI DEPLOYMENT TOKEN ---
# VERCEL_TOKEN (vcp_... token in .env.local)

# --- WEB PUSH / VAPID NOTIFICATIONS ---
# VAPID credentials in .env.local
```

### Key Roles & Permissions
- **`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Exposed to the browser for client-side queries (`lib/supabase/client.ts`) subject to Row Level Security (RLS).
- **`SUPABASE_SERVICE_ROLE_KEY`**: Server-only privileged key used by Next.js Server Actions and automation scripts (`lib/supabase/admin.ts`) to bypass RLS for administrative updates.
- **`SUPABASE_ACCESS_TOKEN` & `SUPABASE_DB_PASSWORD`**: Direct Management API token and PostgreSQL database password for running migrations and direct SQL execution via `scripts/db.py`.
- **`VERCEL_TOKEN`**: Dedicated personal access token used by `scripts/deploy_vercel.py` for automated continuous deployment to Vercel Production.

---

## 3. Supabase Cloud Infrastructure

- **Project ID / Reference:** `cjmdzulucwuvzybvtgdz`
- **Dashboard URL:** [https://supabase.com/dashboard/project/cjmdzulucwuvzybvtgdz](https://supabase.com/dashboard/project/cjmdzulucwuvzybvtgdz)
- **Direct Database Host:** `db.cjmdzulucwuvzybvtgdz.supabase.co`
- **PostgreSQL Port:** `5432` (Direct), `6543` (Connection Pooler)
- **Database User:** `postgres`
- **Database Password:** `HovTracker2026!SecureDb#Pass`
- **Schema Migration File:** `supabase/migrations/20261116000000_init_schema.sql`

### Database Inventory & Verified State
Verified via automated testing:
1. **Profiles (8 Members):**
   - `pratap` — **Founder & Managing Partner** (`role: 'founder'`, email: `houseofventures.dev@gmail.com`)
   - `atharav` — Venture & NGO Lead (`role: 'member'`)
   - `sharuk` — Venture & AI Tool Lead (`role: 'member'`, email: `sharuk.raja.hov@gmail.com`)
   - `rufus` — Venture & Program Lead (`role: 'member'`)
   - `shristy` — Cross-Venture Associate (`role: 'member'`)
   - `sarth` — Growth & Ops Associate (`role: 'member'`)
   - `rohini` — Community & Content Associate (`role: 'member'`)
   - `caracal` — Collaborator (`role: 'member'`)
2. **Ventures (13 Total):**
   - **Atharav Leads (5):** Impactshaala, GUIDESHAALA, PulseEvents, NxtGen Impact, HIF
   - **Sharuk Leads (5):** HBM, HAIS, XARM MARSERV, CreativeTech, LeadTech
   - **Rufus Leads (3):** PS.HOV, Law Offices of Mary Kennedy, Point Square Realty
3. **Objectives (73 Authentic Total):**
   - Seeded 100% authentically from `PS.HOV_Work_Tracker.xlsx`.
   - **Zero Synthetic / Mock Key Results** (Strict zero-fabrication constraint preserved).
4. **Storage Bucket:**
   - Name: `venture-documents`
   - Access: Public read, authenticated/admin write.

---

## 4. Vercel Deployment & Project Settings

- **Project Name:** `hov-team-tracker`
- **Project ID:** `prj_Vy6p9QUVhMhKZ7zamfvsACLvsoXs`
- **Team / Organization ID:** `team_alfUxsgPPcvdqbgUASI5d6WP` (`hov9`)
- **Production URL:** [https://hov-team-tracker.vercel.app](https://hov-team-tracker.vercel.app)
- **Vercel Settings File:** `.vercel/project.json`
- **Vercel CLI Configuration:**
  - Remote environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) are already set and synced in Vercel Production.

### Deployment Method
The project does **not** rely on slow or unlinked Git webhooks. Deployments are triggered via the automated script:
```powershell
python scripts/deploy_vercel.py
```
This script reads `VERCEL_TOKEN` from `.env.local` and executes:
```powershell
npx vercel --token <VERCEL_TOKEN> --prod --yes
```

---

## 5. GitHub Repository Details

- **Remote Origin:** `https://github.com/popeyexz/hov-team-operations-tracker.git`
- **Primary Branches:**
  - `master` — Default branch containing all latest production commits.
  - `main` — Mirror branch kept in sync.
- **Git Push Commands:**
```powershell
git push origin master
git push origin master:main
```

---

## 6. Key Architecture & Features

1. **Framework:** Next.js 15 (App Router, Server Actions, TypeScript, Tailwind CSS).
2. **Landing Page (`/`):**
   - Netflix-style Profile Grid (`components/auth/ProfileGrid.tsx`).
   - Profile selection sets cookie (`hov_active_slug`) and `localStorage` to switch views instantly.
3. **Daily Operations & Tasks Cockpit (`/daily-work`):**
   - **Founder Mode:** Full visibility into all 13 ventures, all member tasks, dynamic venture reassignment, and two-stage review approvals.
   - **Member Mode:** Filtered strictly to ventures led by that member and tasks specifically assigned to them (including cross-venture delegations).
4. **Excel Import Engine:**
   - 1-Click modal to parse and import `PS.HOV_Work_Tracker.xlsx` (`components/import/ExcelImportModal.tsx`).
5. **Database Seeder & Utilities (`scripts/`):**
   - `scripts/seed_from_excel.py`: Synchronizes the 73 authentic objectives from Excel into Supabase.
   - `scripts/check_db_state.py`: Rapid audit of Supabase tables and record counts.
   - `scripts/deploy_vercel.py`: Zero-config production deployment to Vercel.
   - `tests/e2e/test_system.py`: 14 comprehensive end-to-end integration tests.

---

## 7. Developer & Maintenance Cheatsheet

### 1. Run Locally
```powershell
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Verify Production Build
```powershell
npm run build
```

### 3. Run E2E Test Suite
```powershell
python tests/e2e/test_system.py
```

### 4. Deploy to Production Vercel
```powershell
python scripts/deploy_vercel.py
```

### 5. Push to GitHub
```powershell
git add .
git commit -m "your commit message"
git push origin master
git push origin master:main
```
