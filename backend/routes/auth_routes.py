from flask import Blueprint, request, jsonify, current_app, make_response, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
import secrets
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime, timedelta, timezone
from models import db, User
from utils.auth import token_required

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
        
    hashed_password = generate_password_hash(data['password'], method='scrypt')
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.password_hash or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440)))
    }, current_app.config['SECRET_KEY'], algorithm="HS256")
    
    response = make_response(jsonify({
        'success': True,
        'user': user.to_dict()
    }))
    
    # Set HttpOnly cookie
    is_production = os.environ.get('FLASK_ENV') == 'production'
    response.set_cookie(
        'token', 
        token, 
        httponly=True, 
        secure=is_production,
        samesite='None' if is_production else 'Lax',
        path='/',
        max_age=int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440)) * 60
    )
    
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'success': True, 'message': 'Logged out successfully'}))
    is_production = os.environ.get('FLASK_ENV') == 'production'
    response.set_cookie('token', '', expires=0, httponly=True, secure=is_production, samesite='None' if is_production else 'Lax', path='/')
    return response

@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    })

# --- Google OAuth Routes ---

@auth_bp.route('/google', methods=['GET'])
def google_auth():
    # Generate a random state to protect against CSRF
    state = secrets.token_urlsafe(32)
    
    # Store state in session (or cookie)
    # Using a cookie here since we might not have server-side session configured
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI')
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"state={state}&"
        f"access_type=online"
    )
    
    response = make_response(redirect(auth_url))
    is_production = os.environ.get('FLASK_ENV') == 'production'
    response.set_cookie('oauth_state', state, httponly=True, secure=is_production, samesite='None' if is_production else 'Lax', max_age=600, path='/')
    return response

@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    error = request.args.get('error')
    if error:
        return redirect(f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/signin?error=google_auth_failed")
        
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Verify state
    stored_state = request.cookies.get('oauth_state')
    if not stored_state or stored_state != state:
        return redirect(f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/signin?error=invalid_state")
        
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI')
    
    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }
    
    try:
        token_res = requests.post(token_url, data=token_data)
        token_res.raise_for_status()
        tokens = token_res.json()
        id_token_jwt = tokens.get('id_token')
        
        # Verify the ID token
        id_info = id_token.verify_oauth2_token(
            id_token_jwt, google_requests.Request(), client_id
        )
        
        google_id = id_info['sub']
        email = id_info['email'].lower()
        name = id_info.get('name', '')
        
        # Determine the user
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Check if there is a local account with the same email
            user = User.query.filter_by(email=email).first()
            if user:
                # Link account
                user.google_id = google_id
                if user.auth_provider == 'local':
                    user.auth_provider = 'local_and_google'
                db.session.commit()
            else:
                # Create a new user
                user = User(
                    name=name,
                    email=email,
                    google_id=google_id,
                    auth_provider='google',
                    password_hash=None
                )
                db.session.add(user)
                db.session.commit()
                
        # Issue Vocalis JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440)))
        }, current_app.config['SECRET_KEY'], algorithm="HS256")
        
        # Redirect to frontend dashboard and set cookie
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
        response = make_response(redirect(f"{frontend_url}/dashboard"))
        
        # Set HttpOnly cookie
        is_production = os.environ.get('FLASK_ENV') == 'production'
        response.set_cookie(
            'token', 
            token, 
            httponly=True, 
            secure=is_production,
            samesite='None' if is_production else 'Lax',
            path='/',
            max_age=int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440)) * 60
        )
        # Clear oauth state
        response.set_cookie('oauth_state', '', expires=0, samesite='None' if is_production else 'Lax', secure=is_production, path='/')
        
        return response

    except ValueError as e:
        # Invalid token
        return redirect(f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/signin?error=invalid_token")
    except Exception as e:
        # General auth failure
        return redirect(f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/signin?error=auth_failed")
