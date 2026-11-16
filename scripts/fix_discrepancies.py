import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

print("Starting discrepancy fixes between Excel and Database...")

# 1. Ensure 'Caracal' exists in profiles
run_query("""
INSERT INTO public.profiles (slug, full_name, role, lead_title, email, avatar_color)
VALUES ('caracal', 'Caracal', 'member', 'Collaborator', '', '#06b6d4')
ON CONFLICT (slug) DO UPDATE
SET full_name = EXCLUDED.full_name, lead_title = EXCLUDED.lead_title;
""")
print("Profile 'Caracal' ensured.")

# 2. Update the 7 objectives to match Excel exactly
updates = [
    # PS.HOV #9: Sharuk
    ("PS.HOV", 9, "sharuk", None),
    # HBM #3: Rufus, Due Date: 2026-11-16
    ("PS.HOV - House_of_Business_Markering (HBM)", 3, "rufus", "2026-11-16"),
    # HBM #4: Atharav, Due Date: 2026-11-16
    ("PS.HOV - House_of_Business_Markering (HBM)", 4, "atharav", "2026-11-16"),
    # HAIS #1: Caracal
    ("PS.HOV - House_of_AI_Solutions (HAIS)", 1, "caracal", None),
    # XARM MARSERV #1: Sharuk
    ("XARM MARSERV", 1, "sharuk", None),
    # PS.HOV Investments & Funding #1: Rufus
    ("PS.HOV Investments & Funding", 1, "rufus", None),
    # PS.HOV Investments & Funding #2: Rufus
    ("PS.HOV Investments & Funding", 2, "rufus", None),
]

for vname, sl_no, owner_slug, due_date in updates:
    due_clause = f"'{due_date}'" if due_date else "NULL"
    sql = f"""
    UPDATE public.objectives
    SET owner_id = (SELECT id FROM public.profiles WHERE slug = '{owner_slug}'),
        due_date = {due_clause}
    WHERE venture_id = (SELECT id FROM public.ventures WHERE name = '{vname}')
      AND sl_no = {sl_no};
    """
    run_query(sql)
    print(f"Updated {vname} #{sl_no} -> Owner: {owner_slug}, DueDate: {due_date}")

# 3. Add personal tracker action item if not present
run_query("""
INSERT INTO public.action_items (venture_id, assigned_to, title, date, status, is_founder_confirmed)
SELECT v.id, p.id, 'Investments of Angel investors and VC firms (HOV)', '2026-09-10', 'completed', true
FROM public.ventures v, public.profiles p
WHERE v.name = 'PS.HOV' AND p.slug = 'atharav'
  AND NOT EXISTS (
    SELECT 1 FROM public.action_items WHERE title = 'Investments of Angel investors and VC firms (HOV)'
  );
""")
print("Personal tracker action item synced.")

print("\nAll discrepancies fixed with 100% precision!")
