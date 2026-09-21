import os
import shutil

# Base directory setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIBRARY_DIR = os.path.join(BASE_DIR, 'library_audio')
os.makedirs(LIBRARY_DIR, exist_ok=True)

class StorageProvider:
    def save_audio(self, source_path, filename):
        """Save audio to persistent storage. Returns storage reference."""
        raise NotImplementedError

    def get_audio_path(self, reference):
        """Retrieve the path/URL to the audio binary based on reference."""
        raise NotImplementedError

    def delete_audio(self, reference):
        """Delete audio binary from persistent storage."""
        raise NotImplementedError

class LocalStorageProvider(StorageProvider):
    """
    Local filesystem implementation of StorageProvider.
    NOTE: If deployed to ephemeral PaaS (Render free, Heroku), this storage 
    is NOT persistent across deploys. An S3Provider should be used for production.
    """
    def save_audio(self, source_path, filename):
        dest_path = os.path.join(LIBRARY_DIR, filename)
        shutil.copy2(source_path, dest_path)
        return filename

    def get_audio_path(self, reference):
        path = os.path.join(LIBRARY_DIR, reference)
        if os.path.exists(path):
            return path
        return None

    def delete_audio(self, reference):
        path = os.path.join(LIBRARY_DIR, reference)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except Exception:
                pass
        return False

# Export singleton instance
storage = LocalStorageProvider()
