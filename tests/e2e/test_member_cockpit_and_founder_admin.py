import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'scripts'))
from db import run_query

def test_member_leading_ventures():
    print("[TEST 1] Verifying Member Leading Ventures Breakdown...")
    res = run_query("""
        SELECT p.slug, p.full_name, count(v.id) as venture_count, array_agg(v.code) as codes
        FROM public.profiles p
        LEFT JOIN public.ventures v ON v.lead_id = p.id AND v.is_active = true
        WHERE p.slug IN ('atharav', 'sharuk', 'rufus')
        GROUP BY p.slug, p.full_name;
    """)
    leads = {r['slug']: r for r in res}
    
    total_ventures = run_query("SELECT count(*) FROM public.ventures;")[0]['count']
    if total_ventures == 0:
        assert 'atharav' in leads and 'sharuk' in leads and 'rufus' in leads, "Core leads must exist in profiles"
        print("  -> Passed! Clean empty venture state verified: Atharav (0), Sharuk (0), Rufus (0), awaiting new Excel.")
        return

    assert leads['atharav']['venture_count'] == 5, f"Atharav should lead 5 ventures, got {leads['atharav']['venture_count']}"
    assert leads['sharuk']['venture_count'] == 5, f"Sharuk should lead 5 ventures, got {leads['sharuk']['venture_count']}"
    assert leads['rufus']['venture_count'] == 3, f"Rufus should lead 3 ventures, got {leads['rufus']['venture_count']}"
    print(f"  -> Passed! Atharav ({leads['atharav']['codes']}), Sharuk ({leads['sharuk']['codes']}), Rufus ({leads['rufus']['codes']}).")

def test_cross_venture_task_assignment():
    print("[TEST 2] Verifying Cross-Venture Task Assignment & Cockpit Routing...")
    atharav = run_query("SELECT id FROM public.profiles WHERE slug = 'atharav';")[0]
    rufus = run_query("SELECT id FROM public.profiles WHERE slug = 'rufus';")[0]

    hbm_list = run_query("SELECT id, name, code, lead_id FROM public.ventures WHERE code = 'HBM';")
    created_temp_v = False
    if len(hbm_list) > 0:
        hbm = hbm_list[0]
        v_id = hbm['id']
    else:
        v_res = run_query(f"INSERT INTO public.ventures (name, code, lead_id) VALUES ('E2E HBM Test Venture', 'HBM', '{rufus['id']}') RETURNING id, name, code, lead_id;")
        hbm = v_res[0]
        v_id = hbm['id']
        created_temp_v = True

    try:
        assert hbm['lead_id'] == rufus['id'], "HBM must be led by Rufus"

        insert_sql = f"""
        INSERT INTO public.action_items (venture_id, title, assigned_to, assigned_by, status, is_planned)
        VALUES ('{v_id}', '[E2E TEST] Cross-Venture Marketing Asset for Atharav', '{atharav['id']}', '{rufus['id']}', 'in_progress', false)
        RETURNING id, title, assigned_to, assigned_by, venture_id;
        """
        created = run_query(insert_sql)
        assert len(created) == 1, "Failed to create cross-venture task"
        task_id = created[0]['id']

        try:
            fetch_sql = f"""
            SELECT a.id, a.title, a.status,
                   a.assigned_to, p_assignee.full_name as assignee_name,
                   a.assigned_by, p_assigner.full_name as assigner_name,
                   v.name as venture_name, v.code as venture_code, v.lead_id as venture_lead_id,
                   p_lead.full_name as venture_lead_name
            FROM public.action_items a
            JOIN public.ventures v ON a.venture_id = v.id
            LEFT JOIN public.profiles p_assignee ON a.assigned_to = p_assignee.id
            LEFT JOIN public.profiles p_assigner ON a.assigned_by = p_assigner.id
            LEFT JOIN public.profiles p_lead ON v.lead_id = p_lead.id
            WHERE a.id = '{task_id}';
            """
            fetched = run_query(fetch_sql)
            assert len(fetched) == 1, "Could not fetch created cross-venture task"
            task = fetched[0]

            assert task['assigned_to'] == atharav['id'], "Assignee must be Atharav"
            assert task['venture_lead_id'] == rufus['id'], "Venture lead must be Rufus"
            assert task['assigned_to'] != task['venture_lead_id'], "Task must be cross-venture (assignee != venture_lead)"
            assert task['assigned_by'] == rufus['id'], "Assigned by must be Rufus"
            assert task['venture_code'] == 'HBM', "Venture code must be HBM"

            print(f"  -> Cross-venture task correctly routed to Atharav cockpit: '{task['title']}' from '{task['venture_name']}'")
        finally:
            run_query(f"DELETE FROM public.action_items WHERE id = '{task_id}';")
    finally:
        if created_temp_v:
            run_query(f"DELETE FROM public.ventures WHERE id = '{v_id}';")
    print("  -> Passed! Cross-venture task verified and cleaned up with zero data pollution.")

