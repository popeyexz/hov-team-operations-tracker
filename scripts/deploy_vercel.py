import os
import subprocess
from check_vercel_deploy import load_env

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
