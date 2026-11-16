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

def main():
    env = load_env()
    token = os.environ.get('SUPABASE_ACCESS_TOKEN') or env.get('SUPABASE_ACCESS_TOKEN', '')
    project_ref = 'qglghldegdikwjzileno'
    url = f'https://api.supabase.com/v1/projects/{project_ref}/database/query'

    with open('supabase/migrations/20261116000000_init_schema.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    req = urllib.request.Request(
        url,
        data=json.dumps({'query': sql}).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print("Migration successful! Response:", data)
    except urllib.error.HTTPError as e:
        print(f"HTTPError {e.code}: {e.read().decode('utf-8')}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print("Error:", e, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
