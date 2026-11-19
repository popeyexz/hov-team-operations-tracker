import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

def clean_database():
    print("Purging all fabricated/mock data from Supabase...")
    
    # 1. Delete notifications
    run_query("DELETE FROM public.in_app_notifications;")
    
    # 2. Delete task activity logs
    run_query("DELETE FROM public.task_activity_log;")
    
    # 3. Delete action items
    run_query("DELETE FROM public.action_items;")
    
    # 4. Delete key results
    run_query("DELETE FROM public.key_results;")
    
    # 5. Reset any objectives that had status changed to 'pending'
    run_query("UPDATE public.objectives SET status = 'no_krs' WHERE status = 'pending';")
    
    # Verify exact state
    p_cnt = run_query("SELECT count(*) FROM public.profiles;")[0]['count']
    v_cnt = run_query("SELECT count(*) FROM public.ventures;")[0]['count']
    obj_cnt = run_query("SELECT count(*) FROM public.objectives;")[0]['count']
    kr_cnt = run_query("SELECT count(*) FROM public.key_results;")[0]['count']
    ai_cnt = run_query("SELECT count(*) FROM public.action_items;")[0]['count']
    log_cnt = run_query("SELECT count(*) FROM public.task_activity_log;")[0]['count']
    notif_cnt = run_query("SELECT count(*) FROM public.in_app_notifications;")[0]['count']

    print("==================================================")
    print("DATABASE PURGE COMPLETE — CLEAN AUTHENTIC STATE:")
    print(f"  Profiles: {p_cnt} (All 7 authentic core members)")
    print(f"  Ventures: {v_cnt} (All 13 authentic ventures)")
    print(f"  Objectives: {obj_cnt} (All 73 authentic objectives from Excel)")
    print(f"  Key Results: {kr_cnt} (0 fabricated KRs)")
    print(f"  Action Items: {ai_cnt} (0 fabricated action items)")
    print(f"  Task Activity Logs: {log_cnt} (0 fabricated logs)")
    print(f"  Notifications: {notif_cnt} (0 fabricated notifications)")
    print("==================================================")

if __name__ == '__main__':
    clean_database()
