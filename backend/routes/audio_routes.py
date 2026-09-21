from flask import Blueprint, request, jsonify, send_file
from models import db, AudioGeneration
from utils.auth import token_required
from services.storage_service import storage
import os

audio_bp = Blueprint('audio_bp', __name__)

@audio_bp.route('/', methods=['GET'])
@token_required
def get_library(current_user):
    generations = AudioGeneration.query.filter_by(user_id=current_user.id).order_by(AudioGeneration.created_at.desc()).all()
    return jsonify({
        "success": True,
        "generations": [gen.to_dict() for gen in generations]
    }), 200

@audio_bp.route('/<generation_id>', methods=['GET'])
@token_required
def get_generation(current_user, generation_id):
    generation = AudioGeneration.query.filter_by(id=generation_id, user_id=current_user.id).first()
    if not generation:
        return jsonify({"success": False, "error": "Generation not found."}), 404
        
    return jsonify({
        "success": True,
        "generation": generation.to_dict()
    }), 200

@audio_bp.route('/<generation_id>/stream', methods=['GET'])
@token_required
def stream_audio(current_user, generation_id):
    generation = AudioGeneration.query.filter_by(id=generation_id, user_id=current_user.id).first()
    if not generation:
        return jsonify({"success": False, "error": "Generation not found."}), 404
        
    path = storage.get_audio_path(generation.audio_storage_reference)
    if not path:
        return jsonify({"success": False, "error": "Audio file unavailable."}), 404
        
    return send_file(path, mimetype='audio/mpeg')

@audio_bp.route('/<generation_id>', methods=['DELETE'])
@token_required
def delete_generation(current_user, generation_id):
    generation = AudioGeneration.query.filter_by(id=generation_id, user_id=current_user.id).first()
    if not generation:
        return jsonify({"success": False, "error": "Generation not found."}), 404
        
    # Delete from storage first
    storage.delete_audio(generation.audio_storage_reference)
    
    # Delete from DB
    db.session.delete(generation)
    db.session.commit()
    
    return jsonify({
        "success": True
    }), 200
@audio_bp.route('/<generation_id>', methods=['PATCH'])
@token_required
def update_generation(current_user, generation_id):
    generation = AudioGeneration.query.filter_by(id=generation_id, user_id=current_user.id).first()
    if not generation:
        return jsonify({"success": False, "error": "Generation not found."}), 404
        
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"success": False, "error": "Title is required."}), 400
        
    new_title = data.get('title', '').strip()
    if not new_title:
        return jsonify({"success": False, "error": "Title cannot be empty."}), 400
        
    if len(new_title) > 255:
        return jsonify({"success": False, "error": "Title is too long (maximum 255 characters)."}), 400
        
    generation.title = new_title
    db.session.commit()
    
    return jsonify({
        "success": True,
        "generation": generation.to_dict()
    }), 200
