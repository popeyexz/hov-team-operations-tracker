import urllib.request
import json
import sys
import os

def load_env():
    env = {}
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k.strip()] = v.strip()
    return env

ENV = load_env()
TOKEN = os.environ.get('VERCEL_TOKEN') or ENV.get('VERCEL_TOKEN', '')
PROJECT = 'hov-team-tracker'

ENV_VARS = [
    {
        "key": "NEXT_PUBLIC_SUPABASE_URL",
        "value": "https://qglghldegdikwjzileno.supabase.co",
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGdobGRlZ2Rpa3dqemlsZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MzIwMTQsImV4cCI6MjExMDMwODAxNH0.eYaZBeohuDy-2JlCFqE8X9zoTFlIyzM6pSJaeswZzfU",
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "SUPABASE_SERVICE_ROLE_KEY",
        "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGdobGRlZ2Rpa3dqemlsZW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDczMjAxNCwiZXhwIjoyMTEwMzA4MDE0fQ.oTonEkWZ-ADYw8bcuVtI7eLmtJ4w9FLBW0dG1h19QHw",
        "type": "encrypted",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "ADMIN_DEV_EMAIL",
        "value": "houseofventures.dev@gmail.com",
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
        "value": "BLbHvMoSjJ1w40IG7vp4h1bD8oIKzLYQun8fssWtv3xb6PJyj9IS8X_kPECA2RIPboc8BAfifrCL0nzGvL2l0os",
        "type": "plain",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "VAPID_PRIVATE_KEY",
        "value": "9dKuSSHEofZjLF9WmCMkqsL1F2-Wm-0lp8_y-ZVr3EQ",
        "type": "encrypted",
        "target": ["production", "preview", "development"]
    },
    {
        "key": "VAPID_SUBJECT",
        "value": "mailto:houseofventures.dev@gmail.com",
        "type": "plain",
        "target": ["production", "preview", "development"]
    }
]

def main():
    print(f"Adding environment variables to Vercel project '{PROJECT}'...")
    url = f"https://api.vercel.com/v10/projects/{PROJECT}/env"

    for item in ENV_VARS:
        req = urllib.request.Request(
            url,
            data=json.dumps(item).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {TOKEN}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"  Added {item['key']}: OK ({resp.status})")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            if 'already exists' in err_body or 'ENV_ALREADY_EXISTS' in err_body:
                print(f"  {item['key']} already exists on Vercel.")
            else:
                print(f"  Failed {item['key']}: {err_body}")
        except Exception as e:
            print(f"  Error setting {item['key']}: {e}")

if __name__ == '__main__':
    main()
