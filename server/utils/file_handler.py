import os
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = str(int(os.times().elapsed * 1000))
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        return filepath, unique_filename
    return None, None

def get_file_size(filepath):
    return os.path.getsize(filepath)

def delete_file(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False
