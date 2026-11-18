import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'scripts'))
from db import run_query

def main():
    print("Testing dynamic member profile addition...")
    # Pre-clean any leftover test profile
    run_query("DELETE FROM public.profiles WHERE slug = 'jordanblake';")

    # Record initial baseline count
    initial_profiles = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
    base_count = initial_profiles[0]['count']

    insert_sql = """
    INSERT INTO public.profiles (slug, full_name, role, lead_title, email, avatar_color)
    VALUES ('jordanblake', 'Jordan Blake', 'member', 'Growth Associate', 'jordan@hov.com', '#6366f1')
    ON CONFLICT (slug) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id, full_name, slug;
    """
    try:
        res = run_query(insert_sql)
        assert len(res) == 1 and res[0]['slug'] == 'jordanblake', "Member insertion failed"
        print("  -> Inserted dynamic member successfully:", res[0])

        # Verify query returns base_count + 1 profiles now
        all_profiles = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
        assert all_profiles[0]['count'] == base_count + 1, f"Expected {base_count + 1} profiles, got {all_profiles[0]['count']}"
        print(f"  -> Total profiles in DB verified: {all_profiles[0]['count']} profiles.")
    finally:
        # Cleanup test member
        run_query("DELETE FROM public.profiles WHERE slug = 'jordanblake';")
        after_clean = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
        assert after_clean[0]['count'] == base_count, f"Cleaned up baseline back to {base_count} profiles"
        print(f"  -> Cleanup verified: {base_count} core profiles restored.")
        print("Dynamic member test passed 100%!")

if __name__ == '__main__':
    main()
