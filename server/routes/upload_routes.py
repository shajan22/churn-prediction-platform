from flask import Blueprint, request
from utils.file_handler import save_uploaded_file, get_file_size
from utils.decorators import error_handler, validate_file, token_required
from utils.response_handler import success_response, error_response

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
@error_handler
@token_required
@validate_file
def upload_file(current_user_id):
    file = request.files['file']
    
    filepath, filename = save_uploaded_file(file)
    
    if not filepath:
        return error_response('Invalid file type', 'Only CSV and Excel files are allowed', 400)
    
    file_size = get_file_size(filepath)
    
    return success_response({
        'filename': filename,
        'filepath': filepath,
        'size': file_size,
        'sizeInMB': round(file_size / (1024 * 1024), 2)
    }, 'File uploaded successfully')
