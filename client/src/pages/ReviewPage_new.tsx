import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface ReviewPageProps {
  onBack: () => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ onBack }) => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const response = await apiClient.listSurveys();
      if (response.success) {
        setSurveys(response.data.surveys);
        if (response.data.surveys.length > 0 && !selectedSurvey) {
          selectSurvey(response.data.surveys[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSurvey = async (surveyId: number) => {
    setLoading(true);
    try {
      const [surveyResponse, analyticsResponse] = await Promise.all([
        apiClient.getSurvey(surveyId.toString()),
        apiClient.getSurveyAnalytics(surveyId)
      ]);

      if (surveyResponse.success) {
        setSelectedSurvey(surveyResponse.data);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error loading survey details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForRating = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Responses & Analytics</h2>
            <p className="text-gray-600">Analyze customer feedback and identify trends</p>
          </div>

          <button
            onClick={loadSurveys}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Survey Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Survey</label>
          <select
            value={selectedSurvey?.id || ''}
            onChange={(e) => selectSurvey(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {surveys.length === 0 ? (
              <option value="">No surveys available</option>
            ) : (
              surveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.title} ({survey.created_at})
                </option>
              ))
            )}
          </select>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        )}

        {!loading && analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900">{analytics.total_responses}</div>
                <div className="text-sm text-blue-700">Total Responses</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {analytics.questions.find((q: any) => q.type === 'rating')?.average?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-green-700">Average Rating</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-900">{analytics.questions.length}</div>
                <div className="text-sm text-purple-700">Total Questions</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-amber-900">
                  {analytics.total_responses > 0 ? '100%' : '0%'}
                </div>
                <div className="text-sm text-amber-700">Completion Rate</div>
              </div>
            </div>

            {/* Question Analytics */}
            <div className="space-y-8">
              {analytics.questions.map((questionData: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{questionData.question}</h3>

                  {questionData.type === 'rating' && questionData.distribution && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Average Rating:</span>
                        <span className="font-semibold text-lg">{questionData.average}/5</span>
                      </div>

                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = questionData.distribution[rating] || 0;
                        const percentage = analytics.total_responses > 0
                          ? (count / analytics.total_responses) * 100
                          : 0;

                        return (
                          <div key={rating} className="flex items-center space-x-4">
                            <span className="w-16 text-sm font-medium">{rating} stars</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-full ${getColorForRating(rating)} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-20 text-sm text-gray-600 text-right">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {questionData.type === 'multiple-choice' && questionData.distribution && (
                    <div className="space-y-3">
                      {Object.entries(questionData.distribution).map(([option, count]: any) => {
                        const percentage = analytics.total_responses > 0
                          ? (count / analytics.total_responses) * 100
                          : 0;

                        return (
                          <div key={option} className="flex items-center space-x-4">
                            <span className="w-1/3 text-sm font-medium truncate">{option}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-20 text-sm text-gray-600 text-right">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {questionData.type === 'text' && (
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-600 mb-2">{questionData.responses.length} text responses</p>
                      <div className="space-y-2">
                        {questionData.responses.slice(0, 5).map((response: string, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{response}</p>
                          </div>
                        ))}
                        {questionData.responses.length > 5 && (
                          <p className="text-sm text-gray-500 text-center pt-2">
                            And {questionData.responses.length - 5} more responses...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !analytics && surveys.length === 0 && (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Surveys Yet</h3>
            <p className="text-gray-600 mb-6">Create a survey to start collecting feedback</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
