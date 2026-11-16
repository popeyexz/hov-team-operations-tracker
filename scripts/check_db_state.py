import sys
import os

try:
    from db import run_query
except ImportError:
    from scripts.db import run_query

print("--- VENTURES & OBJECTIVES ---")
ventures = run_query("SELECT v.id, v.name, v.code, count(o.id) as obj_count FROM public.ventures v LEFT JOIN public.objectives o ON v.id = o.venture_id GROUP BY v.id, v.name, v.code, v.display_order ORDER BY v.display_order;")
for v in ventures:
    print(f"[{v['code']}] {v['name']}: {v['obj_count']} objectives")
print("Total objectives in DB:", sum(v['obj_count'] for v in ventures))

print("\n--- KEY RESULTS ---")
krs = run_query("SELECT count(*) as count FROM public.key_results;")
print("Total KRs in DB:", krs[0]['count'] if krs else 0)

print("\n--- ACTION ITEMS ---")
actions = run_query("SELECT count(*) as count, is_planned FROM public.action_items GROUP BY is_planned;")
for a in actions:
    print(f"Planned={a['is_planned']}: {a['count']} items")

print("\n--- PROFILES ---")
profiles = run_query("SELECT slug, full_name, role, lead_title, email FROM public.profiles ORDER BY role desc, full_name;")
for p in profiles:
    print(f"{p['slug']} ({p['full_name']}) - {p['role']} - {p['lead_title']} - Email: '{p['email']}'")
