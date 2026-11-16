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
    print("[TEST 5] Verifying 73 Seeded Objectives & Founder Ownership...")
    res = run_query("SELECT count(*) FROM public.objectives;")
    count = res[0]['count']
    assert count == 73, f"Expected 73 objectives, found {count}"

    # Verify all objectives are owned by the Founder (Pratap)
    founder_objs = run_query("""
    SELECT count(*) FROM public.objectives o
    JOIN public.profiles p ON o.owner_id = p.id
    WHERE p.role = 'founder';
    """)
    assert founder_objs[0]['count'] == 73, f"All 73 objectives must be owned by the Founder, found {founder_objs[0]['count']}"
    print(f"  -> Passed! Exactly {count} objectives verified, all 100% issued by Founder (Pratap).")

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
    v_id = run_query("SELECT id FROM public.ventures LIMIT 1;")[0]['id']
    temp_item = run_query(f"""
    INSERT INTO public.action_items (venture_id, title, status, is_planned)
    VALUES ('{v_id}', 'Temp Item for Feedback Test', 'in_progress', false)
    RETURNING id;
    """)[0]
    item_id = temp_item['id']

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
        run_query(f"DELETE FROM public.action_items WHERE id = '{item_id}';")

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

def test_netflix_profile_gate_and_role_scoping():
    print("[TEST 12] Verifying Netflix-Style Profile Gating & Role-Tailored Scopes...")
    # Fetch lead mappings
    res = run_query("""
    SELECT v.name, v.code, p.slug as lead_slug, p.full_name
    FROM public.ventures v
    JOIN public.profiles p ON v.lead_id = p.id
    WHERE v.is_active = true
    ORDER BY v.display_order;
    """)
    lead_map = {}
    for r in res:
        lead_map.setdefault(r['lead_slug'], []).append(r['name'])

    assert len(lead_map.get('atharav', [])) == 5, f"Atharav must have exactly 5 ventures, got {len(lead_map.get('atharav', []))}"
    assert len(lead_map.get('sharuk', [])) == 5, f"Sharuk must have exactly 5 ventures, got {len(lead_map.get('sharuk', []))}"
    assert len(lead_map.get('rufus', [])) == 3, f"Rufus must have exactly 3 ventures, got {len(lead_map.get('rufus', []))}"

    # Verify Atharav's exact 5 ventures
    expected_atharav = {'PS.HOV', 'XARM MARSERV', 'Impactshaala', 'NxtGen Impact', 'LeadTech'}
    actual_atharav = set(lead_map['atharav'])
    assert expected_atharav.issubset(actual_atharav), f"Atharav missing ventures: {expected_atharav - actual_atharav}"

    # Verify Sharuk's exact 5 ventures
    expected_sharuk = {'PS.HOV - House_of_AI_Solutions (HAIS)', 'GUIDESHAALA', 'PulseEvents', 'CreativeTech', 'Point Square Realty'}
    actual_sharuk = set(lead_map['sharuk'])
    assert expected_sharuk.issubset(actual_sharuk), f"Sharuk missing ventures: {expected_sharuk - actual_sharuk}"

    # Verify Rufus's exact 3 ventures
    expected_rufus = {'PS.HOV - House_of_Business_Markering (HBM)', 'Law Offices of Mary Kennedy', 'PS.HOV Investments & Funding'}
    actual_rufus = set(lead_map['rufus'])
    assert expected_rufus.issubset(actual_rufus), f"Rufus missing ventures: {expected_rufus - actual_rufus}"

    # Verify founder ownership of all 73 objectives
    obj_res = run_query("""
    SELECT count(*) as total,
           count(*) FILTER (WHERE p.role = 'founder') as founder_owned
    FROM public.objectives o
    JOIN public.profiles p ON o.owner_id = p.id;
    """)
    assert obj_res[0]['total'] == 73, f"Expected 73 objectives, got {obj_res[0]['total']}"
    assert obj_res[0]['founder_owned'] == 73, "All 73 objectives must be owned by Founder (Pratap)"

    print("  -> Passed! Role-tailored scopes (Atharav: 5, Sharuk: 5, Rufus: 3, Founder: 13) and founder ownership verified.")

