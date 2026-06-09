import pickle
import os
from pathlib import Path

class SessionManager:
    def __init__(self, cache_dir='cache'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
    def save_session(self, session_id, data):
        """Save session data to disk"""
        try:
            session_file = self.cache_dir / f"{session_id}.pkl"
            with open(session_file, 'wb') as f:
                pickle.dump(data, f)
            print(f"Session {session_id} saved to disk")
        except Exception as e:
            print(f"Error saving session {session_id}: {e}")
    
    def load_session(self, session_id):
        """Load session data from disk"""
        try:
            session_file = self.cache_dir / f"{session_id}.pkl"
            if session_file.exists():
                with open(session_file, 'rb') as f:
                    data = pickle.load(f)
                print(f"Session {session_id} loaded from disk")
                return data
            return None
        except Exception as e:
            print(f"Error loading session {session_id}: {e}")
            return None
    
    def delete_session(self, session_id):
        """Delete session data from disk"""
        try:
            session_file = self.cache_dir / f"{session_id}.pkl"
            if session_file.exists():
                session_file.unlink()
                print(f"Session {session_id} deleted from disk")
        except Exception as e:
            print(f"Error deleting session {session_id}: {e}")
    
    def get_all_sessions(self):
        """Get list of all session IDs"""
        try:
            return [f.stem for f in self.cache_dir.glob("*.pkl")]
        except Exception as e:
            print(f"Error getting sessions: {e}")
            return []
    
    def clear_all_sessions(self):
        """Clear all session data"""
        try:
            for f in self.cache_dir.glob("*.pkl"):
                f.unlink()
            print("All sessions cleared")
        except Exception as e:
            print(f"Error clearing sessions: {e}")
