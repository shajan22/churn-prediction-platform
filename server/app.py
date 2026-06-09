from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from config import Config

from routes.upload_routes import upload_bp
from routes.preprocessing_routes import preprocessing_bp
from routes.prediction_routes import prediction_bp
from routes.recommendation_routes import recommendation_bp
from routes.survey_routes_new import survey_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    Config.init_app(app)
    
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(preprocessing_bp, url_prefix='/api')
    app.register_blueprint(prediction_bp, url_prefix='/api')
    app.register_blueprint(recommendation_bp, url_prefix='/api')
    app.register_blueprint(survey_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return {
            'success': True,
            'message': 'Churn Prediction API',
            'version': '1.0.0',
            'endpoints': {
                'upload': '/api/upload',
                'preprocess': '/api/preprocess',
                'predict': '/api/predict',
                'recommendations': '/api/recommendations',
                'survey': '/api/survey',
                'auth_signup': '/api/auth/signup',
                'auth_login': '/api/auth/login'
            }
        }
    
    @app.route('/api/health')
    def health():
        return {
            'success': True,
            'status': 'healthy',
            'message': 'Server is running'
        }
        
    @app.errorhandler(Exception) # type: ignore
    def handle_exception(e):
        from flask import jsonify
        if isinstance(e, HTTPException):
            return jsonify({"success": False, "error": e.description}), e.code # type: ignore
        
        # Log the error for debugging
        app.logger.error(f"Server Error: {str(e)}")
        return jsonify({"success": False, "error": "An unexpected server error occurred."}), 500
    
    return app

if __name__ == '__main__':
    from os import environ
    app = create_app()
    debug_mode = environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
