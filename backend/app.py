import os
from dotenv import load_dotenv

# Load environment variables explicitly from the backend directory .env
basedir = os.path.abspath(os.path.dirname(__file__))
env_path = os.path.join(basedir, '.env')
load_dotenv(dotenv_path=env_path, override=True)


from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate

from models import db
from routes.tts_routes import tts_bp
from routes.auth_routes import auth_bp
from routes.audio_routes import audio_bp
from services.tts_service import AUDIO_DIR

app = Flask(__name__)

# Configure Database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'vocalis.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('AUTH_SECRET_KEY', 'dev-secret-key')

# Initialize DB and Migrate
db.init_app(app)
migrate = Migrate(app, db)

# Allow CORS for local React development server with credentials
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS(app, resources={
    r"/api/*": {
        "origins": frontend_url,
        "supports_credentials": True
    }
})

# Setup Rate Limiting using in-memory storage (prevents abuse)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Attach the limiter to the app so blueprints can use it via current_app if needed
# but we will attach it globally or pass it to blueprint. Let's pass it to blueprint.
# Actually, Flask-Limiter applies to the app. We can limit blueprints.
limiter.limit("10 per minute")(tts_bp)

# Register blueprints
app.register_blueprint(tts_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(audio_bp, url_prefix='/api/audio')

# Handle rate limit exceeded cleanly
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"success": False, "error": f"Rate limit exceeded: {e.description}"}), 429

@app.route('/api/health', methods=['GET'])
@limiter.exempt
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/voices', methods=['GET'])
def get_voices():
    # Return minimal data for voices endpoint
    from services.tts_service import SUPPORTED_VOICES
    return jsonify([{"id": k, "languageCode": v["languageCode"]} for k, v in SUPPORTED_VOICES.items()])

@app.route('/api/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """Serves the generated audio files from the AUDIO_DIR."""
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
