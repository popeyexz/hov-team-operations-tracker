import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from scripts.db import run_query

def test_notification_flow():
    print("[NOTIFICATION TEST] Testing real-time alert and notification flow...")

    # Fetch founder
    founder = run_query("SELECT id, email, full_name FROM profiles WHERE role = 'founder' LIMIT 1;")
    assert len(founder) == 1, "Founder profile not found"
    founder_id = founder[0]['id']
    print(f"  -> Found founder: {founder[0]['full_name']} ({founder_id})")

    # Insert test notification
    test_title = "[E2E-TEST] System Verification Alert"
    test_msg = "Automated check for notification delivery and unread counting."
    insert_res = run_query(f"""
        INSERT INTO in_app_notifications (recipient_id, actor_id, type, title, message, is_read)
        VALUES ('{founder_id}', '{founder_id}', 'general', '{test_title}', '{test_msg}', false)
        RETURNING id, is_read, title;
    """)
    assert len(insert_res) == 1, "Failed to insert test notification"
    notif_id = insert_res[0]['id']
    assert insert_res[0]['is_read'] is False, "New notification should be unread"
    print(f"  -> Inserted unread test notification: {notif_id}")

    # Verify query for unread
    unread_res = run_query(f"""
        SELECT count(*) as unread_count FROM in_app_notifications 
        WHERE recipient_id = '{founder_id}' AND is_read = false;
    """)
    unread_count = unread_res[0]['unread_count']
    assert unread_count >= 1, f"Expected unread_count >= 1, got {unread_count}"
    print(f"  -> Verified unread notifications count: {unread_count}")

    # Mark as read
    run_query(f"UPDATE in_app_notifications SET is_read = true WHERE id = '{notif_id}';")
    check_read = run_query(f"SELECT is_read FROM in_app_notifications WHERE id = '{notif_id}';")
    assert check_read[0]['is_read'] is True, "Notification was not marked as read"
    print("  -> Verified mark as read transition")

    # Clean up test notification
    run_query(f"DELETE FROM in_app_notifications WHERE id = '{notif_id}';")
    clean_check = run_query(f"SELECT id FROM in_app_notifications WHERE id = '{notif_id}';")
    assert len(clean_check) == 0, "Test notification cleanup failed"
    print("  -> Successfully cleaned up test notification with zero pollution")
    print("\nALL NOTIFICATION FLOW TESTS PASSED!\n")

if __name__ == '__main__':
    test_notification_flow()
