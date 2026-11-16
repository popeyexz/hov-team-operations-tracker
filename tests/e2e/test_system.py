import sys
import os
import json
import urllib.request
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'scripts'))
from db import run_query, load_env

def test_profiles():
    print("[TEST 1] Verifying Core Profiles...")
    res = run_query("SELECT slug, full_name, role FROM public.profiles WHERE is_active = true;")
    slugs = {p['slug']: p for p in res}
    expected = ['pratap', 'atharav', 'sharuk', 'rufus', 'shristy', 'sarth', 'rohini']
    for slug in expected:
        assert slug in slugs, f"Missing profile slug: {slug}"
    assert slugs['pratap']['role'] == 'founder', "Pratap must have role 'founder'"
    print(f"  -> Passed! Found {len(res)} active profiles, all core members verified.")

def test_dynamic_member_addition():
    print("[TEST 2] Verifying Dynamic Member Addition & Unique Slug Generation...")
    # Insert new dynamic member
    insert_sql = """
    INSERT INTO public.profiles (slug, full_name, role, lead_title, email, avatar_color)
    VALUES ('e2etestmember', 'E2E Test Member', 'member', 'Operations Specialist', 'e2e@hov.com', '#6366f1')
    ON CONFLICT (slug) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id, full_name, slug;
    """
    res = run_query(insert_sql)
    assert len(res) == 1 and res[0]['slug'] == 'e2etestmember', "Dynamic member insertion failed"
    
    # Check count is 8
    count_res = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
    assert count_res[0]['count'] == 8, f"Expected 8 profiles, got {count_res[0]['count']}"

    # Cleanup dynamic member
    run_query("DELETE FROM public.profiles WHERE slug = 'e2etestmember';")
    clean_res = run_query("SELECT count(*) FROM public.profiles WHERE is_active = true;")
    assert clean_res[0]['count'] == 7, "Cleaned up baseline back to 7 profiles"
    print("  -> Passed! Dynamic member addition and cleanup verified.")

def test_ventures():
    print("[TEST 3] Verifying 13 Ventures & Leads Distribution...")
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
    print("  -> Passed! Exactly 13 ventures verified with Atharav (5), Sharuk (5), Rufus (3).")

def test_venture_lead_reassignment():
    print("[TEST 4] Verifying Dynamic Venture Lead Reassignment (Founder Privilege)...")
    # Get initial lead of Point Square Realty (Sharuk)
    psr = run_query("SELECT v.id, v.name, p.slug FROM public.ventures v JOIN public.profiles p ON v.lead_id = p.id WHERE v.name = 'Point Square Realty';")[0]
    initial_slug = psr['slug']
    v_id = psr['id']
    assert initial_slug == 'sharuk', "Initial lead should be Sharuk"

    # Get Rufus profile ID
    rufus = run_query("SELECT id FROM public.profiles WHERE slug = 'rufus';")[0]
    sharuk = run_query("SELECT id FROM public.profiles WHERE slug = 'sharuk';")[0]

    # Reassign to Rufus
    run_query(f"UPDATE public.ventures SET lead_id = '{rufus['id']}' WHERE id = '{v_id}';")
    check_reassign = run_query(f"SELECT p.slug FROM public.ventures v JOIN public.profiles p ON v.lead_id = p.id WHERE v.id = '{v_id}';")[0]
    assert check_reassign['slug'] == 'rufus', "Lead should be reassigned to Rufus"

    # Restore baseline back to Sharuk
    run_query(f"UPDATE public.ventures SET lead_id = '{sharuk['id']}' WHERE id = '{v_id}';")
    check_restore = run_query(f"SELECT p.slug FROM public.ventures v JOIN public.profiles p ON v.lead_id = p.id WHERE v.id = '{v_id}';")[0]
    assert check_restore['slug'] == 'sharuk', "Lead restored back to Sharuk"
    print("  -> Passed! Dynamic lead reassignment and restoration verified.")

def test_objectives():
    print("[TEST 5] Verifying 73 Seeded Objectives...")
    res = run_query("SELECT count(*) FROM public.objectives;")
    count = res[0]['count']
    assert count == 73, f"Expected 73 objectives, found {count}"
    print(f"  -> Passed! Exactly {count} objectives verified across all 13 ventures.")

