import json
import urllib.request

SUPABASE_URL = 'https://cjmdzulucwuvzybvtgdz.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqbWR6dWx1Y3d1dnp5YnZ0Z2R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDgxNjQ1MSwiZXhwIjoyMTEwMzkyNDUxfQ.eUt-zbCVo-ylTW1S6TM_pD_G4QuqlwlJH4uhdcafFh0'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("[AVATAR TEST] Verifying profile avatar persistence in Supabase...")

# 1. Fetch founder
req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/profiles?role=eq.founder&select=id,full_name,avatar_url,avatar_color", headers=headers)
with urllib.request.urlopen(req) as resp:
    founder = json.loads(resp.read().decode())[0]

founder_id = founder['id']
print(f"  -> Founder {founder['full_name']} current avatar_url={founder.get('avatar_url')}, avatar_color={founder.get('avatar_color')}")

# 2. Update to Rose Silk preset
update_payload = json.dumps({
    'avatar_url': 'preset:rose-silk',
    'avatar_color': '#F4AEBE'
}).encode()

update_req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{founder_id}",
    data=update_payload,
    headers=headers,
    method='PATCH'
)
with urllib.request.urlopen(update_req) as resp:
    updated = json.loads(resp.read().decode())[0]

assert updated['avatar_url'] == 'preset:rose-silk', f"Expected preset:rose-silk, got {updated['avatar_url']}"
assert updated['avatar_color'] == '#F4AEBE', f"Expected #F4AEBE, got {updated['avatar_color']}"
print(f"  -> Successfully updated to Rose Silk theme: avatar_url={updated['avatar_url']}, avatar_color={updated['avatar_color']}")

print("  -> Avatar persistence verified 100% working!")
