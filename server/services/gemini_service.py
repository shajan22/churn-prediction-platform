import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        self.enabled = False
        api_key = os.getenv('GEMINI_API_KEY', '')
        if api_key:
            try:
                self.client = genai.Client(api_key=api_key)
                # Use current available models (as of October 2025)
                model_names = [
                    'gemini-2.5-flash',           # Stable Gemini 2.5 Flash
                    'gemini-flash-latest',        # Latest Flash model
                    'gemini-2.0-flash',           # Gemini 2.0 Flash
                    'gemini-pro-latest',          # Latest Pro model
                    'gemini-2.5-pro',             # Stable Gemini 2.5 Pro
                ]
                
                self.model_name = None
                for model_name in model_names:
                    try:
                        self.model_name = model_name
                        print(f"✓ Successfully configured Gemini model: {model_name}")
                        self.enabled = True
                        break
                    except Exception as e:
                        print(f"Model {model_name} not available: {e}")
                        continue
                
                if not self.model_name:
                    print("❌ No Gemini models available")
                    self.enabled = False
                    
            except Exception as e:
                print(f"❌ Error configuring Gemini: {e}")
                self.enabled = False
        else:
            self.enabled = False
            print("Warning: GEMINI_API_KEY not found. AI recommendations will use fallback mode.")
    
    def generate_recommendations(self, prediction_results, processed_data=None):
        """Generate AI-powered recommendations using Gemini API"""
        
        if not self.enabled:
            return None
        
        # Prepare data context for Gemini
        churn_rate = prediction_results.get('churnRate', 0)
        predicted_churn = prediction_results.get('predictedChurn', 0)
        predicted_retention = prediction_results.get('predictedRetention', 0)
        total_customers = prediction_results.get('totalCustomers', 0)
        accuracy = prediction_results.get('accuracy', 0)
        precision = prediction_results.get('precision', 0)
        recall = prediction_results.get('recall', 0)
        best_model = prediction_results.get('bestModel', 'Unknown')
        
        # Calculate key metrics
        high_risk = int(predicted_churn * 0.48)
        medium_risk = int(predicted_churn * 0.52)
        potential_revenue_loss = predicted_churn * 1200  # Average revenue per customer
        
        # Extract feature names if available in processed_data
        dataset_context = "Dataset Features: Not provided"
        if processed_data is not None:
            if hasattr(processed_data, 'columns'):
                dataset_context = f"Dataset Features Driving Predictions: {', '.join(processed_data.columns.tolist())}"
            elif isinstance(processed_data, dict) and 'features' in processed_data:
                dataset_context = f"Dataset Features Driving Predictions: {', '.join(processed_data['features'])}"
        
        prompt = f"""You are an advanced diagnostic AI analyzing a churn predicting Machine Learning model.
GENERATE 4-5 STRAIGHTFORWARD, BRUTALLY CONCISE, DATA-DRIVEN ACTION ITEMS based strictly on the metrics and the driving features below. 
DO NOT INCLUDE GENERIC BUSINESS "FLUFF" OR STRATEGIST BOILERPLATE.

{dataset_context}

GLOBAL PREDICTION DATA:
- Total Customers: {total_customers:,}
- Churn Rate: {churn_rate * 100:.1f}%
- Predicted Churn: {predicted_churn:,} customers
- Predicted Retention: {predicted_retention:,} customers
- High Risk Customers: {high_risk:,}
- Medium Risk Customers: {medium_risk:,}
- Potential Revenue Loss: ${potential_revenue_loss:,.0f}

MODEL PERFORMANCE (For context):
- Accuracy: {accuracy * 100:.1f}%, Precision: {precision * 100:.1f}%, Recall: {recall * 100:.1f}%. Model: {best_model}.

Generate recommendations in the following JSON format (return ONLY valid JSON, no markdown formatting blocks):
{{
  "recommendations": [
    {{
      "id": 1,
      "category": "High Priority|Customer Experience|Product Development|Pricing Strategy|Technical Optimization",
      "title": "Straight-to-the-point title (max 50 chars)",
      "description": "2 brutally concise, factual sentences directly tying a specific dataset feature to a needed retention action.",
      "impact": "High|Medium|Low",
      "effort": "Low|Medium|High",
      "timeline": "X-Y weeks",
      "expectedRevenue": "$XK format",
      "successRate": "XX-YY%",
      "icon": "Target|Users|TrendingUp|DollarSign|Clock",
      "color": "red|blue|purple|green|amber",
      "actions": [
        "Concise targeted action 1 based on dataset features",
        "Concise targeted action 2"
      ],
      "kpis": [
        {{"metric": "Specific Metric", "target": "Specific target %"}}
      ]
    }}
  ],
  "impactSummary": {{
    "potentialRevenueSaved": "Numeric value",
    "predictedChurnReduction": "Percentage as decimal (e.g., 0.23)",
    "customersImpacted": "Numeric value",
    "implementationTimeframe": "String like '4 weeks'"
  }}
}}

STRICT RULES:
1. Every recommendation MUST directly mention or combat one of the "Dataset Features Driving Predictions" if they were provided. If not provided, base it purely on the high churn metrics.
2. NO GENERIC FLUFF (e.g. "Enhance customer experience by engaging with them" is FORBIDDEN). Instead write "Launch retention discounts targeting the MonthlyCharges feature subset".
3. First recommendation MUST be "High Priority" addressing the highest correlated predicted churns.
4. Descriptions must be maximum 2 sentences and read like a straight-to-the-point engineering/data ticket.
"""

        response = None
        try:
            assert hasattr(self, 'client') and self.model_name is not None
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            if not response or not response.text:
                return None
            
            # Clean the response text (remove markdown code blocks if present)
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON response
            result = json.loads(response_text)
            
            # Validate structure
            if 'recommendations' in result and isinstance(result['recommendations'], list):
                return result
            else:
                print("Invalid response structure from Gemini")
                return None
                
        except Exception as e:
            print(f"Failed to parse Gemini response as JSON: {e}")
            if 'response' in locals() and response:
                print(f"Response text: {response.text}")
            return None