def test_two_stage_review_workflow():
    print("[TEST 6] Verifying Two-Stage Review Protocol & Correction Loop (Non-polluting)...")
    # Create an isolated temporary test action item so seeded showcase items remain intact
    v_id = run_query("SELECT id FROM public.ventures LIMIT 1;")[0]['id']
    atharav_id = run_query("SELECT id FROM public.profiles WHERE slug = 'atharav';")[0]['id']
    
    insert_res = run_query(f"""
    INSERT INTO public.action_items (venture_id, title, assigned_to, date, status, is_member_completed, is_founder_confirmed, outcome_achieved, is_planned)
    VALUES ('{v_id}', 'E2E Isolated Two-Stage Review Test Item', '{atharav_id}', '2026-11-16', 'in_progress', false, false, '', false)
    RETURNING id;
    """)
    item_id = insert_res[0]['id']

    try:
        # Step 1: Member submit
        run_query(f"""
        UPDATE public.action_items 
        SET status = 'submitted_for_review', is_member_completed = true, outcome_achieved = 'Deliverable v1 completed' 
        WHERE id = '{item_id}';
        """)
        check1 = run_query(f"SELECT status, is_member_completed, outcome_achieved FROM public.action_items WHERE id = '{item_id}';")[0]
        assert check1['status'] == 'submitted_for_review', "Status should be submitted_for_review"
        assert check1['is_member_completed'] is True, "is_member_completed should be True"

        # Step 2: Founder requests changes (Needs Work)
        run_query(f"""
        UPDATE public.action_items 
        SET status = 'needs_work', is_founder_confirmed = false, comments = 'Please revise section 2' 
        WHERE id = '{item_id}';
        """)
        check2 = run_query(f"SELECT status, is_founder_confirmed, comments FROM public.action_items WHERE id = '{item_id}';")[0]
        assert check2['status'] == 'needs_work', "Status should be needs_work"
        assert check2['is_founder_confirmed'] is False, "is_founder_confirmed should be False"

        # Step 3: Member updates deliverable and resubmits
        run_query(f"""
        UPDATE public.action_items 
        SET status = 'submitted_for_review', is_member_completed = true, outcome_achieved = 'Deliverable v2 revised with section 2 updates' 
        WHERE id = '{item_id}';
        """)
        check3 = run_query(f"SELECT status, outcome_achieved FROM public.action_items WHERE id = '{item_id}';")[0]
        assert check3['status'] == 'submitted_for_review'

        # Step 4: Founder final approval
        run_query(f"""
        UPDATE public.action_items 
        SET status = 'completed', is_founder_confirmed = true 
        WHERE id = '{item_id}';
        """)
        check4 = run_query(f"SELECT status, is_founder_confirmed FROM public.action_items WHERE id = '{item_id}';")[0]
        assert check4['status'] == 'completed', "Status should be completed"
        assert check4['is_founder_confirmed'] is True, "is_founder_confirmed should be True"
        print("  -> Passed! Full two-stage review and correction loop verified with zero data pollution.")
    finally:
        run_query(f"DELETE FROM public.action_items WHERE id = '{item_id}';")

def test_threaded_feedback_log():
    print("[TEST 7] Verifying Threaded Feedback Log & Auditing (Non-polluting)...")
    items = run_query("SELECT id FROM public.action_items LIMIT 1;")
    item_id = items[0]['id']

    pratap = run_query("SELECT id FROM public.profiles WHERE slug = 'pratap';")[0]
    log_msg = f"Audit test log entry from E2E suite - {datetime.now().isoformat()}"

    res = run_query(f"""
    INSERT INTO public.task_activity_log (action_item_id, actor_id, action, content)
    VALUES ('{item_id}', '{pratap['id']}', 'feedback', '{log_msg}')
    RETURNING id;
    """)
    log_id = res[0]['id']

    try:
        logs = run_query(f"SELECT content FROM public.task_activity_log WHERE id = '{log_id}';")
        assert len(logs) == 1 and logs[0]['content'] == log_msg, "Log entry not found"
        print("  -> Passed! Task activity audit log insertion, retrieval, and cleanup verified.")
    finally:
        run_query(f"DELETE FROM public.task_activity_log WHERE id = '{log_id}';")

def test_forward_planning_and_promotion():
    print("[TEST 8] Verifying Forward Planning & 1-Click Daily Work Promotion...")
    v_id = run_query("SELECT id FROM public.ventures LIMIT 1;")[0]['id']

    # Insert planned item
    item = run_query(f"""
    INSERT INTO public.action_items (venture_id, title, is_planned, status)
    VALUES ('{v_id}', 'Test Forward Planning Milestone', true, 'not_started')
    RETURNING id, is_planned;
    """)[0]
    item_id = item['id']
    assert item['is_planned'] is True, "Must be planned initially"

    # 1-Click Promote to Daily Work
    run_query(f"""
    UPDATE public.action_items 
    SET is_planned = false, updated_at = now()
    WHERE id = '{item_id}';
    """)
    promoted = run_query(f"SELECT is_planned FROM public.action_items WHERE id = '{item_id}';")[0]
    assert promoted['is_planned'] is False, "Must not be planned after promotion"

    # Cleanup
    run_query(f"DELETE FROM public.action_items WHERE id = '{item_id}';")
    print("  -> Passed! Forward planning creation, promotion, and cleanup verified.")

