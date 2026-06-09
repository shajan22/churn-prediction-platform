from flask import Blueprint, request
from services.recommendation_service import RecommendationService
from utils.decorators import error_handler, token_required
from utils.response_handler import success_response, error_response
from routes.preprocessing_routes import data_store

recommendation_bp = Blueprint('recommendation', __name__)

@recommendation_bp.route('/recommendations', methods=['POST'])
@error_handler
@token_required
def get_recommendations(current_user_id):
    data = request.get_json()
    prediction_results = data.get('predictionResults')
    session_id = data.get('sessionId')
    
    # Convert sessionId to string if it's a number
    if session_id is not None:
        session_id = str(session_id)
    
    if not prediction_results:
        return error_response('Prediction results required', 'Please provide prediction results', 400)
    
    processed_data = None
    if session_id and session_id in data_store:
        processed_data = data_store[session_id].get('processed_data')
    
    service = RecommendationService()
    recommendations = service.generate_recommendations(prediction_results, processed_data)
    
    return success_response(recommendations, 'Recommendations generated successfully')

