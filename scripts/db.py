import os
import ssl
import pg8000.native

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

_con = None

def get_connection():
    global _con
    if _con is not None:
        try:
            _con.run("SELECT 1;")
            return _con
        except Exception:
            try:
                _con.close()
            except Exception:
                pass
            _con = None

    env = load_env()
    supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL', '')
    if '//' in supabase_url:
        project_ref = supabase_url.split('//')[1].split('.')[0]
    else:
        project_ref = 'cjmdzulucwuvzybvtgdz'

    db_pass = env.get('SUPABASE_DB_PASSWORD', 'HovTracker2026!SecureDb#Pass')

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    _con = pg8000.native.Connection(
        user=f'postgres.{project_ref}',
        host='aws-0-us-east-1.pooler.supabase.com',
        port=6543,
        database='postgres',
        password=db_pass,
        ssl_context=ctx
    )
    return _con

def run_query(sql):
    con = get_connection()
    res = con.run(sql)
    if con.columns:
        cols = [c['name'] for c in con.columns]
        return [dict(zip(cols, row)) for row in res]
    return []

if __name__ == '__main__':
    print("Testing db helper connection...")
    r = run_query("SELECT 1 as test_col;")
    print("Result:", r)