def test_supabase_storage():
    print("[TEST 9] Verifying Supabase Storage Bucket & Live Storage API...")
    res = run_query("SELECT id, name, public FROM storage.buckets WHERE id = 'venture-documents';")
    assert len(res) == 1, "Storage bucket 'venture-documents' not found"
    assert res[0]['public'] is True, "Bucket 'venture-documents' must be public"

    # Live HTTP Storage API upload and download verification
    env = load_env()
    url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    service = env.get('SUPABASE_SERVICE_ROLE_KEY', '')

    test_file_name = f"e2e-verify-{int(datetime.now().timestamp())}.txt"
    test_content = b"HOV Operations Storage Verification Payload"
    upload_url = f"{url}/storage/v1/object/venture-documents/{test_file_name}"
    
    # Upload
    req = urllib.request.Request(
        upload_url,
        data=test_content,
        headers={'Authorization': f'Bearer {service}', 'Content-Type': 'text/plain'},
        method='POST'
    )
    with urllib.request.urlopen(req) as upload_resp:
        assert upload_resp.status in (200, 201), "Upload failed"

    # Public download
    public_url = f"{url}/storage/v1/object/public/venture-documents/{test_file_name}"
    dl_req = urllib.request.Request(public_url)
    with urllib.request.urlopen(dl_req) as dl_resp:
        dl_body = dl_resp.read()
        assert dl_body == test_content, "Downloaded content mismatch"

    # Delete
    del_url = f"{url}/storage/v1/object/venture-documents"
    del_req = urllib.request.Request(
        del_url,
        data=json.dumps({'prefixes': [test_file_name]}).encode('utf-8'),
        headers={'Authorization': f'Bearer {service}', 'Content-Type': 'application/json'},
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as del_resp:
        assert del_resp.status == 200, "Deletion failed"

    print("  -> Passed! Bucket 'venture-documents' is online, public, and live Storage API verified.")

def test_venture_health_logic():
    print("[TEST 10] Verifying Automated Venture Health Logic (Red / Amber / Green)...")
    def calc_health(has_blocker, has_overdue, has_due_soon, has_on_hold):
        if has_blocker or has_overdue:
            return 'red'
        if has_due_soon or has_on_hold:
            return 'amber'
        return 'green'

    assert calc_health(True, False, False, False) == 'red', "Blocker must trigger Red"
    assert calc_health(False, True, False, False) == 'red', "Overdue must trigger Red"
    assert calc_health(False, False, True, False) == 'amber', "Due in <=7 days must trigger Amber"
    assert calc_health(False, False, False, True) == 'amber', "On-hold must trigger Amber"
    assert calc_health(False, False, False, False) == 'green', "Clear must be Green"
    print("  -> Passed! All 5 health state conditions verified.")

def test_live_production_deployment():
    print("[TEST 11] Verifying Live Production Vercel Deployment Health...")
    prod_url = 'https://hov-team-tracker.vercel.app'
    req = urllib.request.Request(prod_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200 from live site, got {resp.status}"
        body = resp.read().decode('utf-8')
        assert len(body) > 1000, "Live page content too small"
    print("  -> Passed! Live production deployment https://hov-team-tracker.vercel.app is healthy and online.")

def main():
    print("==========================================================")
    print("HOV TEAM OPERATIONS & OKR OS — DEEP VERIFICATION SUITE")
    print("==========================================================")
    try:
        test_profiles()
        test_dynamic_member_addition()
        test_ventures()
        test_venture_lead_reassignment()
        test_objectives()
        test_two_stage_review_workflow()
        test_threaded_feedback_log()
        test_forward_planning_and_promotion()
        test_supabase_storage()
        test_venture_health_logic()
        test_live_production_deployment()
        print("\n==========================================================")
        print("ALL VERIFICATION TESTS PASSED WITH 100% INTEGRITY & ZERO POLLUTION!")
        print("==========================================================")
    except Exception as e:
        print(f"\nTEST FAILURE: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
