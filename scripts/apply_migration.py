import sys
import os
import json
import urllib.request

try:
    from db import run_query, load_env
except ImportError:
    from scripts.db import run_query, load_env

def apply_via_api(sql: str, project_ref: str, token: str):
    url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    req = urllib.request.Request(
        url,
        data=json.dumps({"query": sql}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status

def main():
    migration_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'supabase', 'migrations', '20261116000000_init_schema.sql'
    )
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    env = load_env()
    token = env.get('SUPABASE_ACCESS_TOKEN') or os.environ.get('SUPABASE_ACCESS_TOKEN', '')
    url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    project_ref = url.split('//')[1].split('.')[0] if '//' in url else 'cjmdzulucwuvzybvtgdz'

    if token:
        try:
            print(f"Applying migration via Supabase Management SQL API to {project_ref}...")
            apply_via_api(sql, project_ref, token)
            print("Migration applied successfully via Supabase Management SQL API!")
            return
        except Exception as api_err:
            print(f"Management API attempt failed ({api_err}); falling back to direct database runner...")

    try:
        run_query(sql)
        print("Migration applied successfully via direct database runner!")
    except Exception as e:
        print("Migration failed:", e, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
