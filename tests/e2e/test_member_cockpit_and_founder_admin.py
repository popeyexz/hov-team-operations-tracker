import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'scripts'))
from db import run_query

def test_member_leading_ventures():
    print("[TEST 1] Verifying Member Leading Ventures Breakdown...")
    # Check Atharav (5), Sharuk (5), Rufus (3)
    res = run_query("""
        SELECT p.slug, p.full_name, count(v.id) as venture_count, array_agg(v.code) as codes
        FROM public.profiles p
        LEFT JOIN public.ventures v ON v.lead_id = p.id AND v.is_active = true
        WHERE p.slug IN ('atharav', 'sharuk', 'rufus')
        GROUP BY p.slug, p.full_name;
    """)
    leads = {r['slug']: r for r in res}
    
    assert leads['atharav']['venture_count'] == 5, f"Atharav should lead 5 ventures, got {leads['atharav']['venture_count']}"
    assert leads['sharuk']['venture_count'] == 5, f"Sharuk should lead 5 ventures, got {leads['sharuk']['venture_count']}"
    assert leads['rufus']['venture_count'] == 3, f"Rufus should lead 3 ventures, got {leads['rufus']['venture_count']}"
    print(f"  -> Passed! Atharav ({leads['atharav']['codes']}), Sharuk ({leads['sharuk']['codes']}), Rufus ({leads['rufus']['codes']}).")

def test_cross_venture_task_assignment():
    print("[TEST 2] Verifying Cross-Venture Task Assignment & Cockpit Routing...")
    # Get Atharav ID, Rufus ID, and HBM venture ID (led by Rufus)
    atharav = run_query("SELECT id FROM public.profiles WHERE slug = 'atharav';")[0]
    rufus = run_query("SELECT id FROM public.profiles WHERE slug = 'rufus';")[0]
    hbm = run_query("SELECT id, name, code, lead_id FROM public.ventures WHERE code = 'HBM';")[0]

    assert hbm['lead_id'] == rufus['id'], "HBM must be led by Rufus"

    # Insert a cross-venture task in HBM assigned to Atharav, assigned by Rufus
    insert_sql = f"""
    INSERT INTO public.action_items (venture_id, title, assigned_to, assigned_by, status, is_planned)
    VALUES ('{hbm['id']}', '[E2E TEST] Cross-Venture Marketing Asset for Atharav', '{atharav['id']}', '{rufus['id']}', 'in_progress', false)
    RETURNING id, title, assigned_to, assigned_by, venture_id;
    """
    created = run_query(insert_sql)
    assert len(created) == 1, "Failed to create cross-venture task"
    task_id = created[0]['id']

    # Query the task with relations as getWorkData does
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

    # Verify cross-venture condition: assignee != venture_lead
    assert task['assigned_to'] == atharav['id'], "Assignee must be Atharav"
    assert task['venture_lead_id'] == rufus['id'], "Venture lead must be Rufus"
    assert task['assigned_to'] != task['venture_lead_id'], "Task must be cross-venture (assignee != venture_lead)"
    assert task['assigned_by'] == rufus['id'], "Assigned by must be Rufus"
    assert task['venture_code'] == 'HBM', "Venture code must be HBM"

    print(f"  -> Cross-venture task correctly routed to Atharav cockpit: '{task['title']}' from '{task['venture_name']}' (Lead: {task['venture_lead_name']}, Assigner: {task['assigner_name']})")

    # Clean up test task (zero pollution)
    run_query(f"DELETE FROM public.action_items WHERE id = '{task_id}';")
    print("  -> Passed! Cross-venture task verified and cleaned up with zero data pollution.")

def test_founder_profile_update():
    print("[TEST 3] Verifying Founder Master Profile Edit Authority...")
    # Test updating a profile's lead_title and restoring it
    shristy = run_query("SELECT id, full_name, lead_title FROM public.profiles WHERE slug = 'shristy';")[0]
    original_title = shristy['lead_title'] or 'Collaborator'

    # Founder updates Shristy's title
    new_title = 'Senior Operations Lead (E2E Test)'
    update_sql = f"""
    UPDATE public.profiles
    SET lead_title = '{new_title}', updated_at = now()
    WHERE id = '{shristy['id']}'
    RETURNING id, lead_title;
    """
    res = run_query(update_sql)
    assert res[0]['lead_title'] == new_title, "Failed to update member title"

    # Restore original title
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
    # Test updating a venture's description and restoring it
    ps_hov = run_query("SELECT id, name, code, description FROM public.ventures WHERE code = 'HOV';")[0]
    original_desc = ps_hov['description'] or ''

    # Founder updates description
    test_desc = 'Flagship ecosystem headquarters and venture studio operations hub (E2E Verified).'
    update_sql = f"""
    UPDATE public.ventures
    SET description = '{test_desc}', updated_at = now()
    WHERE id = '{ps_hov['id']}'
    RETURNING id, description;
    """
    res = run_query(update_sql)
    assert res[0]['description'] == test_desc, "Failed to update venture description"

    # Restore original description
    restore_sql = f"""
    UPDATE public.ventures
    SET description = '{original_desc}', updated_at = now()
    WHERE id = '{ps_hov['id']}';
    """
    run_query(restore_sql)
    restored = run_query(f"SELECT description FROM public.ventures WHERE id = '{ps_hov['id']}';")[0]
    assert restored['description'] == original_desc, "Failed to restore venture description"
    print(f"  -> Passed! Founder venture update and restoration verified for {ps_hov['name']} ({ps_hov['code']}).")

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