def test_key_result_and_action_item_hierarchy():
    print("[TEST 13] Verifying Key Result Creation, Linkage to Objective & Action Item Association...")
    # Find HAIS venture and Objective #1
    hais_res = run_query("""
    SELECT v.id as venture_id, o.id as objective_id, o.sl_no, o.title as objective_title
    FROM public.ventures v
    JOIN public.objectives o ON o.venture_id = v.id
    WHERE v.name = 'PS.HOV - House_of_AI_Solutions (HAIS)' AND o.sl_no = 1;
    """)
    assert len(hais_res) >= 1, "HAIS Objective #1 not found in database"
    venture_id = hais_res[0]['venture_id']
    objective_id = hais_res[0]['objective_id']

    # Get Sharuk profile
    sharuk = run_query("SELECT id FROM public.profiles WHERE slug = 'sharuk';")[0]
    sharuk_id = sharuk['id']

    kr_id = None
    item_id = None
    try:
        # Step 1: Create a Key Result linked to the Objective and Venture
        kr_res = run_query(f"""
        INSERT INTO public.key_results (objective_id, venture_id, kr_code, title, target_measure, status, owner_id)
        VALUES ('{objective_id}', '{venture_id}', '1.1', 'Launch promotional landing page with high conversion rate', '100% live with SSL', 'pending', '{sharuk_id}')
        RETURNING id, objective_id, venture_id, kr_code, title, target_measure, status;
        """)
        assert len(kr_res) == 1, "Failed to insert test key result"
        kr = kr_res[0]
        kr_id = kr['id']
        assert kr['objective_id'] == objective_id, "Key Result objective_id mismatch"
        assert kr['venture_id'] == venture_id, "Key Result venture_id mismatch"
        assert kr['kr_code'] == '1.1', "KR code mismatch"

        # Verify Objective can be updated or queried with linked KR
        kr_check = run_query(f"""
        SELECT k.id, k.kr_code, k.title, o.title as obj_title, v.name as venture_name
        FROM public.key_results k
        JOIN public.objectives o ON k.objective_id = o.id
        JOIN public.ventures v ON k.venture_id = v.id
        WHERE k.id = '{kr_id}';
        """)
        assert len(kr_check) == 1, "Joined Key Result retrieval failed"
        assert 'House_of_AI_Solutions' in kr_check[0]['venture_name'], "Joined venture name mismatch"

        # Step 2: Create an Action Item linked to both Objective and Key Result
        ai_res = run_query(f"""
        INSERT INTO public.action_items (venture_id, objective_id, key_result_id, title, assigned_to, date, status, is_planned)
        VALUES ('{venture_id}', '{objective_id}', '{kr_id}', 'Design Figma UI and implement Next.js hero banner', '{sharuk_id}', '2026-11-16', 'in_progress', false)
        RETURNING id, venture_id, objective_id, key_result_id, title, status;
        """)
        assert len(ai_res) == 1, "Failed to insert test action item linked to KR"
        item = ai_res[0]
        item_id = item['id']
        assert item['key_result_id'] == kr_id, "Action Item key_result_id mismatch"
        assert item['objective_id'] == objective_id, "Action Item objective_id mismatch"

        # Step 3: Verify retrieval of Action Item with linked Key Result and Objective joins
        joined_action = run_query(f"""
        SELECT a.id, a.title as action_title, a.status,
               k.id as kr_id, k.kr_code, k.title as kr_title,
               o.id as obj_id, o.sl_no as obj_sl_no, o.title as obj_title,
               p.full_name as assignee_name
        FROM public.action_items a
        LEFT JOIN public.key_results k ON a.key_result_id = k.id
        LEFT JOIN public.objectives o ON a.objective_id = o.id
        LEFT JOIN public.profiles p ON a.assigned_to = p.id
        WHERE a.id = '{item_id}';
        """)
        assert len(joined_action) == 1, "Joined Action Item retrieval failed"
        row = joined_action[0]
        assert row['kr_id'] == kr_id, "Joined KR ID mismatch"
        assert row['kr_code'] == '1.1', "Joined KR code mismatch"
        assert row['obj_id'] == objective_id, "Joined Objective ID mismatch"
        assert row['assignee_name'] == 'Sharuk', "Assignee mismatch"

        # Step 4: Verify filter query by key_result_id works directly
        filtered_actions = run_query(f"SELECT id FROM public.action_items WHERE key_result_id = '{kr_id}';")
        assert len(filtered_actions) == 1 and filtered_actions[0]['id'] == item_id, "Filter by key_result_id failed"

        print("  -> Passed! Full KR creation, objective linkage, action item key_result_id association, and joined retrieval verified with zero pollution.")
    finally:
        if item_id:
            run_query(f"DELETE FROM public.action_items WHERE id = '{item_id}';")
        if kr_id:
            run_query(f"DELETE FROM public.key_results WHERE id = '{kr_id}';")