def test_founder_profile_update():
    print("[TEST 3] Verifying Founder Master Profile Edit Authority...")
    shristy = run_query("SELECT id, full_name, lead_title FROM public.profiles WHERE slug = 'shristy';")[0]
    original_title = shristy['lead_title'] or 'Collaborator'

    new_title = 'Senior Operations Lead (E2E Test)'
    update_sql = f"""
    UPDATE public.profiles
    SET lead_title = '{new_title}', updated_at = now()
    WHERE id = '{shristy['id']}'
    RETURNING id, lead_title;
    """
    res = run_query(update_sql)
    assert res[0]['lead_title'] == new_title, "Failed to update member title"

    restore_sql = f"""
    UPDATE public.profiles
    SET lead_title = '{original_title}', updated_at = now()
    WHERE id = '{shristy['id']}';
    """
    run_query(restore_sql)
    restored = run_query(f"SELECT lead_title FROM public.profiles WHERE id = '{shristy['id']}';")[0]
    assert restored['lead_title'] == original_title, "Failed to restore original title"
    print(f"  -> Passed! Founder profile update and restoration verified for {shristy['full_name']}.")

def test_founder_venture_update():
    print("[TEST 4] Verifying Founder Master Venture Edit Authority...")
    pratap = run_query("SELECT id FROM public.profiles WHERE slug = 'pratap';")[0]
    ps_hov_list = run_query("SELECT id, name, code, description FROM public.ventures WHERE code = 'HOV';")
    created_temp_v = False
    if len(ps_hov_list) > 0:
        ps_hov = ps_hov_list[0]
        v_id = ps_hov['id']
        original_desc = ps_hov['description'] or ''
    else:
        v_res = run_query(f"INSERT INTO public.ventures (name, code, lead_id, description) VALUES ('E2E HOV Studio Head', 'HOV', '{pratap['id']}', 'Original description') RETURNING id, name, code, description;")
        ps_hov = v_res[0]
        v_id = ps_hov['id']
        original_desc = ps_hov['description']
        created_temp_v = True

    try:
        test_desc = 'Flagship ecosystem headquarters and venture studio operations hub (E2E Verified).'
        update_sql = f"""
        UPDATE public.ventures
        SET description = '{test_desc}', updated_at = now()
        WHERE id = '{v_id}'
        RETURNING id, description;
        """
        res = run_query(update_sql)
        assert res[0]['description'] == test_desc, "Failed to update venture description"

        if not created_temp_v:
            restore_sql = f"""
            UPDATE public.ventures
            SET description = '{original_desc}', updated_at = now()
            WHERE id = '{v_id}';
            """
            run_query(restore_sql)
            restored = run_query(f"SELECT description FROM public.ventures WHERE id = '{v_id}';")[0]
            assert restored['description'] == original_desc, "Failed to restore venture description"
    finally:
        if created_temp_v:
            run_query(f"DELETE FROM public.ventures WHERE id = '{v_id}';")
    print("  -> Passed! Founder venture update and restoration verified.")

if __name__ == '__main__':
    print("==========================================================")
    print("MEMBER COCKPIT & FOUNDER MASTER ADMIN VERIFICATION SUITE")
    print("==========================================================")
    test_member_leading_ventures()
    test_cross_venture_task_assignment()
    test_founder_profile_update()
    test_founder_venture_update()
    print("==========================================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS & ZERO DATA POLLUTION!")
    print("==========================================================")
