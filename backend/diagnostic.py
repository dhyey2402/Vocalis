import os
import sys
import psutil
import requests
import json
from dotenv import dotenv_values

def safe_fingerprint(key):
    if not key:
        return "None"
    if len(key) < 8:
        return f"len={len(key)} (too short)"
    return f"{key[:4]}...{key[-4:]} (len: {len(key)})"

def main():
    print("--- DIAGNOSTIC SCRIPT START ---")
    
    # 1. System environment variable
    sys_env = os.environ.get("ELEVENLABS_API_KEY")
    print(f"SYSTEM_ENV_VAR_ELEVENLABS_API_KEY: {safe_fingerprint(sys_env)}")
    
    # 2. .env file
    env_path = os.path.abspath('.env')
    env_vars = dotenv_values(env_path)
    env_file_key = env_vars.get("ELEVENLABS_API_KEY")
    print(f"DOTENV_FILE_ELEVENLABS_API_KEY: {safe_fingerprint(env_file_key)}")
    print(f"DOTENV_FILE_PATH: {env_path}")
    
    # 3. Find process on port 5000
    target_pid = None
    for conn in psutil.net_connections(kind='inet'):
        if conn.laddr.port == 5000 and conn.status == 'LISTEN':
            target_pid = conn.pid
            break
            
    if target_pid:
        try:
            proc = psutil.Process(target_pid)
            print(f"PROCESS_ON_PORT_5000: PID={target_pid}, name={proc.name()}, cmdline={proc.cmdline()}")
            proc_env = proc.environ()
            proc_key = proc_env.get("ELEVENLABS_API_KEY")
            print(f"PROCESS_ENV_ELEVENLABS_API_KEY: {safe_fingerprint(proc_key)}")
            
            # Check ElevenLabs Quota with the process key
            if proc_key:
                headers = {"xi-api-key": proc_key}
                resp = requests.get("https://api.elevenlabs.io/v1/user", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    sub = data.get("subscription", {})
                    char_count = sub.get("character_count", 0)
                    char_limit = sub.get("character_limit", 0)
                    print(f"ELEVENLABS_API_TEST (Process Key): {char_count}/{char_limit} characters used (Remaining: {char_limit - char_count})")
                else:
                    print(f"ELEVENLABS_API_TEST (Process Key): FAILED with {resp.status_code} - {resp.text}")
                    
        except psutil.AccessDenied:
            print(f"PROCESS_ON_PORT_5000: PID={target_pid} (Access Denied)")
    else:
        print("PROCESS_ON_PORT_5000: NOT FOUND")
        
    print("--- DIAGNOSTIC SCRIPT END ---")

if __name__ == '__main__':
    main()
