from flask import Blueprint, request
from utils.decorators import error_handler, token_required
from utils.response_handler import success_response, error_response
from models.database import Database

survey_bp = Blueprint('survey', __name__)
db = Database()

@survey_bp.route('/survey/create', methods=['POST'])
@error_handler
@token_required
def create_survey(current_user_id):
    """Create a new survey"""
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    questions = data.get('questions')
    
    if not all([title, questions]):
        return error_response('Missing fields', 'Title and questions are required', 400)
    
    survey_id = db.create_survey(current_user_id, title, description, questions)
    
    return success_response({
        'surveyId': survey_id,
        'message': 'Survey created successfully'
    })

@survey_bp.route('/survey/list', methods=['GET'])
@error_handler
@token_required
def list_surveys(current_user_id):
    """List all surveys for the current authenticated user"""
    surveys = db.get_surveys(current_user_id)
    return success_response({'surveys': surveys})

@survey_bp.route('/survey/<int:survey_id>', methods=['GET'])
@error_handler
def get_survey(survey_id):
    """Get survey by ID"""
    survey = db.get_survey_by_id(survey_id)
    
    if survey:
        return success_response(survey)
    else:
        return error_response('Not found', 'Survey not found', 404)

@survey_bp.route('/survey/<int:survey_id>', methods=['DELETE'])
@error_handler
@token_required
def delete_survey(current_user_id, survey_id):
    """Delete a survey"""
    result = db.delete_survey(current_user_id, survey_id)
    
    if result['success']:
        return success_response(None, 'Survey deleted successfully')
    else:
        return error_response('Failed to delete', str(result.get('error', 'Unknown error')), 500)

@survey_bp.route('/survey/submit', methods=['POST'])
@error_handler
def submit_survey():
    """Submit survey response"""
    data = request.get_json()
    survey_id = data.get('surveyId')
    customer_email = data.get('customerEmail', 'anonymous')
    responses = data.get('responses')
    
    if not all([survey_id, responses]):
        return error_response('Missing fields', 'Survey ID and responses are required', 400)
    
    response_id = db.submit_survey_response(survey_id, customer_email, responses)
    
    return success_response({
        'responseId': response_id,
        'message': 'Survey submitted successfully'
    })

@survey_bp.route('/survey/<int:survey_id>/responses', methods=['GET'])
@error_handler
@token_required
def get_survey_responses(current_user_id, survey_id):
    """Get all responses for a survey"""
    # Security: Only owner can view responses
    survey = db.get_survey_by_id(survey_id)
    if not survey or int(survey['user_id']) != int(current_user_id):
        return error_response('Unauthorized', 'You do not own this survey', 403)
        
    responses = db.get_survey_responses(survey_id)
    return success_response({'responses': responses})

@survey_bp.route('/survey/<int:survey_id>/analytics', methods=['GET'])
@error_handler
@token_required
def get_survey_analytics(current_user_id, survey_id):
    """Get analytics for a survey"""
    # Security: Only owner can view analytics
    survey = db.get_survey_by_id(survey_id)
    if not survey or int(survey['user_id']) != int(current_user_id):
        return error_response('Unauthorized', 'You do not own this survey', 403)
        
    analytics = db.get_survey_analytics(survey_id)
    if analytics:
        return success_response(analytics)
    else:
        return error_response('Not found', 'Survey not found', 404)
