import os
import subprocess

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

env = load_env()
token = env.get('VERCEL_TOKEN')

if not token:
    print('ERROR: VERCEL_TOKEN not found in .env.local')
    exit(1)

print('Triggering Vercel Production Deployment using VERCEL_TOKEN...')
cmd = ['npx', 'vercel', '--token', token, '--prod', '--yes']

result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
print('STDOUT:')
print(result.stdout)
print('STDERR:')
print(result.stderr)
print('Return code:', result.returncode)
if result.returncode != 0:
    exit(result.returncode)
