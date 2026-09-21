import requests

url = 'http://127.0.0.1:5000/api/tts'
data = {
    'text': 'Hello world, this is ElevenLabs testing.',
    'language': 'en',
    'voice': 'en-US-1'
}
response = requests.post(url, json=data)
if response.status_code == 201:
    print('SUCCESS:', response.json())
else:
    print('ERROR:', response.status_code, response.text)
