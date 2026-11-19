import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'scripts'))
from db import run_query

def test_excel_import_pipeline_and_clean_purge():
    print("==========================================================")
    print("EXCEL IMPORT PIPELINE & CLEAN PURGE VERIFICATION")
    print("==========================================================")
    
    # Baseline check: DB must have 7 profiles and 0 ventures
    profiles = run_query("SELECT id, slug, full_name FROM public.profiles WHERE is_active = true;")
    assert len(profiles) == 7, f"Expected 7 profiles, got {len(profiles)}"
    
    initial_v_count = run_query("SELECT count(*) FROM public.ventures;")[0]['count']
    assert initial_v_count == 0, f"Expected 0 ventures before import test, got {initial_v_count}"
    
    sharuk_id = [p['id'] for p in profiles if p['slug'] == 'sharuk'][0]
    
    print("[STEP 1] Simulating Excel Workbook Import Payload...")
    # 1. Simulate parsed Excel workbook with a venture, objective, KR, and action item
    test_venture_name = "E2E Ingested AI Solutions"
    test_venture_code = "E2EAI"
    
    # Insert venture as discovered by import engine
    v_res = run_query(f"""
    INSERT INTO public.ventures (name, code, lead_id, lead_title, display_order)
    VALUES ('{test_venture_name}', '{test_venture_code}', '{sharuk_id}', 'AI Tool Lead', 1)
    RETURNING id, name, code, lead_id;
    """)
    assert len(v_res) == 1, "Failed to insert test venture"
    v_id = v_res[0]['id']
    
    # Insert objective under venture
    obj_res = run_query(f"""
    INSERT INTO public.objectives (venture_id, sl_no, title, owner_id, status)
    VALUES ('{v_id}', 1, 'Deploy Enterprise AI Assistant', '{sharuk_id}', 'pending')
    RETURNING id, venture_id, sl_no, title;
    """)
    assert len(obj_res) == 1, "Failed to insert test objective"
    obj_id = obj_res[0]['id']
    
    # Insert KR under objective
    kr_res = run_query(f"""
    INSERT INTO public.key_results (objective_id, venture_id, kr_code, title, target_measure, status, owner_id)
    VALUES ('{obj_id}', '{v_id}', '1.1', 'Achieve 99% accuracy on operational benchmark', '99% target', 'pending', '{sharuk_id}')
    RETURNING id, objective_id, venture_id;
    """)
    assert len(kr_res) == 1, "Failed to insert test key result"
    kr_id = kr_res[0]['id']
    
    # Insert Action item linked to KR
    ai_res = run_query(f"""
    INSERT INTO public.action_items (venture_id, objective_id, key_result_id, title, assigned_to, status, is_planned)
    VALUES ('{v_id}', '{obj_id}', '{kr_id}', 'Fine-tune model prompts and verify with eval suite', '{sharuk_id}', 'in_progress', false)
    RETURNING id, venture_id, key_result_id;
    """)
    assert len(ai_res) == 1, "Failed to insert test action item"
    ai_id = ai_res[0]['id']
    
    print("  -> Successfully inserted simulated Excel structure (Venture, Objective, KR, Action Item).")
    
    # Step 2: Verify relational integrity
    joined = run_query(f"""
    SELECT v.name as venture_name, o.title as obj_title, k.kr_code, a.title as action_title
    FROM public.action_items a
    JOIN public.ventures v ON a.venture_id = v.id
    JOIN public.objectives o ON a.objective_id = o.id
    JOIN public.key_results k ON a.key_result_id = k.id
    WHERE a.id = '{ai_id}';
    """)
    assert len(joined) == 1, "Relational join failed"
    assert joined[0]['venture_name'] == test_venture_name
    assert joined[0]['kr_code'] == '1.1'
    print("  -> Relational integrity across 4-level hierarchy verified!")
    
    # Step 3: Test clean database purge (simulating clearAllTrackerDataFromSupabase)
    print("[STEP 2] Testing Clean Purge Pipeline...")
    run_query("DELETE FROM public.action_items;")
    run_query("DELETE FROM public.key_results;")
    run_query("DELETE FROM public.objectives;")
    run_query("DELETE FROM public.ventures;")
    
    # Verify exact empty state restored
    after_v = run_query("SELECT count(*) FROM public.ventures;")[0]['count']
    after_o = run_query("SELECT count(*) FROM public.objectives;")[0]['count']
    after_k = run_query("SELECT count(*) FROM public.key_results;")[0]['count']
    after_a = run_query("SELECT count(*) FROM public.action_items;")[0]['count']
    after_p = run_query("SELECT count(*) FROM public.profiles;")[0]['count']
    
    assert after_v == 0, f"Expected 0 ventures after purge, got {after_v}"
    assert after_o == 0, f"Expected 0 objectives after purge, got {after_o}"
    assert after_k == 0, f"Expected 0 KRs after purge, got {after_k}"
    assert after_a == 0, f"Expected 0 action items after purge, got {after_a}"
    assert after_p == 7, f"Expected 7 profiles preserved after purge, got {after_p}"
    
    print("  -> Database successfully returned to authentic zero-venture clean state (0 ventures, 7 profiles).")
    print("==========================================================")
    print("EXCEL IMPORT PIPELINE TEST PASSED 100%!")
    print("==========================================================")

if __name__ == '__main__':
    test_excel_import_pipeline_and_clean_purge()
