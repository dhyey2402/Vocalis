import os
import uuid
import time
import requests

# Get the base directory for saving generated audio
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, 'generated_audio')

# Ensure the directory exists
os.makedirs(AUDIO_DIR, exist_ok=True)

# Single Source of Truth for Valid Languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'mr': 'Marathi'
}

# Single Source of Truth for Valid Voices
# Maps the frontend ID to ElevenLabs Voice ID
SUPPORTED_VOICES = {
    # English
    'en-US-1': {'languageCode': 'en', 'voice_id': 'EXAVITQu4vr4xnSDxMaL'}, # Bella
    'en-US-2': {'languageCode': 'en', 'voice_id': 'ErXwobaYiN019PkySvjV'}, # Antoni
    'en-GB-1': {'languageCode': 'en', 'voice_id': 'pNInz6obpgDQGcFmaJgB'}, # Adam (Fallback for deprecated Liam)
    # Spanish
    'es-ES-1': {'languageCode': 'es', 'voice_id': 'XrExE9yKIg1WjnnRuSqN'}, # Matilda
    'es-ES-2': {'languageCode': 'es', 'voice_id': 'pNInz6obpgDQGcFmaJgB'}, # Adam
    # French
    'fr-FR-1': {'languageCode': 'fr', 'voice_id': 'ThT5KcBeYPX3keUQqHPh'}, # Dorothy
    'fr-FR-2': {'languageCode': 'fr', 'voice_id': 'VR6AewLTigWG4xTAthcg'}, # Arnold
    # German
    'de-DE-1': {'languageCode': 'de', 'voice_id': 'EXAVITQu4vr4xnSDxMaL'}, 
    'de-DE-2': {'languageCode': 'de', 'voice_id': 'ErXwobaYiN019PkySvjV'}, 
    # Hindi
    'hi-IN-1': {'languageCode': 'hi', 'voice_id': 'AZnzlk1XvdvUeBnXmlld'}, # Domi
    'hi-IN-2': {'languageCode': 'hi', 'voice_id': 'CYw3kZ02Hs0563txGlMy'}, # Dave
    # Gujarati
    'gu-IN-1': {'languageCode': 'gu', 'voice_id': 'EXAVITQu4vr4xnSDxMaL'}, 
    'gu-IN-2': {'languageCode': 'gu', 'voice_id': 'ErXwobaYiN019PkySvjV'}, 
    # Marathi
    'mr-IN-1': {'languageCode': 'mr', 'voice_id': 'XrExE9yKIg1WjnnRuSqN'}, 
    'mr-IN-2': {'languageCode': 'mr', 'voice_id': 'pNInz6obpgDQGcFmaJgB'}
}


class ProviderError(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

def cleanup_old_audio_files(max_age_seconds=3600):
    """
    Deletes files in AUDIO_DIR that are older than max_age_seconds (1 hour).
    This avoids permanent accumulation of generated audio.
    """
    now = time.time()
    for filename in os.listdir(AUDIO_DIR):
        filepath = os.path.join(AUDIO_DIR, filename)
        if os.path.isfile(filepath):
            # Check file modification time
            if os.stat(filepath).st_mtime < now - max_age_seconds:
                try:
                    os.remove(filepath)
                except Exception:
                    pass # Ignore errors during cleanup, log if needed


def generate_audio(text, language_code, voice_id, stability=None, similarity_boost=None):
    """
    Calls ElevenLabs TTS to generate audio using the v1 API.
    Returns the generated filename on success.
    """
    # 1. Clean up old files to prevent storage leak
    cleanup_old_audio_files()

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    print(f"DIAGNOSTIC: api_key configured = {bool(api_key)}")
    if not api_key or api_key == "your-elevenlabs-api-key-here":
        print("ERROR: ElevenLabs API Key is missing or not configured in .env")
        raise ProviderError("TTS configuration error", 500)

    try:
        # Retrieve strict mapping
        voice_config = SUPPORTED_VOICES[voice_id]
        elevenlabs_voice_id = voice_config['voice_id']
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{elevenlabs_voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": stability if stability is not None else 0.5,
                "similarity_boost": similarity_boost if similarity_boost is not None else 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        print("--- ELEVENLABS REQUEST TRACE ---")
        print(f"URL: {url}")
        print(f"HEADERS: Accept={headers.get('Accept')}, xi-api-key-len={len(headers.get('xi-api-key', ''))}")
        print(f"PAYLOAD: {data}")
        print(f"RESPONSE STATUS: {response.status_code}")
        if not response.ok:
            print(f"RESPONSE BODY: {response.text}")
        print("--------------------------------")
        
        if not response.ok:
            error_data = {}
            try:
                error_data = response.json()
            except Exception:
                pass
                
            code = ""
            if isinstance(error_data, dict):
                detail = error_data.get("detail", {})
                if isinstance(detail, dict):
                    code = detail.get("code", "")
                    
            if response.status_code == 401:
                if code == "quota_exceeded":
                    raise ProviderError(f"Provider quota or rate limit exceeded: {error_data.get('detail', {}).get('message', 'Insufficient credits')}", 429)
                raise ProviderError("Authentication failed with provider.", 502)
            elif response.status_code == 403:
                raise ProviderError("Forbidden by provider.", 502)
            elif response.status_code == 404:
                raise ProviderError("Voice ID not found on provider.", 404)
            elif response.status_code == 422:
                raise ProviderError("Invalid request format sent to provider.", 422)
            elif response.status_code == 429:
                raise ProviderError("Provider rate limit or quota exceeded.", 429)
            elif response.status_code >= 500:
                raise ProviderError("Provider service is currently unavailable.", 503)
            else:
                raise ProviderError("Unknown provider error.", 500)
        
        # Generate random filename
        filename = f"vocalis_{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        # Save to disk
        with open(filepath, "wb") as out:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    out.write(chunk)
            
        return filename
    except ProviderError as e:
        raise e
    except requests.exceptions.RequestException as e:
        print(f"Network error connecting to ElevenLabs: {str(e)}")
        raise ProviderError("Network error connecting to provider.", 503)
    except Exception as e:
        print(f"Unexpected TTS Error: {str(e)}")
        raise ProviderError("Internal error during audio generation.", 500)
