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

def run_query(sql):
    req = urllib.request.Request(
        url,
        data=json.dumps({'query': sql}).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def main():
    print("Testing dynamic member profile addition...")
    insert_sql = """
    INSERT INTO public.profiles (slug, full_name, role, lead_title, email, avatar_color)
    VALUES ('jordanblake', 'Jordan Blake', 'member', 'Growth Associate', 'jordan@hov.com', '#6366f1')
    ON CONFLICT (slug) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id, full_name, slug;
    """
    res = run_query(insert_sql)
    assert len(res) == 1 and res[0]['slug'] == 'jordanblake', "Member insertion failed"
    print("  -> Inserted dynamic member successfully:", res[0])

    # Verify query returns 8 profiles now
    all_profiles = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
    assert all_profiles[0]['count'] == 8, f"Expected 8 profiles, got {all_profiles[0]['count']}"
    print("  -> Total profiles in DB verified: 8 profiles.")

    # Cleanup test member
    run_query("DELETE FROM public.profiles WHERE slug = 'jordanblake';")
    after_clean = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
    assert after_clean[0]['count'] == 7, "Cleaned up baseline back to 7 profiles"
    print("  -> Cleanup verified: 7 core profiles restored.")
    print("Dynamic member test passed 100%!")

if __name__ == '__main__':
    main()
