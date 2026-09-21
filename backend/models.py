from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Google auth
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    auth_provider = db.Column(db.String(20), server_default='local', nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'auth_provider': self.auth_provider,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None
        }

class AudioGeneration(db.Model):
    __tablename__ = 'audio_generations'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    text = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    voice = db.Column(db.String(50), nullable=False)
    audio_storage_reference = db.Column(db.String(500), nullable=False)
    duration = db.Column(db.Float, nullable=True) # Duration in seconds
    sections_data = db.Column(db.Text, nullable=True) # JSON array of sections
    listening_data = db.Column(db.Text, nullable=True) # JSON object of listening intelligence
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('generations', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        import json
        sections = None
        if self.sections_data:
            try: sections = json.loads(self.sections_data)
            except: pass
            
        listening = None
        if self.listening_data:
            try: listening = json.loads(self.listening_data)
            except: pass
            
        return {
            'id': self.id,
            'title': self.title,
            'text': self.text,
            'language': self.language,
            'voice': self.voice,
            'duration': self.duration,
            'sections': sections,
            'listeningData': listening,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }
