import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Lightbulb, Target, TrendingUp, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface RecommendationsPageProps {
  onNext: (step: 'survey') => void;
  onBack: () => void;
  predictionResults: any;
  preprocessedData: any;
}

const iconMap: any = {
  'Target': Target,
  'Users': Users,
  'TrendingUp': TrendingUp,
  'DollarSign': DollarSign,
  'Clock': Clock
};

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ onNext, onBack, predictionResults, preprocessedData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [impactSummary, setImpactSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (predictionResults && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [predictionResults]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiClient.getRecommendations(
        predictionResults,
        preprocessedData?.sessionId
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate recommendations');
      }
      
      setRecommendations(response.data.recommendations);
      setImpactSummary(response.data.impactSummary);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
      console.error('Recommendation generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!predictionResults) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Prediction Data</h2>
        <p className="text-gray-600 mb-6">Please complete the prediction analysis first.</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back to Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI-Powered Recommendations
          </h2>
          <p className="text-gray-600">
            Actionable strategies to reduce churn and improve customer retention based on your data
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error generating recommendations</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Generating personalized recommendations...</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-6">
            {/* Impact Summary */}
            {impactSummary && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Potential Impact Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {(() => {
                        const value = impactSummary.potentialRevenueSaved;
                        if (value && !isNaN(value) && isFinite(value)) {
                          return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                        return impactSummary.totalExpectedRevenue || 'N/A';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Potential Revenue Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(() => {
                        const value = impactSummary.predictedChurnReduction;
                        if (value && !isNaN(value) && isFinite(value)) {
                          return (value * 100).toFixed(0) + '%';
                        }
                        return impactSummary.churnReductionPotential || 'N/A';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Churn Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {(() => {
                        const value = impactSummary.customersImpacted || impactSummary.customersSaved || 0;
                        if (!isNaN(value) && isFinite(value)) {
                          return value.toLocaleString();
                        }
                        return 'N/A';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Customers Impacted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {impactSummary.implementationTimeframe || impactSummary.roi || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">{impactSummary.implementationTimeframe ? 'Implementation Time' : 'Expected ROI'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations List */}
            <div className="space-y-6">
              {recommendations.map((rec) => {
                const IconComponent = iconMap[rec.icon] || Target;
                const colorClasses = {
                  red: 'bg-red-100 text-red-600 border-red-200',
                  blue: 'bg-blue-100 text-blue-600 border-blue-200',
                  purple: 'bg-purple-100 text-purple-600 border-purple-200',
                  green: 'bg-green-100 text-green-600 border-green-200',
                  amber: 'bg-amber-100 text-amber-600 border-amber-200'
                };

                return (
                  <div key={rec.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[rec.color as keyof typeof colorClasses]}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                rec.category === 'High Priority' ? 'bg-red-100 text-red-800' :
                                rec.category === 'Customer Experience' ? 'bg-blue-100 text-blue-800' :
                                rec.category === 'Product Development' ? 'bg-purple-100 text-purple-800' :
                                rec.category === 'Pricing Strategy' ? 'bg-green-100 text-green-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {rec.category}
                              </span>
                              {rec.successRate && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  {rec.successRate} success rate
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                            <p className="text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">{rec.expectedRevenue}</div>
                            <div className="text-sm text-gray-500">Expected Revenue</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Impact:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rec.impact === 'High' ? 'bg-red-100 text-red-800' :
                              rec.impact === 'Medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.impact}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Effort:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rec.effort === 'High' ? 'bg-red-100 text-red-800' :
                              rec.effort === 'Medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.effort}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Timeline:</span>
                            <span className="text-sm text-gray-600">{rec.timeline}</span>
                          </div>
                        </div>

                        {rec.kpis && rec.kpis.length > 0 && (
                          <div className="bg-white p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Performance Indicators:</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {rec.kpis.map((kpi: any, idx: number) => (
                                <div key={idx} className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{kpi.target}</div>
                                  <div className="text-xs text-gray-600">{kpi.metric}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Action Items:</h4>
                          <ul className="space-y-1">
                            {rec.actions.map((action: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Implementation Priority */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Implementation Order</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="font-medium">Proactive Retention Campaign (High Priority)</span>
                  <span className="ml-auto text-sm text-gray-500">Start immediately</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="font-medium">Flexible Pricing Options</span>
                  <span className="ml-auto text-sm text-gray-500">Quick wins</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="font-medium">Predictive Engagement Campaign</span>
                  <span className="ml-auto text-sm text-gray-500">Medium term</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Report</span>
          </button>

          {recommendations.length > 0 && (
            <button
              onClick={() => onNext('survey')}
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Build Customer Survey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;