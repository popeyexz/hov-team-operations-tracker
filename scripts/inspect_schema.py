import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

print("=== action_items columns ===")
for col in run_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'action_items';"):
    print(f"  {col['column_name']} ({col['data_type']})")

print("\n=== ventures columns ===")
for col in run_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ventures';"):
    print(f"  {col['column_name']} ({col['data_type']})")

print("\n=== profiles columns ===")
for col in run_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';"):
    print(f"  {col['column_name']} ({col['data_type']})")
