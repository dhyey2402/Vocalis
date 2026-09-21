import os
import requests
import shutil

# Make public demo dir
demo_dir = r"c:\Projects\LABMENTIX\Vocalis\frontend\public\demo"
os.makedirs(demo_dir, exist_ok=True)

demos = [
    {
        'text': 'The quick brown fox jumps over the lazy dog. Vocalis allows you to bring your text to life instantly.',
        'language': 'en',
        'voice': 'en-US-1',
        'filename': 'demo_en.mp3'
    },
    {
        'text': 'El rápido zorro marrón salta sobre el perro perezoso. Vocalis te permite dar vida a tus textos al instante.',
        'language': 'es',
        'voice': 'es-ES-1',
        'filename': 'demo_es.mp3'
    },
    {
        'text': 'Le renard brun rapide saute par-dessus le chien paresseux. Vocalis vous permet de donner vie à vos textes instantanément.',
        'language': 'fr',
        'voice': 'fr-FR-1',
        'filename': 'demo_fr.mp3'
    }
]

url = 'http://127.0.0.1:5000/api/tts'

for demo in demos:
    print(f"Generating {demo['filename']}...")
    resp = requests.post(url, json={
        'text': demo['text'],
        'language': demo['language'],
        'voice': demo['voice']
    })
    
    if resp.status_code == 201:
        audio_url = resp.json()['audio_url']
        # The url is like http://127.0.0.1:5000/api/audio/vocalis_xxx.mp3
        file_part = audio_url.split('/')[-1]
        
        # We need to grab this file from the backend/generated_audio folder
        backend_audio_path = os.path.join(r"c:\Projects\LABMENTIX\Vocalis\backend\generated_audio", file_part)
        
        dest_path = os.path.join(demo_dir, demo['filename'])
        shutil.copy2(backend_audio_path, dest_path)
        print(f"Saved to {dest_path}")
    else:
        print(f"Error for {demo['filename']}: {resp.text}")
