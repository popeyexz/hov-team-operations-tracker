import urllib.request
import json
import os

def load_env():
    env = {}
    if os.path.exists('.env.local'):
        with open('.env.local') as f:
            for l in f:
                if '=' in l and not l.startswith('#'):
                    k, v = l.strip().split('=', 1)
                    env[k.strip()] = v.strip()
    return env

env = load_env()
token = env.get('SUPABASE_ACCESS_TOKEN')
url = 'https://api.supabase.com/v1/projects/qglghldegdikwjzileno/database/query'

def query(sql):
    req = urllib.request.Request(
        url,
        data=json.dumps({'query': sql}).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())

print("--- VENTURES & OBJECTIVES ---")
ventures = query("SELECT v.id, v.name, v.code, count(o.id) as obj_count FROM public.ventures v LEFT JOIN public.objectives o ON v.id = o.venture_id GROUP BY v.id, v.name, v.code ORDER BY v.display_order;")
for v in ventures:
    print(f"[{v['code']}] {v['name']}: {v['obj_count']} objectives")
print("Total objectives in DB:", sum(v['obj_count'] for v in ventures))

print("\n--- KEY RESULTS ---")
krs = query("SELECT count(*) as count FROM public.key_results;")
print("Total KRs in DB:", krs[0]['count'])

print("\n--- ACTION ITEMS ---")
actions = query("SELECT count(*) as count, is_planned FROM public.action_items GROUP BY is_planned;")
for a in actions:
    print(f"Planned={a['is_planned']}: {a['count']} items")

print("\n--- PROFILES ---")
profiles = query("SELECT slug, full_name, role, lead_title, email FROM public.profiles ORDER BY role desc, full_name;")
for p in profiles:
    print(f"{p['slug']} ({p['full_name']}) - {p['role']} - {p['lead_title']} - Email: '{p['email']}'")
