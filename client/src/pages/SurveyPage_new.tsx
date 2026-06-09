import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, PlusCircle, MinusCircle, Save, LogIn, Mail, Lock, User } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';

interface SurveyPageProps {
  onNext: (step: 'review') => void;
  onBack: () => void;
}

interface Question {
  question: string;
  type: 'rating' | 'multiple-choice' | 'text';
  options?: string[];
  required: boolean;
}

const SurveyPage: React.FC<SurveyPageProps> = ({ onNext, onBack }) => {
  const { user, setUser, setToken } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [title, setTitle] = useState('Customer Satisfaction Survey');
  const [description, setDescription] = useState('Help us improve your experience');
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: 'How satisfied are you with our service?',
      type: 'rating',
      required: true
    }
  ]);

  const [surveyLink, setSurveyLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Consolidating with global store
  useEffect(() => {
    // Local storage in this component is now redundant as we use useAppStore
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await apiClient.login(authData.email, authData.password);
      } else {
        response = await apiClient.signup(authData.name, authData.email, authData.password);
      }

      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        setShowAuth(false);
        setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
      } else {
        setError(response.message || response.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setSuccess('Logged out successfully');
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'rating',
      required: false
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = updatedQuestions[questionIndex].options || [];
    updatedQuestions[questionIndex].options = [...options, ''];
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const generateSurvey = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const surveyData = {
        title,
        description,
        questions
      };

      const response = await apiClient.createSurvey(surveyData);

      if (response.success) {
        const link = `${window.location.origin}/survey/${response.data.surveyId}`;
        setSurveyLink(link);
        setSuccess('Survey created successfully!');
      } else {
        throw new Error(response.error || 'Failed to create survey');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create survey');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Builder</h2>
            <p className="text-gray-600">Create custom surveys to collect customer feedback and improve retention</p>
          </div>

          <div>
            {user ? (
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold">{user.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Sign Up (Optional)</span>
              </button>
            )}
          </div>
        </div>

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h3>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={authData.name}
                      onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {isLogin ? 'Login' : 'Sign Up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAuth(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && !showAuth && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Survey Details */}
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter survey title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter survey description"
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions</h3>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter question"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="rating">Rating (1-5)</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="text">Text</option>
                  </select>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>

                {q.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Options:</label>
                    {(q.options || []).map((option, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    ))}
                    <button
                      onClick={() => addOption(index)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Survey Link */}
        {/* Survey Link */}
        {surveyLink && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-2">Survey Link Generated:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={surveyLink}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg outline-none text-slate-600"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(surveyLink)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Copy
              </button>
              <a
                href={surveyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
              >
                Open
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={generateSurvey}
              disabled={isSaving || !title || questions.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Generating...' : 'Generate Survey Link'}</span>
            </button>

            <button
              onClick={() => onNext('review')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <span>View Responses</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
