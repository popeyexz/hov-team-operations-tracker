# HOV Team Operations & Personal Work Tracker

Responsive, liquid-glass team operations and OKR operating system built for House of Ventures (HOV), managing **13 ventures across 7 core members** (Founder Pratap + 6 Team Members) with dynamic member addition, automated Red/Amber/Green health engine, cross-venture visibility, per-venture asset storage, and multi-channel notifications.

---

## 🌟 Key Architecture & Highlights

- **Framework**: Next.js 15+ (App Router, React 19, TypeScript, Server Actions)
- **Database & Storage**: Supabase PostgreSQL with RLS & Supabase Storage bucket (`venture-documents`)
- **Styling**: Tailwind CSS v4 with liquid glassmorphism (`backdrop-blur-md`, subtle border glows)
- **Authentication**: Netflix-style passwordless profile switcher (`/`) with first-time notification email prompt
- **Push & Alerts**: Web Push API (PWA + Service Worker) & transactional email notifications

---

## 🏢 13 Core Ventures & Leads

1. **PS.HOV** — *Venture Lead: Atharav*
2. **PS.HOV - House_of_Business_Markering (HBM)** — *Venture Lead: Rufus*
3. **PS.HOV - House_of_AI_Solutions (HAIS)** — *Venture Lead: Sharuk*
4. **XARM MARSERV** — *Venture Lead: Atharav*
5. **Impactshaala** — *Venture Lead: Atharav*
6. **GUIDESHAALA** — *Venture Lead: Sharuk*
7. **PulseEvents** — *Venture Lead: Sharuk*
8. **NxtGen Impact** — *NGO Lead: Atharav*
9. **CreativeTech** — *Tool Lead: Sharuk*
10. **LeadTech** — *Tool Lead: Atharav*
11. **Law Offices of Mary Kennedy** — *Venture Lead: Rufus*
12. **Point Square Realty** — *Venture Lead: Sharuk*
13. **PS.HOV Investments & Funding** — *Program Lead: Rufus*

*Note: 'Grow Me Social' is strictly excluded from the venture scope as specified.*

**Active Collaborators Across All Ventures**: Shristy, Sarth, Rohini.

---

## 🚀 Key Functional Capabilities

1. **Netflix-Style Profile Switcher**:
   - Zero PINs, zero passwords for internal team speed.
   - Profile cards for Pratap (Founder), Atharav, Sharuk, Rufus, Shristy, Sarth, Rohini, plus `+ Add Member` card to dynamically onboard team members.
   - First-time email prompt to register notification email; easily editable via header dropdown anytime.
   - Founder "View As" toggle in header to view any member's isolated view or master operational view.

2. **Tab 1: Daily Work & OKR Hierarchy**:
   - 4-Tier Hierarchy: Venture → Objectives (73 seeded from Excel) → Key Results → Action Items.
   - Dual view modes: Group by Venture Lead vs Group by individual Venture.
   - Automatic Cross-Venture Surfacing: Any assigned action item, objective, or KR causes that venture to appear in the member's assigned workspace.
   - Two-Stage Review Protocol: Member completes task and writes "Outcome Achieved" → status moves to `Submitted for Review` → Founder approves as `Completed` or requests changes as `Needs Work` with feedback.
   - Threaded Feedback Log: Chronological audit trail for every task recording submissions, reviews, and feedback with timestamps.
   - Date Standard: Strict `DD-MM-YYYY` interactive date picker across all inputs and tables.

3. **Venture Document & Asset Uploads**:
   - Per-venture document drawer connected to Supabase Storage `venture-documents` bucket.
   - Upload pitch decks, agreements, spreadsheets, brand guidelines with instant download links.

4. **Tab 2: Next Plans (Forward Planning)**:
   - Timeline of future scheduled initiatives and prospective OKRs.
   - One-click "Promote to Daily Work" button that converts planned items into active daily tasks on Tab 1.

5. **Tab 3: Progress Analytics & Health Suite**:
   - Automated Red / Amber / Green Venture Health:
     - 🔴 **Red**: Any blocker or overdue item.
     - 🟡 **Amber**: Items due within 7 days or on-hold.
     - 🟢 **Green**: On track.
   - Portfolio Snapshot KPI cards.
   - Focus Scorecard Selector for any Venture or Member.
   - Progress by Venture matrix (all 13 ventures).
   - Progress by Team Member matrix (Atharav, Sharuk, Rufus, Shristy, Sarth, Rohini).
   - Planning Gaps Finder (missing owners, due dates, or KRs).
   - Rolling 8-Week Trend table.

---

## 🛠️ Verification & Seeding

- Seeder script: `python scripts/seed_from_excel.py` (seeds 7 core profiles, 13 ventures, all 73 objectives from `PS.HOV_Work_Tracker.xlsx`, initial KRs, and action items).
- Automated test suite: `python tests/e2e/test_system.py`
