from flask import jsonify
import numpy as np
import pandas as pd

def convert_to_json_serializable(obj):
    if isinstance(obj, dict):
        return {key: convert_to_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif pd.isna(obj):
        return None
    else:
        return obj

def success_response(data, message='Success', status=200):
    clean_data = convert_to_json_serializable(data)
    return jsonify({
        'success': True,
        'message': message,
        'data': clean_data
    }), status

def error_response(error, message='Error occurred', status=400):
    return jsonify({
        'success': False,
        'error': str(error),
        'message': message
    }), status