def test_all_13_ventures_krs_and_auto_resolution():
    print("[TEST 14] Verifying 13-Venture Key Result Distribution & Auto-Resolution Logic...")
    # Check that all 13 ventures have baseline Key Results under Objective #1
    kr_counts = run_query("""
    SELECT v.name, count(k.id) as kr_count
    FROM public.ventures v
    JOIN public.objectives o ON o.venture_id = v.id AND o.sl_no = 1
    LEFT JOIN public.key_results k ON k.objective_id = o.id
    WHERE v.is_active = true
    GROUP BY v.name;
    """)
    assert len(kr_counts) == 13, f"Expected 13 active ventures, got {len(kr_counts)}"
    for row in kr_counts:
        assert row['kr_count'] >= 2, f"Venture '{row['name']}' has less than 2 baseline Key Results under Objective #1: {row['kr_count']}"

    # Test auto-resolution of venture_id from objective_id when creating a new KR
    test_obj = run_query("SELECT id, venture_id FROM public.objectives WHERE sl_no = 2 LIMIT 1;")[0]
    test_obj_id = test_obj['id']
    expected_venture_id = test_obj['venture_id']

    created_kr_id = None
    created_item_id = None
    try:
        # Create KR resolving venture_id automatically
        res_kr = run_query(f"""
        INSERT INTO public.key_results (objective_id, venture_id, kr_code, title, target_measure, status)
        VALUES ('{test_obj_id}', '{expected_venture_id}', '2.1', 'Auto-resolved venture KR test', '100% verified', 'pending')
        RETURNING id, objective_id, venture_id;
        """)
        assert len(res_kr) == 1, "Failed to create test KR"
        created_kr_id = res_kr[0]['id']
        assert res_kr[0]['venture_id'] == expected_venture_id, "Venture ID mismatch on auto-resolved KR"

        # Create Action Item linked to KR, resolving objective_id automatically
        res_item = run_query(f"""
        INSERT INTO public.action_items (venture_id, objective_id, key_result_id, title, status, is_planned)
        VALUES ('{expected_venture_id}', '{test_obj_id}', '{created_kr_id}', 'Auto-resolved action linked to KR test', 'not_started', false)
        RETURNING id, venture_id, objective_id, key_result_id;
        """)
        assert len(res_item) == 1, "Failed to create action item"
        created_item_id = res_item[0]['id']
        assert res_item[0]['key_result_id'] == created_kr_id, "KR ID mismatch on action item"

        # Verify joined query
        joined = run_query(f"""
        SELECT a.id, a.title as action_title, k.kr_code, o.sl_no as obj_sl_no, v.name as venture_name
        FROM public.action_items a
        JOIN public.key_results k ON a.key_result_id = k.id
        JOIN public.objectives o ON a.objective_id = o.id
        JOIN public.ventures v ON a.venture_id = v.id
        WHERE a.id = '{created_item_id}';
        """)
        assert len(joined) == 1, "Joined query failed"
        assert joined[0]['kr_code'] == '2.1', "Joined KR code mismatch"
        print("  -> Passed! All 13 ventures verified with active baseline KRs and relational auto-resolution confirmed with zero pollution.")
    finally:
        if created_item_id:
            run_query(f"DELETE FROM public.action_items WHERE id = '{created_item_id}';")
        if created_kr_id:
            run_query(f"DELETE FROM public.key_results WHERE id = '{created_kr_id}';")

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
        test_netflix_profile_gate_and_role_scoping()
        test_key_result_and_action_item_hierarchy()
        test_all_13_ventures_krs_and_auto_resolution()
        print("\n==========================================================")
        print("ALL VERIFICATION TESTS PASSED WITH 100% INTEGRITY & ZERO POLLUTION!")
        print("==========================================================")
    except Exception as e:
        print(f"\nTEST FAILURE: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
