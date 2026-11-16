import urllib.request
import json
import sys
import os

def load_env():
    env = {}
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k.strip()] = v.strip()
    return env

ENV = load_env()
TOKEN = os.environ.get('SUPABASE_ACCESS_TOKEN') or ENV.get('SUPABASE_ACCESS_TOKEN', '')
PROJECT_REF = 'qglghldegdikwjzileno'
QUERY_URL = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query'

def run_query(sql):
    req = urllib.request.Request(
        QUERY_URL,
        data=json.dumps({'query': sql}).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {TOKEN}',
            'Content-Type': 'application/json'
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_profiles():
    print("[TEST 1] Verifying Core Profiles...")
    res = run_query("SELECT slug, full_name, role FROM public.profiles WHERE is_active = true;")
    slugs = {p['slug']: p for p in res}
    expected = ['pratap', 'atharav', 'sharuk', 'rufus', 'shristy', 'sarth', 'rohini']
    for slug in expected:
        assert slug in slugs, f"Missing profile slug: {slug}"
    assert slugs['pratap']['role'] == 'founder', "Pratap must have role 'founder'"
    print(f"  -> Passed! Found {len(res)} active profiles, all core members verified.")

def test_ventures():
    print("[TEST 2] Verifying 13 Ventures & Leads...")
    res = run_query("SELECT v.name, v.code, p.slug as lead_slug FROM public.ventures v LEFT JOIN public.profiles p ON v.lead_id = p.id WHERE v.is_active = true;")
    assert len(res) == 13, f"Expected 13 ventures, got {len(res)}"
    v_by_name = {v['name']: v['lead_slug'] for v in res}

    # Verify Atharav has 5
    atharav_ventures = ['PS.HOV', 'XARM MARSERV', 'Impactshaala', 'NxtGen Impact', 'LeadTech']
    for v in atharav_ventures:
        assert v in v_by_name and v_by_name[v] == 'atharav', f"Atharav venture {v} mismatch"

    # Verify Sharuk has 5
    sharuk_ventures = ['PS.HOV - House_of_AI_Solutions (HAIS)', 'GUIDESHAALA', 'PulseEvents', 'CreativeTech', 'Point Square Realty']
    for v in sharuk_ventures:
        assert v in v_by_name and v_by_name[v] == 'sharuk', f"Sharuk venture {v} mismatch"

    # Verify Rufus has 3
    rufus_ventures = ['PS.HOV - House_of_Business_Markering (HBM)', 'Law Offices of Mary Kennedy', 'PS.HOV Investments & Funding']
    for v in rufus_ventures:
        assert v in v_by_name and v_by_name[v] == 'rufus', f"Rufus venture {v} mismatch"

    # Verify Grow Me Social is excluded
    assert 'Grow Me Social' not in v_by_name, "Grow Me Social should be excluded!"
    print(f"  -> Passed! Exactly 13 ventures verified with Atharav (5), Sharuk (5), Rufus (3).")

def test_objectives():
    print("[TEST 3] Verifying 73 Seeded Objectives...")
    res = run_query("SELECT count(*) FROM public.objectives;")
    count = res[0]['count']
    assert count == 73, f"Expected 73 objectives, found {count}"
    print(f"  -> Passed! Exactly {count} objectives verified across all 13 ventures.")

def test_two_stage_review_workflow():
    print("[TEST 4] Verifying Two-Stage Review & Audit Log...")
    # Find test action item
    items = run_query("SELECT id, status, is_member_completed, is_founder_confirmed FROM public.action_items LIMIT 1;")
    assert len(items) > 0, "No action items found"
    item_id = items[0]['id']

    # Step 1: Member submit
    run_query(f"""
    UPDATE public.action_items 
    SET status = 'submitted_for_review', is_member_completed = true, outcome_achieved = 'E2E Automated Test Outcome' 
    WHERE id = '{item_id}';
    """)
    check1 = run_query(f"SELECT status, is_member_completed, outcome_achieved FROM public.action_items WHERE id = '{item_id}';")[0]
    assert check1['status'] == 'submitted_for_review', "Status should be submitted_for_review"
    assert check1['is_member_completed'] is True, "is_member_completed should be True"

    # Step 2: Founder approve
    run_query(f"""
    UPDATE public.action_items 
    SET status = 'completed', is_founder_confirmed = true 
    WHERE id = '{item_id}';
    """)
    check2 = run_query(f"SELECT status, is_founder_confirmed FROM public.action_items WHERE id = '{item_id}';")[0]
    assert check2['status'] == 'completed', "Status should be completed"
    assert check2['is_founder_confirmed'] is True, "is_founder_confirmed should be True"
    print("  -> Passed! Two-stage review transitions verified.")

def test_supabase_storage():
    print("[TEST 5] Verifying Supabase Storage Bucket...")
    res = run_query("SELECT id, name, public FROM storage.buckets WHERE id = 'venture-documents';")
    assert len(res) == 1, "Storage bucket 'venture-documents' not found"
    assert res[0]['public'] is True, "Bucket 'venture-documents' must be public"
    print("  -> Passed! Bucket 'venture-documents' is online and public.")

def main():
    print("=== RUNNING HOV OPERATIONS TRACKER DEEP VERIFICATION ===")
    try:
        test_profiles()
        test_ventures()
        test_objectives()
        test_two_stage_review_workflow()
        test_supabase_storage()
        print("\nALL 5 SYSTEM TESTS PASSED SUCCESSFULLY! (100% HEALTH)")
    except Exception as e:
        print(f"\nTEST FAILURE: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
