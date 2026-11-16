import sys
import os

try:
    from db import run_query
except ImportError:
    from scripts.db import run_query

def main():
    migration_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'supabase', 'migrations', '20261116000000_init_schema.sql')
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    try:
        run_query(sql)
        print("Migration applied successfully via database connection!")
    except Exception as e:
        print("Migration failed:", e, file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
