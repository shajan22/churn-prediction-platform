import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, BarChart3, MessageCircle, TrendingUp, Users, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReviewPageProps {
  onBack: () => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ onBack }) => {
  const [surveyData, setSurveyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading survey responses
    setTimeout(() => {
      setSurveyData({
        totalResponses: 247,
        responseRate: 0.352,
        completionRate: 0.891,
        responses: [
          {
            question: 'How satisfied are you with our service?',
            type: 'rating',
            avgRating: 3.7,
            distribution: [
              { rating: 1, count: 12, percentage: 4.9 },
              { rating: 2, count: 28, percentage: 11.3 },
              { rating: 3, count: 67, percentage: 27.1 },
              { rating: 4, count: 89, percentage: 36.0 },
              { rating: 5, count: 51, percentage: 20.6 }
            ]
          },
          {
            question: 'What is the main reason you might consider leaving?',
            type: 'multiple-choice',
            responses: [
              { option: 'Price too high', count: 78, percentage: 31.6 },
              { option: 'Poor customer service', count: 45, percentage: 18.2 },
              { option: 'Missing features', count: 62, percentage: 25.1 },
              { option: 'Better alternatives', count: 38, percentage: 15.4 },
              { option: 'Other', count: 24, percentage: 9.7 }
            ]
          }
        ],
        textFeedback: [
          { feedback: "Great service overall, but pricing could be more competitive", sentiment: 'neutral' },
          { feedback: "Love the product features! Customer support is amazing", sentiment: 'positive' },
          { feedback: "Interface is confusing, need better tutorials", sentiment: 'negative' },
          { feedback: "Good value for money, would recommend to others", sentiment: 'positive' },
          { feedback: "Missing integrations with tools we use daily", sentiment: 'negative' },
          { feedback: "Fast response times, helpful support team", sentiment: 'positive' }
        ],
        sentimentAnalysis: {
          positive: 45.3,
          neutral: 32.1,
          negative: 22.6
        }
      });
      setIsLoading(false);
    }, 1500);
  }, []);

  const downloadResults = () => {
    // This would generate and download a CSV file in a real implementation
    alert('Survey results would be downloaded as CSV file');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey responses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Survey Results & Analytics
            </h2>
            <p className="text-gray-600">
              Real-time analysis of customer feedback and satisfaction metrics
            </p>
          </div>
          <button
            onClick={downloadResults}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Results</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Responses</p>
                  <p className="text-3xl font-bold text-blue-900">{surveyData.totalResponses}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Response Rate</p>
                  <p className="text-3xl font-bold text-green-900">
                    {(surveyData.responseRate * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {(surveyData.completionRate * 100).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Avg. Satisfaction</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {surveyData.responses[0].avgRating.toFixed(1)}/5
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Satisfaction Rating Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Satisfaction Rating Distribution</h3>
              <div className="space-y-4">
                {surveyData.responses[0].distribution.map((item: any) => (
                  <div key={item.rating} className="flex items-center space-x-4">
                    <div className="w-12 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">{item.rating} ⭐</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.rating <= 2 ? 'bg-red-500' :
                              item.rating === 3 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-600 w-12">{item.percentage}%</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.count} responses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Churn Reasons Analysis</h3>
              <div className="space-y-4">
                {surveyData.responses[1].responses.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{item.option}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-semibold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-600">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Sentiment Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {surveyData.sentimentAnalysis.positive}%
                </div>
                <div className="text-sm text-green-800">Positive Feedback</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-600">
                  {surveyData.sentimentAnalysis.neutral}%
                </div>
                <div className="text-sm text-gray-800">Neutral Feedback</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <ThumbsDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {surveyData.sentimentAnalysis.negative}%
                </div>
                <div className="text-sm text-red-800">Negative Feedback</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sample Feedback Comments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveyData.textFeedback.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      item.sentiment === 'positive' ? 'bg-green-50 border-green-500' :
                      item.sentiment === 'negative' ? 'bg-red-50 border-red-500' :
                      'bg-gray-50 border-gray-500'
                    }`}
                  >
                    <p className="text-sm text-gray-800 italic">"{item.feedback}"</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        item.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Action Items Based on Feedback</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Address Pricing Concerns (31.6% of responses)</p>
                  <p className="text-sm text-gray-600">Consider implementing tiered pricing or loyalty discounts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Improve Product Features (25.1% of responses)</p>
                  <p className="text-sm text-gray-600">Focus on developing top requested integrations and functionalities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Enhance Customer Service (18.2% of responses)</p>
                  <p className="text-sm text-gray-600">Invest in support team training and faster response times</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Survey Builder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;