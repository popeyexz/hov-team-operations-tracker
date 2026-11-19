import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

def clean_database():
    print("Purging all tracker and venture data from Supabase (Clean Purge)...")
    
    # 1. Delete notifications
    run_query("DELETE FROM public.in_app_notifications;")
    
    # 2. Delete push subscriptions
    run_query("DELETE FROM public.push_subscriptions;")
    
    # 3. Delete task activity logs
    run_query("DELETE FROM public.task_activity_log;")
    
    # 4. Delete venture documents
    run_query("DELETE FROM public.venture_documents;")
    
    # 5. Delete action items
    run_query("DELETE FROM public.action_items;")
    
    # 6. Delete key results
    run_query("DELETE FROM public.key_results;")
    
    # 7. Delete objectives
    run_query("DELETE FROM public.objectives;")
    
    # 8. Delete ventures
    run_query("DELETE FROM public.ventures;")
    
    # Verify exact state
    p_cnt = run_query("SELECT count(*) FROM public.profiles;")[0]['count']
    v_cnt = run_query("SELECT count(*) FROM public.ventures;")[0]['count']
    obj_cnt = run_query("SELECT count(*) FROM public.objectives;")[0]['count']
    kr_cnt = run_query("SELECT count(*) FROM public.key_results;")[0]['count']
    ai_cnt = run_query("SELECT count(*) FROM public.action_items;")[0]['count']
    log_cnt = run_query("SELECT count(*) FROM public.task_activity_log;")[0]['count']
    notif_cnt = run_query("SELECT count(*) FROM public.in_app_notifications;")[0]['count']

    print("==================================================")
    print("DATABASE PURGE COMPLETE — READY FOR NEW EXCEL:")
    print(f"  Profiles: {p_cnt} (Authentic core members)")
    print(f"  Ventures: {v_cnt} (Purged - awaiting new Excel)")
    print(f"  Objectives: {obj_cnt} (Purged - awaiting new Excel)")
    print(f"  Key Results: {kr_cnt} (0)")
    print(f"  Action Items: {ai_cnt} (0)")
    print(f"  Task Activity Logs: {log_cnt} (0)")
    print(f"  Notifications: {notif_cnt} (0)")
    print("==================================================")

if __name__ == '__main__':
    clean_database()
