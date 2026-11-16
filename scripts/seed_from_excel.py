import openpyxl
import re
import os
import sys

try:
    from db import run_query
except ImportError:
    from scripts.db import run_query

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
        ('PS.HOV', 'HOV', 'atharav', 'Venture Lead', None, 1),
        ('PS.HOV - House_of_Business_Markering (HBM)', 'HBM', 'rufus', 'Venture Lead', None, 2),
        ('PS.HOV - House_of_AI_Solutions (HAIS)', 'HAIS', 'sharuk', 'Venture Lead', None, 3),
        ('XARM MARSERV', 'XARM', 'atharav', 'Venture Lead', None, 4),
        ('Impactshaala', 'IMP', 'atharav', 'Venture Lead', None, 5),
        ('GUIDESHAALA', 'GUIDE', 'sharuk', 'Venture Lead', None, 6),
        ('PulseEvents', 'PULSE', 'sharuk', 'Venture Lead', None, 7),
        ('NxtGen Impact', 'NXT', 'atharav', 'NGO Lead', None, 8),
        ('CreativeTech', 'CRTECH', 'sharuk', 'Tool Lead', None, 9),
        ('LeadTech', 'LDTECH', 'atharav', 'Tool Lead', None, 10),
        ('Law Offices of Mary Kennedy', 'LOMK', 'rufus', 'Venture Lead', None, 11),
        ('Point Square Realty', 'PSR', 'sharuk', 'Venture Lead', None, 12),
        ('PS.HOV Investments & Funding', 'HIF', 'rufus', 'Program Lead', None, 13),
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

                    # Objectives can ONLY be issued/owned by the Founder
                    owner_id = profile_by_slug.get('pratap')

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

    # Seed baseline KRs across all 13 ventures
    try:
        from seed_baseline_krs import main as seed_krs_main
        seed_krs_main()
    except Exception as e:
        print(f"Notice: seed_baseline_krs: {e}")

    print("Database seeding from Excel completed successfully! (Zero mock data seeded)", flush=True)

if __name__ == '__main__':
    main()
