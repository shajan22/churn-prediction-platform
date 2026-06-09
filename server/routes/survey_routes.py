from flask import Blueprint, request
from services.survey_service import SurveyService
from utils.decorators import error_handler
from utils.response_handler import success_response, error_response
from datetime import datetime

survey_bp = Blueprint('survey', __name__)

survey_service = SurveyService()

@survey_bp.route('/survey/create', methods=['POST'])
@error_handler
def create_survey():
    data = request.get_json()
    
    data['createdAt'] = datetime.now().isoformat()
    
    result = survey_service.create_survey(data)
    
    return success_response(result, 'Survey created successfully')

@survey_bp.route('/survey/<survey_id>', methods=['GET'])
@error_handler
def get_survey(survey_id):
    survey = survey_service.get_survey(survey_id)
    
    if not survey:
        return error_response('Survey not found', 'The requested survey does not exist', 404)
    
    return success_response(survey, 'Survey retrieved successfully')

@survey_bp.route('/survey/<survey_id>/response', methods=['POST'])
@error_handler
def submit_survey_response(survey_id):
    data = request.get_json()
    
    data['submittedAt'] = datetime.now().isoformat()
    
    try:
        response_id = survey_service.submit_response(survey_id, data)
        return success_response({
            'responseId': response_id
        }, 'Response submitted successfully')
    except ValueError as e:
        return error_response(str(e), 'Failed to submit response', 404)

@survey_bp.route('/survey/<survey_id>/results', methods=['GET'])
@error_handler
def get_survey_results(survey_id):
    try:
        results = survey_service.get_survey_results(survey_id)
        return success_response(results, 'Survey results retrieved successfully')
    except ValueError as e:
        return error_response(str(e), 'Failed to retrieve results', 404)
