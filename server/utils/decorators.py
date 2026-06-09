from functools import wraps
from flask import jsonify, request
import jwt
from config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401

        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except Exception:
            return jsonify({
                'success': False,
                'message': 'Token is invalid'
            }), 401

        return f(current_user_id, *args, **kwargs)
    return decorated

def error_handler(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'An error occurred while processing your request'
            }), 500
    return decorated_function

def validate_file(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        return f(*args, **kwargs)
    return decorated_function
