import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, TrendingUp, Target, Brain, BarChart3, Table } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { motion } from 'framer-motion';

interface PredictionPageProps {
  onNext: (step: 'report') => void;
  onBack: () => void;
  preprocessedData: any;
  predictionResults: any;
  setPredictionResults: (data: any) => void;
}

const PredictionPage: React.FC<PredictionPageProps> = ({
  onNext,
  onBack,
  preprocessedData,
  predictionResults,
  setPredictionResults
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentModel, setCurrentModel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const models = [
    'Gradient Boosting (XGBoost)',
    'Random Forest',
    'Logistic Regression',
    'Support Vector Machine',
    'Neural Network'
  ];

  useEffect(() => {
    if (!predictionResults && preprocessedData) {
      runPrediction();
    }
  }, [preprocessedData, predictionResults]);

  const runPrediction = async () => {
    setIsTraining(true);
    setError(null);

    try {
      for (let i = 0; i < models.length; i++) {
        setCurrentModel(models[i]);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      const sessionId = preprocessedData.sessionId;
      console.log('Running prediction with sessionId:', sessionId);
      console.log('Preprocessed data columns:', preprocessedData.columns);

      const response = await apiClient.predictChurn(sessionId);

      if (!response.success) {
        throw new Error(response.error || 'Prediction failed');
      }

      setPredictionResults(response.data);

    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction');
      console.error('Prediction error:', err);
    } finally {
      setIsTraining(false);
    }
  };

  if (!preprocessedData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-amber-100/50">
            <Brain className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Preprocessed Data</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Please complete the AI data preprocessing step before running predictions.</p>
          <button
            onClick={onBack}
            className="w-full bg-slate-900 text-white font-semibold flex items-center justify-center px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Return to Preprocessing
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 md:p-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 bg-fuchsia-50 px-6 py-2 rounded-full mb-6 border border-fuchsia-100/50">
            <Brain className="w-5 h-5 text-fuchsia-600" />
            <span className="text-fuchsia-900 font-semibold text-sm uppercase tracking-wider">Predictive Modeling</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Machine Learning Prediction
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Training and evaluating advanced AI algorithms to forecast customer behavior with high accuracy.
          </p>
        </div>

        {isTraining && (
          <div className="mb-10 p-8 glass-card border border-indigo-100 shadow-lg shadow-indigo-100/40 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Training AI Models</h3>
                  <p className="text-indigo-600 font-medium mt-1 pr-4">Evaluating: <span className="text-slate-600">{currentModel}</span></p>
                </div>
              </div>
              <div className="mt-6 bg-slate-100 rounded-full h-3 w-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${(models.indexOf(currentModel) + 1) / models.length * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {predictionResults && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100/50 shadow-sm shadow-indigo-100/20 group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex p-3 bg-white shadow-sm border border-indigo-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
                <p className="text-4xl font-extrabold text-slate-800">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                    {(predictionResults.accuracy * 100).toFixed(1)}
                  </span>
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm shadow-emerald-100/20 group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex p-3 bg-white shadow-sm border border-emerald-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Precision</p>
                <p className="text-4xl font-extrabold text-slate-800">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
                    {(predictionResults.precision * 100).toFixed(1)}
                  </span>
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-white p-6 rounded-2xl border border-violet-100/50 shadow-sm shadow-violet-100/20 group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex p-3 bg-white shadow-sm border border-violet-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-violet-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Recall</p>
                <p className="text-4xl font-extrabold text-slate-800">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-400">
                    {(predictionResults.recall * 100).toFixed(1)}
                  </span>
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100/50 shadow-sm shadow-amber-100/20 group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex p-3 bg-white shadow-sm border border-amber-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">F1-Score</p>
                <p className="text-4xl font-extrabold text-slate-800">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">
                    {(predictionResults.f1Score * 100).toFixed(1)}
                  </span>
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </p>
              </div>
            </div>

            {/* Original Data Preview */}
            <div className="glass-card p-8 rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-100/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-3">
                    <Table className="w-6 h-6 text-indigo-500" />
                    Original Data Preview
                  </h3>
                  <p className="text-sm font-medium text-slate-500 pl-9">First 10 rows of your processed dataset</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Rows</span>
                  <span className="font-extrabold text-indigo-600 text-lg">{predictionResults.totalCustomers.toLocaleString()}</span>
                </div>
              </div>

              {preprocessedData.originalSampleData && preprocessedData.originalSampleData.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-10">
                        <tr>
                          {Object.keys(preprocessedData.originalSampleData[0]).map((column, idx) => (
                            <th
                              key={idx}
                              className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-b border-slate-200"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-slate-100">
                        {preprocessedData.originalSampleData.slice(0, 10).map((row: any, rowIdx: number) => (
                          <tr key={rowIdx} className="hover:bg-indigo-50/50 transition-colors">
                            {preprocessedData.originalSampleData[0] && Object.keys(preprocessedData.originalSampleData[0]).map((key: string, colIdx: number) => {
                              const value = row[key];
                              return (
                                <td key={colIdx} className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-r-0 font-medium">
                                  {value !== null && value !== undefined ? (typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : String(value)) : 'N/A'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-500 text-center">
                      Showing <span className="text-slate-700">{Math.min(10, preprocessedData.originalSampleData.length)}</span> of <span className="text-slate-700">{predictionResults.totalCustomers.toLocaleString()}</span> total records
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Churn Prediction Summary & Model Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-3xl border border-rose-100 shadow-sm shadow-rose-100/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500" />
                    Churn Risk Profile
                  </h3>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500 uppercase tracking-wider text-sm">Total Audience</span>
                      <span className="font-bold text-slate-800 text-lg">{predictionResults.totalCustomers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500 uppercase tracking-wider text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div> High Risk (Churn)
                      </span>
                      <span className="font-bold text-rose-600 text-lg">{predictionResults.predictedChurn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-medium text-slate-500 uppercase tracking-wider text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Safe (Retain)
                      </span>
                      <span className="font-bold text-emerald-600 text-lg">{predictionResults.predictedRetention.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-200">
                  <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100/50 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Projected Attrition Rate</span>
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-rose-600 to-rose-400">
                      {(predictionResults.churnRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-100/30">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  Algorithm Performance
                </h3>
                <div className="space-y-4">
                  {predictionResults.modelComparison.map((model: any) => (
                    <div
                      key={model.name}
                      className={`p-4 rounded-2xl transition-all duration-300 ${model.name === 'XGBoost'
                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 shadow-sm shadow-indigo-100/50 scale-[1.02]'
                        : 'bg-white border border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold ${model.name === 'XGBoost' ? 'text-indigo-900' : 'text-slate-700'
                            }`}>
                            {model.name}
                          </span>
                          {model.name === 'XGBoost' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                              Selected Model
                            </span>
                          )}
                        </div>
                        <span className={`font-extrabold ${model.name === 'XGBoost' ? 'text-indigo-600 text-lg' : 'text-slate-500'
                          }`}>
                          {(model.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                Confusion Matrix
              </h3>
              <div className="grid grid-cols-2 gap-5 max-w-lg mx-auto">
                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
                  <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                    {predictionResults.confusionMatrix.trueNegative.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">True Negative</div>
                  <div className="text-xs font-medium text-emerald-600/80">Correctly predicted retention</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
                  <div className="text-4xl font-extrabold text-rose-600 mb-2">
                    {predictionResults.confusionMatrix.falsePositive.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-1">False Positive</div>
                  <div className="text-xs font-medium text-rose-600/80">Incorrectly predicted churn</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
                  <div className="text-4xl font-extrabold text-orange-600 mb-2">
                    {predictionResults.confusionMatrix.falseNegative.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-1">False Negative</div>
                  <div className="text-xs font-medium text-orange-600/80">Missed churn prediction</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm text-center transform transition duration-300 hover:scale-[1.02]">
                  <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                    {predictionResults.confusionMatrix.truePositive.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-1">True Positive</div>
                  <div className="text-xs font-medium text-emerald-600/80">Correctly predicted churn</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm flex items-center justify-center font-medium">
            <strong>Error:</strong> <span className="ml-2">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Preprocessing</span>
          </button>

          {predictionResults && !isTraining && (
            <button
              onClick={() => onNext('report')}
              className="group flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-8 py-3.5 rounded-xl font-bold border border-transparent hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>View Business Report</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionPage;