import urllib.request
import json
import sys
import os

def load_env():
    env = {}
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base_dir, '.env.local')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k.strip()] = v.strip()
    return env

ENV = load_env()
TOKEN = ENV.get('VERCEL_TOKEN') or os.environ.get('VERCEL_TOKEN', '')
PROJECT = 'hov-team-tracker'
PROJECT_ID = 'prj_Vy6p9QUVhMhKZ7zamfvsACLvsoXs'
TEAM_ID = 'team_alfUxsgPPcvdqbgUASI5d6WP'

ENV_VARS = [
    {
        "key": "NEXT_PUBLIC_SUPABASE_URL",
        "value": ENV.get("NEXT_PUBLIC_SUPABASE_URL", "https://cjmdzulucwuvzybvtgdz.supabase.co"),
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "value": ENV.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "SUPABASE_SERVICE_ROLE_KEY",
        "value": ENV.get("SUPABASE_SERVICE_ROLE_KEY", ""),
        "type": "encrypted",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "ADMIN_DEV_EMAIL",
        "value": ENV.get("ADMIN_DEV_EMAIL", "houseofventures.dev@gmail.com"),
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
        "value": ENV.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "BLbHvMoSjJ1w40IG7vp4h1bD8oIKzLYQun8fssWtv3xb6PJyj9IS8X_kPECA2RIPboc8BAfifrCL0nzGvL2l0os"),
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "VAPID_PRIVATE_KEY",
        "value": ENV.get("VAPID_PRIVATE_KEY", "9dKuSSHEofZjLF9WmCMkqsL1F2-Wm-0lp8_y-ZVr3EQ"),
        "type": "encrypted",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "VAPID_SUBJECT",
        "value": ENV.get("VAPID_SUBJECT", "mailto:houseofventures.dev@gmail.com"),
        "type": "plain",
        "target": ["production", "preview", "development"]
    }
]

def get_existing_envs():
    url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
    req = urllib.request.Request(
        url,
        headers={'Authorization': f'Bearer {TOKEN}'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        envs = data.get('envs', [])
        return {e['key']: e['id'] for e in envs}

def main():
    print(f"Syncing environment variables to Vercel project '{PROJECT}' ({PROJECT_ID})...")
    existing = get_existing_envs()
    print(f"Found {len(existing)} existing env vars on Vercel.")

    for item in ENV_VARS:
        key = item['key']
        if key in existing:
            env_id = existing[key]
            patch_url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env/{env_id}?teamId={TEAM_ID}"
            payload = {
                "value": item["value"],
                "target": item["target"]
            }
            req = urllib.request.Request(
                patch_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {TOKEN}',
                    'Content-Type': 'application/json'
                },
                method='PATCH'
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    print(f"  PATCH {key}: OK ({resp.status})")
            except Exception as e:
                print(f"  Failed PATCH {key}: {e}")
        else:
            post_url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
            req = urllib.request.Request(
                post_url,
                data=json.dumps(item).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {TOKEN}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    print(f"  POST {key}: OK ({resp.status})")
            except Exception as e:
                print(f"  Failed POST {key}: {e}")

if __name__ == '__main__':
    main()
