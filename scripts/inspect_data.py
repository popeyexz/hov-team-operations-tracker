import sys
sys.path.insert(0, 'scripts')
from db import run_query

print('Sample Objectives:')
objs = run_query("SELECT id, sl_no, title, status FROM public.objectives LIMIT 15;")
for o in objs:
    print(f"[{o['sl_no']}] {o['title']} ({o['status']})")
