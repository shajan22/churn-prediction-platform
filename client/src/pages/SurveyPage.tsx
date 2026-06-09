import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2, Copy, PlusCircle, MessageSquare, Star, CheckSquare } from 'lucide-react';

interface SurveyPageProps {
  onNext: (step: 'review') => void;
  onBack: () => void;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'rating' | 'text';
  question: string;
  options?: string[];
  required: boolean;
}

const SurveyPage: React.FC<SurveyPageProps> = ({ onNext, onBack }) => {
  const [surveyTitle, setSurveyTitle] = useState('Customer Satisfaction Survey');
  const [surveyDescription, setSurveyDescription] = useState('Help us improve your experience');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'rating',
      question: 'How satisfied are you with our service?',
      required: true
    },
    {
      id: '2',
      type: 'multiple-choice',
      question: 'What is the main reason you might consider leaving?',
      options: ['Price too high', 'Poor customer service', 'Missing features', 'Better alternatives', 'Other'],
      required: true
    }
  ]);
  const [surveyUrl, setSurveyUrl] = useState('');

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      required: false,
      ...(type === 'multiple-choice' && { options: ['Option 1', 'Option 2'] })
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const generateSurveyUrl = () => {
    const baseUrl = window.location.origin;
    const surveyId = Math.random().toString(36).substring(2, 8);
    setSurveyUrl(`${baseUrl}/survey/${surveyId}`);
  };

  const copySurveyUrl = () => {
    navigator.clipboard.writeText(surveyUrl);
    alert('Survey URL copied to clipboard!');
  };

  const renderQuestionEditor = (question: Question) => {
    return (
      <div key={question.id} className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {question.type === 'multiple-choice' && <CheckSquare className="w-5 h-5 text-blue-600" />}
            {question.type === 'rating' && <Star className="w-5 h-5 text-amber-500" />}
            {question.type === 'text' && <MessageSquare className="w-5 h-5 text-green-600" />}
            <span className="text-sm font-medium text-gray-700 capitalize">
              {question.type.replace('-', ' ')} Question
            </span>
          </div>
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter your question"
              value={question.question}
              onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {question.type === 'multiple-choice' && question.options && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Options:</label>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(question.id, index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {question.options!.length > 2 && (
                    <button
                      onClick={() => removeOption(question.id, index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addOption(question.id)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>
          )}

          {question.type === 'rating' && (
            <div className="text-sm text-gray-600">
              Rating scale: 1 (Poor) to 5 (Excellent)
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
              Required question
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Survey Builder
          </h2>
          <p className="text-gray-600">
            Create custom surveys to collect customer feedback and improve retention
          </p>
        </div>

        <div className="space-y-8">
          {/* Survey Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => addQuestion('multiple-choice')}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Multiple Choice</span>
                </button>
                <button
                  onClick={() => addQuestion('rating')}
                  className="flex items-center space-x-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Rating</span>
                </button>
                <button
                  onClick={() => addQuestion('text')}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Text</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map(renderQuestionEditor)}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <PlusCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No questions added yet</p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => addQuestion('multiple-choice')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Question
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Survey URL Generation */}
          {questions.length > 0 && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Distribution</h3>
              
              {!surveyUrl ? (
                <button
                  onClick={generateSurveyUrl}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Generate Survey Link
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Share this link with your customers:</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={surveyUrl}
                      readOnly
                      className="flex-1 p-3 border border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={copySurveyUrl}
                      className="flex items-center space-x-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Survey responses will be collected and available for analysis in the next step.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Recommendations</span>
          </button>

          {questions.length > 0 && surveyUrl && (
            <button
              onClick={() => onNext('review')}
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Review Survey Responses</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;