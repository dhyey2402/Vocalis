from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Allow CORS for local React development server
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/voices', methods=['GET'])
def get_voices():
    # Minimal static mock data for Day 7 backend connection test
    return jsonify([
        { "id": "en-US-1", "name": "Alloy", "languageCode": "en", "languageName": "English", "gender": "Female", "accent": "American", "style": "Conversational" },
        { "id": "hi-IN-1", "name": "Aditi", "languageCode": "hi", "languageName": "Hindi", "gender": "Female", "accent": "India", "style": "Standard" }
    ])

@app.route('/api/tts', methods=['POST'])
def generate_tts():
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "error": "Invalid request. JSON body is required."}), 400
        
    text = data.get('text')
    language = data.get('language')
    voice = data.get('voice')
    
    # Mock error handling endpoints (as required by specification)
    if text == "TEST_400":
        return jsonify({"success": False, "error": "Invalid request parameter."}), 400
    if text == "TEST_429":
        return jsonify({"success": False, "error": "Too many requests."}), 429
    if text == "TEST_500":
        return jsonify({"success": False, "error": "Internal server error."}), 500
    if text == "TEST_503":
        return jsonify({"success": False, "error": "Service unavailable."}), 503
        
    if not text or not language or not voice:
        return jsonify({"success": False, "error": "Missing required fields: text, language, or voice."}), 400
        
    # Valid response stub. Audio is not generated in Day 7.
    return jsonify({
        "success": True,
        "audio_url": "/audio/mock-backend-generated-file.mp3"
    }), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
