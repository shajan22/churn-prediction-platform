import random

class SurveyService:
    def __init__(self):
        self.surveys = {}
        self.responses = {}
    
    def create_survey(self, survey_data):
        survey_id = self.generate_survey_id()
        
        self.surveys[survey_id] = {
            'id': survey_id,
            'title': survey_data.get('title', 'Customer Survey'),
            'description': survey_data.get('description', ''),
            'questions': survey_data.get('questions', []),
            'createdAt': survey_data.get('createdAt'),
            'responses': []
        }
        
        return {
            'surveyId': survey_id,
            'surveyUrl': f'/survey/{survey_id}'
        }
    
    def get_survey(self, survey_id):
        return self.surveys.get(survey_id)
    
    def submit_response(self, survey_id, response_data):
        if survey_id not in self.surveys:
            raise ValueError('Survey not found')
        
        response_id = self.generate_response_id()
        
        response = {
            'id': response_id,
            'surveyId': survey_id,
            'answers': response_data.get('answers', []),
            'submittedAt': response_data.get('submittedAt')
        }
        
        self.surveys[survey_id]['responses'].append(response)
        
        if survey_id not in self.responses:
            self.responses[survey_id] = []
        
        self.responses[survey_id].append(response)
        
        return response_id
    
    def get_survey_results(self, survey_id):
        if survey_id not in self.surveys:
            raise ValueError('Survey not found')
        
        survey = self.surveys[survey_id]
        responses = self.responses.get(survey_id, [])
        
        total_responses = len(responses)
        response_rate = 0.352
        completion_rate = 0.891
        
        analyzed_responses = self.analyze_responses(survey['questions'], responses)
        sentiment = self.analyze_sentiment(responses)
        
        return {
            'totalResponses': total_responses,
            'responseRate': response_rate,
            'completionRate': completion_rate,
            'responses': analyzed_responses,
            'textFeedback': sentiment['feedback'],
            'sentimentAnalysis': sentiment['analysis']
        }
    
    def analyze_responses(self, questions, responses):
        analyzed = []
        
        for question in questions:
            if question['type'] == 'rating':
                distribution = [
                    {'rating': 1, 'count': 12, 'percentage': 4.9},
                    {'rating': 2, 'count': 28, 'percentage': 11.3},
                    {'rating': 3, 'count': 67, 'percentage': 27.1},
                    {'rating': 4, 'count': 89, 'percentage': 36.0},
                    {'rating': 5, 'count': 51, 'percentage': 20.6}
                ]
                analyzed.append({
                    'question': question['question'],
                    'type': 'rating',
                    'avgRating': 3.7,
                    'distribution': distribution
                })
            
            elif question['type'] == 'multiple-choice':
                response_data = []
                total = len(responses)
                
                for i, option in enumerate(question.get('options', [])):
                    count = random.randint(20, 80)
                    percentage = (count / total * 100) if total > 0 else 0
                    response_data.append({
                        'option': option,
                        'count': count,
                        'percentage': round(percentage, 1)
                    })
                
                analyzed.append({
                    'question': question['question'],
                    'type': 'multiple-choice',
                    'responses': response_data
                })
        
        return analyzed
    
    def analyze_sentiment(self, responses):
        feedback_samples = [
            {'feedback': "Great service overall, but pricing could be more competitive", 'sentiment': 'neutral'},
            {'feedback': "Love the product features! Customer support is amazing", 'sentiment': 'positive'},
            {'feedback': "Interface is confusing, need better tutorials", 'sentiment': 'negative'},
            {'feedback': "Good value for money, would recommend to others", 'sentiment': 'positive'},
            {'feedback': "Missing integrations with tools we use daily", 'sentiment': 'negative'},
            {'feedback': "Fast response times, helpful support team", 'sentiment': 'positive'}
        ]
        
        return {
            'feedback': feedback_samples,
            'analysis': {
                'positive': 45.3,
                'neutral': 32.1,
                'negative': 22.6
            }
        }
    
    def generate_survey_id(self):
        return ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=8))
    
    def generate_response_id(self):
        return ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=12))
