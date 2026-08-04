import os
from supabase import create_client
import requests

env = {}
with open('.env.local') as f:
    for line in f:
        if '=' in line:
            k, v = line.strip().split('=', 1)
            env[k] = v

# We cannot execute DDL (ALTER TABLE) directly through the supabase python client (PostgREST).
# We must use the postgres connection string or we can just ask the user to run it in the SQL editor,
# OR we can just use the supabase CLI if it's installed.
# But wait, there is no postgres connection string in the env.
print(env)
