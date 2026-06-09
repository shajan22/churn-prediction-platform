from flask import Blueprint, request, jsonify
from models.database import Database
from utils.decorators import error_handler, token_required
from utils.response_handler import success_response, error_response
import jwt
import datetime
from config import Config

auth_bp = Blueprint('auth', __name__)
db = Database()

@auth_bp.route('/auth/signup', methods=['POST'])
@error_handler
def signup():
    """User signup endpoint"""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return error_response('Missing fields', 'Name, email, and password are required', 400)
    
    if len(password) < 8:
        return error_response('Weak password', 'Password must be at least 8 characters', 400)
    
    result = db.create_user(name, email, password)
    
    if result['success']:
        user = db.get_user_by_email(email)
        if not user:
            return error_response('Signup failed', 'User created but could not be retrieved', 500)
            
        # Generate token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, Config.SECRET_KEY, algorithm="HS256")
        
        return success_response({
            'user': user,
            'token': token
        }, 'Account created successfully')
    else:
        return error_response('Signup failed', str(result.get('error', 'Unknown error')), 400)

@auth_bp.route('/auth/login', methods=['POST'])
@error_handler
def login():
    """User login endpoint"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return error_response('Missing fields', 'Email and password are required', 400)
    
    result = db.authenticate_user(email, password)
    
    if result['success']:
        user = result['user']
        # Generate token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, Config.SECRET_KEY, algorithm="HS256")
        
        return success_response({
            'user': user,
            'token': token
        }, 'Login successful')
    else:
        return error_response('Login failed', str(result.get('error', 'Unknown error')), 401)

@auth_bp.route('/auth/verify', methods=['POST'])
@error_handler
def verify_email():
    """Check if email exists"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return error_response('Missing email', 'Email is required', 400)
    
    user = db.get_user_by_email(email)
    
    if user:
        return success_response({'exists': True, 'user': user})
    else:
        return success_response({'exists': False})

@auth_bp.route('/auth/profile/photo', methods=['POST'])
@error_handler
@token_required
def upload_profile_photo(current_user_id):
    """Upload or update profile photo"""
    data = request.get_json()
    photo_data = data.get('photoData') # Base64 string
    
    if not photo_data:
        return error_response('Missing fields', 'Photo data is required', 400)
        
    # Limit photo size to ~5MB (Base64 string is roughly 33% larger than binary)
    if len(photo_data) > 7 * 1024 * 1024:
        return error_response('File too large', 'Profile photo must be under 5MB', 413)
    
    # We could compress/validate the base64 string here but we trust the frontend bounds
    result = db.update_user_photo(current_user_id, photo_data)
    
    if result['success']:
        return success_response({'photo': photo_data}, 'Profile photo updated successfully')
    else:
        return error_response('Upload failed', str(result.get('error', 'Unknown error')), 500)
