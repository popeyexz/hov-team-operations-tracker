import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

def main():
    founder_rows = run_query("SELECT id, full_name, role FROM public.profiles WHERE role = 'founder' LIMIT 1;")
    if not founder_rows:
        print("Error: No founder found!")
        return
    founder = founder_rows[0]
    print(f"Setting all objectives owner to Founder: {founder['full_name']} ({founder['id']})")
    
    run_query(f"UPDATE public.objectives SET owner_id = '{founder['id']}';")
    
    check = run_query("SELECT p.full_name, p.role, count(*) FROM public.objectives o JOIN public.profiles p ON o.owner_id = p.id GROUP BY p.full_name, p.role;")
    print("Verification result:", check)

if __name__ == '__main__':
    main()
