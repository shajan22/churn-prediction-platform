import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface Question {
    question: string;
    type: 'rating' | 'multiple-choice' | 'text';
    options?: string[];
    required: boolean;
}

interface Survey {
    title: string;
    description: string;
    questions: Question[];
}

const SurveyRespondentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchSurvey = async () => {
            if (!id) return;

            try {
                const response = await apiClient.getSurvey(id);
                if (response.success && response.data) {
                    setSurvey(response.data);

                    // Initialize empty answers
                    const initialAnswers: Record<string, string> = {};
                    response.data.questions.forEach((q: Question) => {
                        initialAnswers[q.question] = '';
                    });
                    setAnswers(initialAnswers);
                } else {
                    setError('Survey not found or is no longer available.');
                }
            } catch (err: any) {
                setError('Failed to load the survey. Please check the link and try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [question]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !survey) return;

        // Validation
        const missingRequired = survey.questions.some(q => q.required && !answers[q.question]);
        if (missingRequired) {
            setError('Please answer all required questions before submitting.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.submitSurvey(parseInt(id), answers);
            if (response.success) {
                setSuccess(true);
            } else {
                throw new Error(response.error || 'Failed to submit survey');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while submitting your response.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-slate-700">Loading Survey...</h2>
                </div>
            </div>
        );
    }

    if (error && !survey) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center border overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center border overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600">Your response has been recorded successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                    {/* Survey Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-3 leading-tight">{survey?.title}</h1>
                            <p className="text-blue-100 text-lg">{survey?.description}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start rounded-r-lg">
                                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-10">
                            {survey?.questions.map((q, index) => (
                                <div key={index} className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                                    <label className="block text-lg font-medium text-slate-900 mb-4">
                                        {index + 1}. {q.question}
                                        {q.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                                    </label>

                                    <div className="mt-2">
                                        {q.type === 'text' && (
                                            <textarea
                                                value={answers[q.question] || ''}
                                                onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
                                                rows={3}
                                                placeholder="Type your answer here..."
                                                required={q.required}
                                            />
                                        )}

                                        {q.type === 'rating' && (
                                            <div className="flex items-center gap-3 validate-group">
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <label
                                                        key={rating}
                                                        className={`
                              flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 cursor-pointer transition-all duration-200
                              ${answers[q.question] === rating.toString()
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700 scale-110 shadow-md font-bold'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                                                            }
                            `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${index}`}
                                                            value={rating.toString()}
                                                            checked={answers[q.question] === rating.toString()}
                                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                            className="sr-only"
                                                            required={q.required}
                                                        />
                                                        <span className="text-lg">{rating}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'multiple-choice' && (
                                            <div className="space-y-3">
                                                {q.options?.map((option, optIndex) => (
                                                    <label
                                                        key={optIndex}
                                                        className={`
                              flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                              ${answers[q.question] === option
                                                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                                                                : 'border-slate-200 bg-white hover:border-blue-300'
                                                            }
                            `}
                                                    >
                                                        <div className={`
                              flex items-center justify-center w-5 h-5 rounded-full border mr-4 flex-shrink-0
                              ${answers[q.question] === option
                                                                ? 'border-blue-600 bg-blue-600'
                                                                : 'border-slate-300 bg-white'
                                                            }
                            `}>
                                                            {answers[q.question] === option && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name={`question-${index}`}
                                                            value={option}
                                                            checked={answers[q.question] === option}
                                                            onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                                                            className="sr-only"
                                                            required={q.required}
                                                        />
                                                        <span className="text-base font-medium">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Survey'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Powered by <span className="font-semibold text-slate-700">ChurnPredict AI</span>
                </div>
            </div>
        </div>
    );
};

export default SurveyRespondentPage;
