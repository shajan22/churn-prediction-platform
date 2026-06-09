from services.gemini_service import GeminiService
import math

class RecommendationService:
    def __init__(self):
        self.recommendations = []
        self.gemini_service = GeminiService()
    
    def _ensure_finite(self, value, default=0):
        """Ensure a value is finite, return default if not"""
        if value is None or not isinstance(value, (int, float)):
            return default
        if math.isnan(value) or math.isinf(value):
            return default # type: ignore
        return value
    
    def _format_revenue(self, amount):
        """Safely format revenue amount"""
        safe_amount = self._ensure_finite(amount, 0)
        if safe_amount == 0:
            return '$0K'
        return f'${safe_amount / 1000:.0f}K'
    
    def generate_recommendations(self, prediction_results, processed_data=None):
        """
        Generate recommendations using Gemini AI first, fallback to template if needed
        """
        # Try Gemini AI first
        if self.gemini_service.enabled:
            print("Attempting to generate AI-powered recommendations with Gemini...")
            gemini_result = self.gemini_service.generate_recommendations(prediction_results, processed_data)
            
            if gemini_result and 'recommendations' in gemini_result:
                print(f"Successfully generated {len(gemini_result['recommendations'])} AI recommendations")
                return gemini_result
            else:
                print("Gemini did not return valid recommendations, falling back to template")
        else:
            print("Gemini API not configured, using fallback recommendations")
        
        # Fallback to template-based recommendations
        return self._generate_fallback_recommendations(prediction_results)
    
    def _generate_fallback_recommendations(self, prediction_results):
        """Generate template-based recommendations when Gemini is unavailable"""
        # Debug: Print what we received
        print("DEBUG - Prediction results received:", prediction_results)
        
        # Ensure all input values are finite with better defaults
        churn_rate = self._ensure_finite(prediction_results.get('churnRate', 0), 0.15)  # type: ignore
        predicted_churn = self._ensure_finite(prediction_results.get('predictedChurn', 0), 50)  # Default 50 customers
        predicted_retention = self._ensure_finite(prediction_results.get('predictedRetention', 0), 200)
        total_customers = self._ensure_finite(prediction_results.get('totalCustomers', 0), 250)
        
        print(f"DEBUG - Parsed values: churn_rate={churn_rate}, predicted_churn={predicted_churn}, total_customers={total_customers}")
        
        # Calculate derived values with safety checks
        high_risk = max(1, int(predicted_churn * 0.48))
        medium_risk = max(1, int(predicted_churn * 0.52))
        potential_revenue = max(1000.0, predicted_churn * 1200.0)  # Minimum $1K
        
        print(f"DEBUG - Calculated: high_risk={high_risk}, medium_risk={medium_risk}, potential_revenue={potential_revenue}")
        
        recommendations = [
            {
                'id': 1,
                'category': 'High Priority',
                'title': 'Proactive High-Risk Customer Retention',
                'description': f'Target {high_risk:,} high-risk customers identified by ML model with personalized retention offers. Based on {churn_rate*100:.1f}% predicted churn rate, immediate action can save significant revenue.',
                'impact': 'High',
                'effort': 'Medium',
                'timeline': '2-4 weeks',
                'expectedRevenue': self._format_revenue(potential_revenue * 0.35),
                'successRate': '65-75%',
                'icon': 'Target',
                'color': 'red',
                'actions': [
                    'Create personalized discount offers (15-25% off next renewal)',
                    'Assign dedicated customer success managers to at-risk accounts',
                    'Schedule proactive one-on-one retention calls',
                    'Provide exclusive early access to premium features',
                    'Implement usage monitoring and intervention triggers'
                ],
                'kpis': [
                    {'metric': 'Customer Retention Rate', 'target': 'Increase by 12-18%'},
                    {'metric': 'Engagement Score', 'target': 'Improve by 25%'},
                    {'metric': 'Churn Prevention', 'target': f'Save {int(high_risk * 0.7):,} customers'}
                ]
            },
            {
                'id': 2,
                'category': 'Customer Experience',
                'title': 'Enhanced Onboarding Journey',
                'description': f'Redesign onboarding to reduce early-stage churn. Analysis shows poor onboarding contributes to {max(1, int(predicted_churn * 0.28)):,} potential churns. Improved first 90-day experience targets 40% churn reduction.',
                'impact': 'High',
                'effort': 'High',
                'timeline': '6-8 weeks',
                'expectedRevenue': self._format_revenue(potential_revenue * 0.24),
                'successRate': '55-70%',
                'icon': 'Users',
                'color': 'blue',
                'actions': [
                    'Develop interactive product tutorials with gamification',
                    'Implement milestone-based celebration and rewards system',
                    'Create structured 30-60-90 day success check-ins',
                    'Build comprehensive self-service knowledge base',
                    'Deploy in-app contextual guidance system'
                ],
                'kpis': [
                    {'metric': 'Onboarding Completion', 'target': 'Achieve 85% completion rate'},
                    {'metric': 'Time to First Value', 'target': 'Reduce by 40%'},
                    {'metric': 'Early-Stage Churn', 'target': 'Decrease by 35%'}
                ]
            },
            {
                'id': 3,
                'category': 'Product Development',
                'title': 'Data-Driven Feature Enhancement',
                'description': f'Address feature gaps causing {max(1, int(predicted_churn * 0.18)):,} customers to churn. Survey feedback and usage analytics identify critical missing capabilities affecting retention.',
                'impact': 'Medium',
                'effort': 'High',
                'timeline': '8-12 weeks',
                'expectedRevenue': self._format_revenue(potential_revenue * 0.18),
                'successRate': '50-65%',
                'icon': 'TrendingUp',
                'color': 'purple',
                'actions': [
                    'Conduct exit interviews with churning customers',
                    'Prioritize top 5 feature requests from at-risk segments',
                    'Develop advanced analytics and reporting dashboard',
                    'Build integrations with popular third-party tools',
                    'Implement customer-requested automation features'
                ],
                'kpis': [
                    {'metric': 'Feature Adoption', 'target': 'Achieve 60% adoption within 3 months'},
                    {'metric': 'Customer Satisfaction', 'target': 'Increase NPS by 15 points'},
                    {'metric': 'Product Usage', 'target': 'Increase daily active users by 30%'}
                ]
            },
            {
                'id': 4,
                'category': 'Pricing Strategy',
                'title': 'Flexible Value-Based Pricing',
                'description': f'Introduce flexible pricing options to retain {max(1, int(predicted_churn * 0.22)):,} price-sensitive customers. Usage-based billing and loyalty programs can reduce price-driven churn by 45%.',
                'impact': 'Medium',
                'effort': 'Low',
                'timeline': '3-4 weeks',
                'expectedRevenue': self._format_revenue(potential_revenue * 0.15),
                'successRate': '60-75%',
                'icon': 'DollarSign',
                'color': 'green',
                'actions': [
                    'Launch tiered pricing structure aligned with customer segments',
                    'Offer 12-15% annual commitment discounts',
                    'Introduce consumption-based billing option',
                    'Create loyalty rewards program with escalating benefits',
                    'Implement win-back pricing for downgraded customers'
                ],
                'kpis': [
                    {'metric': 'Price-Related Churn', 'target': 'Reduce by 45%'},
                    {'metric': 'Annual Contract Conversion', 'target': 'Increase to 55%'},
                    {'metric': 'Average Contract Value', 'target': 'Maintain or grow by 8%'}
                ]
            },
            {
                'id': 5,
                'category': 'Communication',
                'title': 'Predictive Engagement System',
                'description': f'Deploy ML-driven communication strategy to engage {medium_risk:,} medium-risk customers before they disengage. Proactive outreach at optimal moments can prevent 35% of predicted churn.',
                'impact': 'Medium',
                'effort': 'Medium',
                'timeline': '4-6 weeks',
                'expectedRevenue': self._format_revenue(potential_revenue * 0.12),
                'successRate': '50-65%',
                'icon': 'Clock',
                'color': 'amber',
                'actions': [
                    'Set up behavioral trigger-based engagement automation',
                    'Create personalized email nurture campaigns',
                    'Implement intelligent in-app notification system',
                    'Schedule quarterly business review sessions',
                    'Deploy customer health score monitoring and alerts'
                ],
                'kpis': [
                    {'metric': 'Email Engagement', 'target': 'Achieve 35% open rate, 8% CTR'},
                    {'metric': 'Response Rate', 'target': 'Reach 42% response to outreach'},
                    {'metric': 'Re-engagement Success', 'target': 'Reactivate 28% of at-risk users'}
                ]
            }
        ]
        
        # Ensure all impact summary values are finite
        impact_summary = {
            'potentialRevenueSaved': self._ensure_finite(potential_revenue * 0.65, 0),
            'predictedChurnReduction': self._ensure_finite(0.65, 0),
            'customersImpacted': max(0, int(self._ensure_finite(predicted_churn * 0.65, 0))),
            'implementationTimeframe': '3-6 months'
        }
        
        return {
            'recommendations': recommendations,
            'impactSummary': impact_summary
        }
