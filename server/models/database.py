"""
Database Models Module.
Handles SQLite database connections, queries, and migrations.
"""
import sqlite3
import os
import hashlib
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Database:
    def __init__(self, db_path='data/churn_app.db'):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=20.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                profile_photo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if profile_photo column exists (for backward compatibility)
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'profile_photo' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_photo TEXT")
        
        # Surveys table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS surveys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                questions TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Survey responses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS survey_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL,
                customer_email TEXT,
                responses TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (survey_id) REFERENCES surveys (id)
            )
        ''')
        
        # Reports table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password):
        """Hash password using PBKDF2 SHA256"""
        return generate_password_hash(password, method='pbkdf2:sha256')
    
    def create_user(self, name, email, password):
        """Create a new user"""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            password_hash = self.hash_password(password)
            
            cursor.execute(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                (name, email, password_hash)
            )
            user_id = cursor.lastrowid
            conn.commit()
            return {'success': True, 'user_id': user_id}
        except sqlite3.IntegrityError:
            return {'success': False, 'error': 'Email already exists'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            if conn:
                conn.close()
    
    def authenticate_user(self, email, password):
        """Authenticate user credentials using secure hash comparison"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM users WHERE email = ?',
            (email,)
        )
        user_row = cursor.fetchone()
        conn.close()
        
        if user_row:
            stored_hash = user_row['password_hash']
            is_valid = False
            
            # 1. Try modern Werkzeug check
            if stored_hash.startswith(('pbkdf2:sha256:', 'scrypt:')):
                is_valid = check_password_hash(stored_hash, password)
            else:
                # 2. Try legacy SHA-256 check
                legacy_hash = hashlib.sha256(password.encode()).hexdigest()
                if stored_hash == legacy_hash:
                    is_valid = True
                    # Upgrade the hash for next time
                    new_hash = generate_password_hash(password)
                    try:
                        conn = self.get_connection()
                        cursor = conn.cursor()
                        cursor.execute(
                            'UPDATE users SET password_hash = ? WHERE id = ?',
                            (new_hash, user_row['id'])
                        )
                        conn.commit()
                        conn.close()
                    except:
                        pass # Non-critical if upgrade fails once

            if is_valid:
                user = dict(user_row)
                user.pop('password_hash', None)
                return {
                    'success': True,
                    'user': user
                }
        return {'success': False, 'error': 'Invalid credentials'}
    
    def get_user_by_email(self, email):
        """Get user by email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, profile_photo FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None

    def update_user_photo(self, user_id, photo_data):
        """Update a user's profile photo"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                'UPDATE users SET profile_photo = ? WHERE id = ?',
                (photo_data, user_id)
            )
            conn.commit()
            conn.close()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def create_survey(self, user_id, title, description, questions):
        """Create a new survey"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO surveys (user_id, title, description, questions) VALUES (?, ?, ?, ?)',
            (user_id, title, description, json.dumps(questions))
        )
        survey_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return survey_id
    
    def get_surveys(self, user_id=None):
        """Get all surveys or surveys by user"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if user_id:
            cursor.execute(
                'SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC',
                (user_id,)
            )
        else:
            cursor.execute('SELECT * FROM surveys WHERE is_active = 1 ORDER BY created_at DESC')
        
        surveys = []
        for row in cursor.fetchall():
            surveys.append({
                'id': row['id'],
                'user_id': row['user_id'],
                'title': row['title'],
                'description': row['description'],
                'questions': json.loads(row['questions']),
                'is_active': bool(row['is_active']),
                'created_at': row['created_at']
            })
        
        conn.close()
        return surveys
    
    def get_survey_by_id(self, survey_id):
        """Get survey by ID"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM surveys WHERE id = ?', (survey_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row['id'],
                'user_id': row['user_id'],
                'title': row['title'],
                'description': row['description'],
                'questions': json.loads(row['questions']),
                'is_active': bool(row['is_active']),
                'created_at': row['created_at']
            }
        return None
        
    def delete_survey(self, user_id, survey_id):
        """Delete a survey from the database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Also optionally delete the responses for foreign key constraint safety
            cursor.execute('DELETE FROM survey_responses WHERE survey_id = ?', (survey_id,))
            cursor.execute('DELETE FROM surveys WHERE id = ? AND user_id = ?', (survey_id, user_id))
            affected_rows = cursor.rowcount
            conn.commit()
            return {'success': affected_rows > 0}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()
    
    def submit_survey_response(self, survey_id, customer_email, responses):
        """Submit survey response"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO survey_responses (survey_id, customer_email, responses) VALUES (?, ?, ?)',
            (survey_id, customer_email, json.dumps(responses))
        )
        response_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return response_id
    
    def get_survey_responses(self, survey_id):
        """Get all responses for a survey"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM survey_responses WHERE survey_id = ? ORDER BY submitted_at DESC',
            (survey_id,)
        )
        
        responses = []
        for row in cursor.fetchall():
            responses.append({
                'id': row['id'],
                'survey_id': row['survey_id'],
                'customer_email': row['customer_email'],
                'responses': json.loads(row['responses']),
                'submitted_at': row['submitted_at']
            })
        
        conn.close()
        return responses
    
    def get_survey_analytics(self, survey_id):
        """Get analytics for a survey"""
        import typing
        
        responses = self.get_survey_responses(survey_id)
        survey = self.get_survey_by_id(survey_id)
        
        if not survey:
            return None
        
        analytics: typing.Dict[str, typing.Any] = {
            'total_responses': len(responses),
            'questions': []
        }
        
        survey_questions = survey.get('questions')
        if not isinstance(survey_questions, list):
            survey_questions = []
            
        # Analyze each question
        for question_item in survey_questions:
            if not isinstance(question_item, dict):
                continue
                
            question_data: typing.Dict[str, typing.Any] = {
                'question': question_item.get('question'),
                'type': question_item.get('type'),
                'responses': []
            }
            
            # Collect all responses for this question
            for response in responses:
                response_data = response.get('responses', {})
                if isinstance(response_data, dict):
                    answer = response_data.get(question_item.get('question'))
                    if answer:
                        responses_list = question_data.get('responses')
                        if isinstance(responses_list, list):
                            responses_list.append(answer)
            
            # Calculate statistics based on question type
            responses_raw = question_data.get('responses')
            if isinstance(responses_raw, list) and len(responses_raw) > 0:
                responses_list = list(responses_raw)
                if question_data.get('type') == 'rating':
                    avg_rating = sum(float(x) for x in responses_list) / len(responses_list)
                    question_data['average'] = float(f"{avg_rating:.2f}")
                    distribution: typing.Dict[str, int] = {}
                    for rating in responses_list:
                        str_rating = str(rating)
                        distribution[str_rating] = distribution.get(str_rating, 0) + 1
                        
                    question_data['distribution'] = distribution
                
                elif question_data.get('type') == 'multiple-choice':
                    distribution_mc: typing.Dict[str, int] = {}
                    for answer in responses_list:
                        str_answer = str(answer)
                        distribution_mc[str_answer] = distribution_mc.get(str_answer, 0) + 1
                    
                    question_data['distribution'] = distribution_mc
            
            analytics['questions'].append(question_data)
        
        return analytics

    def save_report(self, user_id, title, data):
        """Save a prediction report dashboard"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                'INSERT INTO reports (user_id, title, data) VALUES (?, ?, ?)',
                (user_id, title, json.dumps(data))
            )
            report_id = cursor.lastrowid
            conn.commit()
            return {'success': True, 'report_id': report_id}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()

    def get_user_reports(self, user_id):
        """Get all saved reports for a user"""
        import json
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
        
        reports = []
        for row in cursor.fetchall():
            reports.append({
                'id': row['id'],
                'user_id': row['user_id'],
                'title': row['title'],
                'data': json.loads(row['data']),
                'created_at': row['created_at']
            })
            
        conn.close()
        return reports
        
    def delete_report(self, user_id, report_id):
        """Delete a saved prediction report"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM reports WHERE id = ? AND user_id = ?', (report_id, user_id))
            affected_rows = cursor.rowcount
            conn.commit()
            return {'success': affected_rows > 0}
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            conn.close()
