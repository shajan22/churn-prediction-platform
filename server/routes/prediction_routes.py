from flask import Blueprint, request
from services.prediction_service import ChurnPredictor
from utils.decorators import error_handler, token_required
from utils.response_handler import success_response, error_response
from models.database import Database

db = Database()
prediction_bp = Blueprint('prediction', __name__)

from routes.preprocessing_routes import data_store, session_manager

@prediction_bp.route('/predict', methods=['POST'])
@error_handler
@token_required
def predict_churn(current_user_id):
    data = request.get_json()
    session_id = data.get('sessionId')
    
    # Convert sessionId to string if it's a number
    if session_id is not None:
        session_id = str(session_id)
    
    print(f"Received prediction request with sessionId: {session_id} (type: {type(session_id)})")
    print(f"Available sessions in memory: {list(data_store.keys())}")
    
    if not session_id:
        return error_response('Session ID required', 'Please provide a valid session ID', 400)
    
    # Try to get from memory first, then from disk
    session_data = data_store.get(session_id)
    
    if not session_data:
        print(f"Session not in memory, trying to load from disk...")
        session_data = session_manager.load_session(session_id)
        
        if session_data:
            # Restore to memory
            data_store[session_id] = session_data
            print(f"Session {session_id} restored from disk")
        else:
            error_msg = f'Session {session_id} not found.'
            if len(data_store) == 0:
                available_disk_sessions = session_manager.get_all_sessions()
                if available_disk_sessions:
                    error_msg += f' Found {len(available_disk_sessions)} session(s) on disk but none match your session ID. Please run preprocessing again.'
                else:
                    error_msg += ' No sessions available. This usually means: (1) Preprocessing was not completed, or (2) Server was restarted and lost session data. Please go back to the preprocessing step and run it again.'
            else:
                error_msg += f' Available sessions: {list(data_store.keys())}'
            return error_response('Invalid session', error_msg, 400)
    
    processed_data = session_data['processed_data']
    
    if processed_data is None or processed_data.empty:
        return error_response('No data found', 'Please preprocess data first', 400)
    
    # Debug: Print available columns
    print(f"Available columns in processed data: {processed_data.columns.tolist()}")
    
    predictor = ChurnPredictor()
    
    # Auto-detect the target column
    target_column = data.get('targetColumn')
    
    # If not provided, try to find the churn column automatically
    if not target_column:
        available_cols_lower = {col.lower(): col for col in processed_data.columns}
        
        # Try common churn column names (in order of preference)
        churn_variations = [
            'churned', 'is_churned', 'ischurned', 'churn', 'is_churn', 'ischurn', 
            'customer_churn', 'exited', 'is_exited', 'left', 'attrition', 'status'
        ]
        
        for variation in churn_variations:
            if variation in available_cols_lower:
                target_column = available_cols_lower[variation]
                print(f"Auto-detected target column: {target_column}")
                break
        
        if not target_column:
            return error_response(
                'Target column not found',
                f'Could not find churn column. Available columns: {", ".join(processed_data.columns.tolist())}',
                400
            )
    
    print(f"Using target column: {target_column}")
    
    results = predictor.predict(processed_data, target_column)
    
    return success_response(results, 'Prediction completed successfully')

@prediction_bp.route('/predict/models', methods=['GET'])
@error_handler
@token_required
def get_available_models(current_user_id):
    models = [
        'Gradient Boosting (XGBoost)',
        'Random Forest',
        'Logistic Regression',
        'Support Vector Machine',
        'Neural Network'
    ]
    
    return success_response({
        'models': models
    }, 'Available models retrieved')

@prediction_bp.route('/report/save', methods=['POST'])
@error_handler
@token_required
def save_report(current_user_id):
    data = request.get_json()
    title = data.get('title')
    report_data = data.get('data')
    
    if not all([title, report_data]):
        return error_response('Missing fields', 'Title and report data are required', 400)
        
    result = db.save_report(current_user_id, title, report_data)
    
    if result['success']:
        return success_response({'id': result['report_id']}, 'Report saved successfully')
    else:
        return error_response('Save failed', result['error'], 500)

@prediction_bp.route('/report/list', methods=['GET'])
@error_handler
@token_required
def list_reports(current_user_id):
    reports = db.get_user_reports(current_user_id)
    return success_response({'reports': reports}, 'Reports retrieved successfully')

@prediction_bp.route('/report/<int:report_id>', methods=['DELETE'])
@error_handler
@token_required
def delete_report(current_user_id, report_id):
    result = db.delete_report(current_user_id, report_id)
    if result['success']:
        return success_response(None, 'Report deleted successfully')
    else:
        return error_response('Failed to delete', str(result.get('error', 'Unknown error')), 500)
