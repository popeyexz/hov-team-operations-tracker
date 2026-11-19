import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

def main():
    run_query("DELETE FROM public.profiles WHERE slug IN ('e2etestmember', 'jordanblake');")
    res = run_query("SELECT count(*) FROM public.profiles WHERE is_active=true;")
    print("Cleaned up profiles. Active count:", res[0]['count'])

if __name__ == '__main__':
    main()
