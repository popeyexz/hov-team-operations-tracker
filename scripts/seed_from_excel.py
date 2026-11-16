import openpyxl
import urllib.request
import json
import re
import os

def load_env():
    env = {}
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k.strip()] = v.strip()
    return env

ENV = load_env()
TOKEN = ENV.get('SUPABASE_ACCESS_TOKEN') or os.environ.get('SUPABASE_ACCESS_TOKEN', '')
PROJECT_REF = 'qglghldegdikwjzileno'
QUERY_URL = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query'

def run_query(sql):
    req = urllib.request.Request(
        QUERY_URL,
        data=json.dumps({'query': sql}).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {TOKEN}',
            'Content-Type': 'application/json'
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    s = str(val).replace("'", "''")
    return f"'{s}'"

def main():
    print("Starting fast batched database seeding...", flush=True)

    # 1. Seed Profiles
    profiles_data = [
        ('pratap', 'Pratap', 'founder', 'Founder', 'houseofventures.dev@gmail.com', '#ef4444'),
        ('atharav', 'Atharav', 'member', 'Venture Lead', '', '#3b82f6'),
        ('sharuk', 'Sharuk', 'member', 'Venture Lead', '', '#8b5cf6'),
        ('rufus', 'Rufus', 'member', 'Venture Lead', '', '#10b981'),
        ('shristy', 'Shristy', 'member', 'Collaborator', '', '#ec4899'),
        ('sarth', 'Sarth', 'member', 'Collaborator', '', '#f59e0b'),
        ('rohini', 'Rohini', 'member', 'Collaborator', '', '#06b6d4'),
    ]

    profile_sqls = []
    for slug, name, role, lead_title, email, color in profiles_data:
        profile_sqls.append(f"""
        INSERT INTO public.profiles (slug, full_name, role, lead_title, email, avatar_color)
        VALUES ('{slug}', '{name}', '{role}', '{lead_title}', '{email}', '{color}')
        ON CONFLICT (slug) DO UPDATE 
        SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, lead_title = EXCLUDED.lead_title, avatar_color = EXCLUDED.avatar_color;
        """)
    run_query("\n".join(profile_sqls))
    print("Profiles seeded.", flush=True)

    # Get profile id map
    profiles_res = run_query("SELECT id, slug, full_name FROM public.profiles;")
    profile_by_slug = {p['slug']: p['id'] for p in profiles_res}
    profile_by_name = {p['full_name'].strip().lower(): p['id'] for p in profiles_res}

    # 2. Seed Ventures (13 Ventures)
    ventures_meta = [
        ('PS.HOV', 'HOV', 'atharav', 'Venture Lead', 'Core holding company and central operations hub', 1),
        ('PS.HOV - House_of_Business_Markering (HBM)', 'HBM', 'rufus', 'Venture Lead', 'B2B marketing, growth hacking, and business development wing', 2),
        ('PS.HOV - House_of_AI_Solutions (HAIS)', 'HAIS', 'sharuk', 'Venture Lead', 'Artificial Intelligence solutions, automation systems, and applied AI labs', 3),
        ('XARM MARSERV', 'XARM', 'atharav', 'Venture Lead', 'Marketing services, performance marketing, and creative production', 4),
        ('Impactshaala', 'IMP', 'atharav', 'Venture Lead', 'Social impact education, youth empowerment, and career acceleration', 5),
        ('GUIDESHAALA', 'GUIDE', 'sharuk', 'Venture Lead', 'Mentorship platform, career guidance, and executive coaching network', 6),
        ('PulseEvents', 'PULSE', 'sharuk', 'Venture Lead', 'Corporate summits, tech conferences, and networking events production', 7),
        ('NxtGen Impact', 'NXT', 'atharav', 'NGO Lead', 'Next generation community development, CSR partnerships, and non-profit initiatives', 8),
        ('CreativeTech', 'CRTECH', 'sharuk', 'Tool Lead', 'Creative design technology tools, templates, and UI/UX assets', 9),
        ('LeadTech', 'LDTECH', 'atharav', 'Tool Lead', 'Lead generation intelligence, outreach automation, and sales tech tools', 10),
        ('Law Offices of Mary Kennedy', 'LOMK', 'rufus', 'Venture Lead', 'Legal advisory, contract scaffolding, and cross-border compliance', 11),
        ('Point Square Realty', 'PSR', 'sharuk', 'Venture Lead', 'Commercial real estate advisory, property acquisition, and leasing', 12),
        ('PS.HOV Investments & Funding', 'HIF', 'rufus', 'Program Lead', 'Angel investor syndicates, venture capital outreach, and startup funding programs', 13),
    ]

    venture_sqls = []
    for name, code, lead_slug, lead_title, desc, order in ventures_meta:
        lead_id = profile_by_slug.get(lead_slug)
        venture_sqls.append(f"""
        INSERT INTO public.ventures (name, code, lead_id, lead_title, description, display_order)
        VALUES ({escape_sql(name)}, {escape_sql(code)}, {escape_sql(lead_id)}, {escape_sql(lead_title)}, {escape_sql(desc)}, {order})
        ON CONFLICT (name) DO UPDATE 
        SET code = EXCLUDED.code, lead_id = EXCLUDED.lead_id, lead_title = EXCLUDED.lead_title, description = EXCLUDED.description, display_order = EXCLUDED.display_order;
        """)
    run_query("\n".join(venture_sqls))
    print("Ventures seeded.", flush=True)

    # Get venture id map
    ventures_res = run_query("SELECT id, name FROM public.ventures;")
    venture_map = {v['name'].strip(): v['id'] for v in ventures_res}

    # 3. Seed Objectives from PS.HOV_Work_Tracker.xlsx
    wb = openpyxl.load_workbook('PS.HOV_Work_Tracker.xlsx', data_only=True)
    sheet = wb['Objectives by Ventures']
    col = 1
    total_objs_seeded = 0

    run_query("DELETE FROM public.action_items; DELETE FROM public.key_results; DELETE FROM public.objectives;")

    objective_value_clauses = []

    while col <= sheet.max_column:
        vname = sheet.cell(1, col).value
        if vname and vname.strip() in venture_map:
            v_id = venture_map[vname.strip()]
            for r in range(4, sheet.max_row + 1):
                sl = sheet.cell(r, col).value
                title = sheet.cell(r, col+1).value
                status_raw = sheet.cell(r, col+2).value
                owner_raw = sheet.cell(r, col+4).value
                due_raw = sheet.cell(r, col+5).value
                comments_raw = sheet.cell(r, col+6).value

                if sl is not None and title is not None and str(title).strip():
                    sl_no = int(sl) if isinstance(sl, (int, float)) else 1
                    title_str = str(title).strip()
                    
                    status_clean = 'no_krs'
                    if status_raw:
                        s_lower = str(status_raw).lower().replace('-', '_').replace(' ', '_')
                        if 'completed' in s_lower:
                            status_clean = 'completed'
                        elif 'blocker' in s_lower:
                            status_clean = 'blocker'
                        elif 'on_hold' in s_lower:
                            status_clean = 'on_hold'
                        elif 'pending' in s_lower:
                            status_clean = 'pending'
                        elif 'dropped' in s_lower:
                            status_clean = 'dropped'

                    owner_id = None
                    if owner_raw:
                        owner_clean = str(owner_raw).strip().lower()
                        owner_id = profile_by_name.get(owner_clean)

                    due_date = None
                    if due_raw:
                        if hasattr(due_raw, 'strftime'):
                            due_date = due_raw.strftime('%Y-%m-%d')
                        elif isinstance(due_raw, str) and re.match(r'^\d{4}-\d{2}-\d{2}', due_raw):
                            due_date = due_raw[:10]

                    comments_str = str(comments_raw).strip() if comments_raw else ''

                    objective_value_clauses.append(f"""
                    ('{v_id}', {sl_no}, {escape_sql(title_str)}, '{status_clean}', {escape_sql(owner_id)}, {escape_sql(due_date)}, {escape_sql(comments_str)})
                    """)
                    total_objs_seeded += 1
        col += 8

    if objective_value_clauses:
        batch_insert_sql = f"""
        INSERT INTO public.objectives (venture_id, sl_no, title, status, owner_id, due_date, comments)
        VALUES {','.join(objective_value_clauses)};
        """
        run_query(batch_insert_sql)

    print(f"Objectives seeded: {total_objs_seeded}", flush=True)

    # 4. Seed Initial Key Results & Action Items
    hov_v_id = venture_map.get('PS.HOV')
    objs_res = run_query(f"SELECT id, venture_id, sl_no, title FROM public.objectives WHERE venture_id = '{hov_v_id}' ORDER BY sl_no LIMIT 2;")
    if objs_res:
        first_obj = objs_res[0]
        atharav_id = profile_by_slug.get('atharav')
        sharuk_id = profile_by_slug.get('sharuk')
        rufus_id = profile_by_slug.get('rufus')
        pratap_id = profile_by_slug.get('pratap')

        kr_sql = f"""
        INSERT INTO public.key_results (objective_id, venture_id, kr_code, title, target_measure, status, owner_id, due_date)
        VALUES 
        ('{first_obj['id']}', '{first_obj['venture_id']}', '1.1', 'Complete Next.js frontend and admin panel', '100% features deployed', 'pending', '{atharav_id}', '2026-11-30'),
        ('{first_obj['id']}', '{first_obj['venture_id']}', '1.2', 'Connect domain and SSL certificate', 'Live HTTPS URL verified', 'completed', '{sharuk_id}', '2026-11-20')
        RETURNING id, kr_code;
        """
        krs = run_query(kr_sql)
        kr1_id = next(k['id'] for k in krs if k['kr_code'] == '1.1')
        kr2_id = next(k['id'] for k in krs if k['kr_code'] == '1.2')

        run_query(f"UPDATE public.objectives SET status = 'pending' WHERE id = '{first_obj['id']}';")

        action_sql = f"""
        INSERT INTO public.action_items (venture_id, objective_id, key_result_id, title, assigned_to, date, status, is_member_completed, is_founder_confirmed, outcome_achieved, is_planned, comments)
        VALUES 
        ('{first_obj['venture_id']}', '{first_obj['id']}', '{kr1_id}', 'Develop responsive liquid glass profile switcher and global navigation', '{atharav_id}', '2026-11-16', 'submitted_for_review', true, false, 'Profile selector screen built with passwordless switcher, glass styling, and modal email collection.', false, 'Ready for Founder review.'),
        ('{first_obj['venture_id']}', '{first_obj['id']}', '{kr1_id}', 'Configure multi-channel email alerts via transactional Resend / SMTP API', '{rufus_id}', '2026-11-17', 'needs_work', true, false, 'Setup email template for task reviews.', false, 'Founder requested fallback SMTP credentials verification.'),
        ('{first_obj['venture_id']}', '{first_obj['id']}', '{kr1_id}', 'Verify cross-venture visibility and seed all 73 objectives from Excel', '{sharuk_id}', '2026-11-18', 'in_progress', false, false, '', false, ''),
        ('{first_obj['venture_id']}', '{first_obj['id']}', '{kr2_id}', 'Deploy database schema and verify Supabase storage bucket', '{sharuk_id}', '2026-11-16', 'completed', true, true, 'Tables and RLS policies created, venture-documents bucket active.', false, ''),
        ('{first_obj['venture_id']}', '{first_obj['id']}', NULL, 'Conduct quarterly cross-venture retrospective and review OKR completion targets', '{atharav_id}', '2026-12-05', 'not_started', false, false, '', true, 'Scheduled forward initiative for December.')
        RETURNING id, title;
        """
        created_actions = run_query(action_sql)
        ai1_id = next(a['id'] for a in created_actions if 'Develop responsive' in a['title'])
        ai2_id = next(a['id'] for a in created_actions if 'Configure multi-channel' in a['title'])

        logs_sql = f"""
        INSERT INTO public.task_activity_log (action_item_id, actor_id, action, content)
        VALUES 
        ('{ai1_id}', '{atharav_id}', 'submission', 'Marked complete and submitted for Founder review: Profile selector screen built with passwordless switcher.'),
        ('{ai2_id}', '{rufus_id}', 'submission', 'Submitted review request for email template configuration.'),
        ('{ai2_id}', '{pratap_id}', 'feedback', 'Please verify fallback SMTP credentials and test with test@example.com before final approval.');
        """
        run_query(logs_sql)

        # In-app notifications
        notifs_sql = f"""
        INSERT INTO public.in_app_notifications (recipient_id, actor_id, action_item_id, type, title, message)
        VALUES
        ('{pratap_id}', '{atharav_id}', '{ai1_id}', 'submitted_for_review', 'Task Submitted for Review', 'Atharav submitted: Develop responsive liquid glass profile switcher'),
        ('{rufus_id}', '{pratap_id}', '{ai2_id}', 'needs_work', 'Changes Requested', 'Pratap requested revisions: Configure multi-channel email alerts');
        """
        run_query(notifs_sql)

    print("Sample KRs, Action Items, Activity Log, and Notifications seeded.", flush=True)
    print("Database seeding completed successfully!", flush=True)

if __name__ == '__main__':
    main()
