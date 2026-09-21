from flask import Blueprint, request, jsonify
from services.tts_service import generate_audio, SUPPORTED_LANGUAGES, SUPPORTED_VOICES, ProviderError, AUDIO_DIR
from utils.auth import token_required
from models import db, AudioGeneration
from services.storage_service import storage
import os
from mutagen.mp3 import MP3

tts_bp = Blueprint('tts_bp', __name__)

@tts_bp.route('/tts', methods=['POST'])
@token_required
def handle_tts_request(current_user):
    data = request.get_json()
    
    # Validate request structure
    if not data:
        return jsonify({"success": False, "error": "Invalid request. JSON body is required."}), 400
        
    text = data.get('text', '').strip()
    language = data.get('language', '').strip()
    voice = data.get('voice', '').strip()
    sections = data.get('sections', [])
    listening_data_input = data.get('listeningData', None)
    stability = data.get('stability')
    similarity_boost = data.get('similarity_boost')
    
    # Validate required fields
    if not text or not language or not voice:
        return jsonify({"success": False, "error": "Missing required fields: text, language, or voice."}), 400
        
    # Enforce maximum text length
    if len(text) > 5000:
        return jsonify({"success": False, "error": "Text exceeds the maximum allowed length of 5000 characters."}), 400
        
    # Validate supported language
    if language not in SUPPORTED_LANGUAGES:
        return jsonify({"success": False, "error": f"Unsupported language: {language}"}), 400
        
    # Validate supported voice
    if voice not in SUPPORTED_VOICES:
        return jsonify({"success": False, "error": f"Unsupported voice: {voice}"}), 400
        
    # Verify voice belongs to the selected language
    if SUPPORTED_VOICES[voice]['languageCode'] != language:
        return jsonify({"success": False, "error": f"Voice '{voice}' does not belong to language '{language}'."}), 400

    # Validate stability (if provided)
    if stability is not None:
        try:
            stability = float(stability)
            if not (0.0 <= stability <= 1.0):
                raise ValueError()
        except ValueError:
            return jsonify({"success": False, "error": "stability must be a float between 0.0 and 1.0"}), 400

    # Validate similarity_boost (if provided)
    if similarity_boost is not None:
        try:
            similarity_boost = float(similarity_boost)
            if not (0.0 <= similarity_boost <= 1.0):
                raise ValueError()
        except ValueError:
            return jsonify({"success": False, "error": "similarity_boost must be a float between 0.0 and 1.0"}), 400

    # Call the TTS service
    try:
        filename = generate_audio(text, language, voice, stability, similarity_boost)
        temp_filepath = os.path.join(AUDIO_DIR, filename)
        
        # Calculate duration
        duration = 0
        try:
            audio = MP3(temp_filepath)
            duration = audio.info.length
        except Exception:
            pass
            
        # Generate title (first 30 chars of text)
        title = text[:30] + '...' if len(text) > 30 else text
        if not title:
            title = "Voice Generation"
            
        # Persist to storage
        storage_ref = storage.save_audio(temp_filepath, filename)
        
        import json
        sections_data = json.dumps(sections) if sections else None
        listening_data = json.dumps(listening_data_input) if listening_data_input else None
        
        # Create DB record
        generation = AudioGeneration(
            user_id=current_user.id,
            title=title,
            text=text,
            language=language,
            voice=voice,
            audio_storage_reference=storage_ref,
            duration=duration,
            sections_data=sections_data,
            listening_data=listening_data
        )
        db.session.add(generation)
        db.session.commit()
        
        audio_url = f"{request.host_url.rstrip('/')}/api/audio/{generation.id}/stream"
        
        return jsonify({
            "success": True,
            "audio_url": audio_url,
            "generation": generation.to_dict()
        }), 201
        
    except ProviderError as e:
        # Pass the exact status code to the frontend
        return jsonify({"success": False, "error": str(e)}), e.status_code
    except Exception as e:
        # General server errors
        return jsonify({"success": False, "error": "Internal server error during speech generation."}), 500
