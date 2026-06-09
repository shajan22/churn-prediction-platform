from flask import Blueprint, request
from services.preprocessing_service import DataPreprocessor
from utils.decorators import error_handler, token_required
from utils.response_handler import success_response, error_response
from utils.session_manager import SessionManager

preprocessing_bp = Blueprint('preprocessing', __name__)

data_store = {}
session_manager = SessionManager()

@preprocessing_bp.route('/preprocess', methods=['POST'])
@error_handler
@token_required
def preprocess_data(current_user_id):
    data = request.get_json()
    filepath = data.get('filepath')
    
    if not filepath:
        return error_response('Filepath is required', 'Please provide a valid filepath', 400) # type: ignore
    
    preprocessor = DataPreprocessor()
    result = preprocessor.preprocess(filepath)
    
    session_id = str(hash(filepath))
    
    # Store both the preprocessor and the processed data DataFrame
    processed_df = preprocessor.get_processed_data()
    
    session_data = {
        'preprocessor': preprocessor,
        'processed_data': processed_df
    }
    
    # Store in memory
    data_store[session_id] = session_data
    
    # Also persist to disk
    session_manager.save_session(session_id, session_data)
    
    print(f"Stored session {session_id} with {len(processed_df)} rows") # type: ignore
    print(f"Current sessions in store: {list(data_store.keys())}")
    
    result['sessionId'] = session_id
    
    return success_response(result, 'Data preprocessed successfully')

@preprocessing_bp.route('/preprocess/status', methods=['GET'])
@error_handler
@token_required
def get_preprocessing_status(current_user_id):
    return success_response({
        'status': 'ready',
        'message': 'Preprocessing service is ready',
        'sessions': list(data_store.keys()),
        'session_count': len(data_store)
    })
