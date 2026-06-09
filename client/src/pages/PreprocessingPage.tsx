import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface PreprocessingPageProps {
  onNext: (step: 'predict') => void;
  onBack: () => void;
  uploadedFile: File | null;
  preprocessedData: any;
  setPreprocessedData: (data: any) => void;
}

const PreprocessingPage: React.FC<PreprocessingPageProps> = ({
  onNext,
  onBack,
  uploadedFile,
  preprocessedData,
  setPreprocessedData
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSteps, setProcessedSteps] = useState<string[]>(() => {
    return preprocessedData ? ['missing', 'duplicates', 'encoding', 'scaling', 'validation'] : [];
  });
  const [error, setError] = useState<string | null>(null);

  const preprocessingSteps = [
    { id: 'missing', title: 'Handling Missing Values', description: 'Identifying and filling null values' },
    { id: 'duplicates', title: 'Removing Duplicates', description: 'Detecting and removing duplicate records' },
    { id: 'encoding', title: 'Encoding Categories', description: 'Converting categorical variables to numeric' },
    { id: 'scaling', title: 'Feature Scaling', description: 'Normalizing numeric features' },
    { id: 'validation', title: 'Data Validation', description: 'Ensuring data quality and consistency' },
  ];

  const preprocessingRef = React.useRef(false);

  useEffect(() => {
    if (!preprocessedData && uploadedFile && !preprocessingRef.current) {
      preprocessingRef.current = true;
      runPreprocessing();
    }
  }, [uploadedFile, preprocessedData]);

  const runPreprocessing = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Small simulated delay for UX before we actually upload and process
      for (let i = 0; i < preprocessingSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setProcessedSteps(prev => {
          if (!prev.includes(preprocessingSteps[i].id)) {
            return [...prev, preprocessingSteps[i].id];
          }
          return prev;
        });
      }

      const uploadResponse = await apiClient.uploadFile(uploadedFile!);

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const filepath = uploadResponse.data.filepath;
      const preprocessResponse = await apiClient.preprocessData(filepath);

      if (!preprocessResponse.success) {
        throw new Error(preprocessResponse.error || 'Preprocessing failed');
      }

      console.log('Preprocessing completed successfully:', preprocessResponse.data);
      console.log('SessionId received:', preprocessResponse.data.sessionId);

      setPreprocessedData(preprocessResponse.data);

    } catch (err: any) {
      setError(err.message || 'An error occurred during preprocessing');
      console.error('Preprocessing error:', err);
      preprocessingRef.current = false; // allow retry if failed
    } finally {
      setIsProcessing(false);
    }
  };

  if (!uploadedFile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-amber-100/50">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Dataset Found</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Please return to the upload dashboard and provide a valid CRM dataset to continue.</p>
          <button
            onClick={onBack}
            className="w-full bg-slate-900 text-white font-semibold flex items-center justify-center px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Return to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="glass-card rounded-3xl p-8 md:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center space-x-3 bg-indigo-50 px-6 py-2 rounded-full mb-6 border border-indigo-100/50">
            <Database className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-900 font-semibold text-sm uppercase tracking-wider">Data Processing Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Data Preparation & Cleaning
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Our automated pipeline is validating, encoding, and scaling your dataset for optimal machine learning performance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Processing Steps */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 mb-5">Pipeline Execution</h3>
            {preprocessingSteps.map((step) => {
              const isCompleted = processedSteps.includes(step.id);
              const isProcessing = !isCompleted && processedSteps.length === preprocessingSteps.findIndex(s => s.id === step.id);

              return (
                <div
                  key={step.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 ${isCompleted
                    ? 'border-emerald-100 bg-emerald-50/50'
                    : isProcessing
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                      : 'border-slate-100 bg-white/50 opacity-60'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                    ) : isProcessing ? (
                      <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-7 border-2 border-slate-300 rounded-full flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${isCompleted ? 'text-emerald-900' : isProcessing ? 'text-indigo-900' : 'text-slate-700'}`}>{step.title}</h4>
                      <p className={`text-sm mt-0.5 ${isCompleted ? 'text-emerald-700/80' : isProcessing ? 'text-indigo-700/80' : 'text-slate-500'}`}>{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Summary */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-5">Dataset Report</h3>
              {preprocessedData ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100/50 shadow-sm shadow-indigo-100/20">
                    <div className="text-3xl font-extrabold text-indigo-600 mb-1">{preprocessedData.originalRows.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500">Initial Records</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100/50 shadow-sm shadow-emerald-100/20">
                    <div className="text-3xl font-extrabold text-emerald-600 mb-1">{preprocessedData.cleanedRows.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500">Cleaned Records</div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-white p-5 rounded-2xl border border-violet-100/50 shadow-sm shadow-violet-100/20">
                    <div className="text-3xl font-extrabold text-violet-600 mb-1">{preprocessedData.featuresCount.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500">Feature Columns</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100/50 shadow-sm shadow-amber-100/20">
                    <div className="text-3xl font-extrabold text-amber-600 mb-1">{preprocessedData.duplicatesRemoved.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500">Duplicates Trimmed</div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 p-10 rounded-2xl text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="h-24 bg-slate-200 rounded-2xl"></div>
                      <div className="h-24 bg-slate-200 rounded-2xl"></div>
                      <div className="h-24 bg-slate-200 rounded-2xl"></div>
                      <div className="h-24 bg-slate-200 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {preprocessedData && (
              <div className="space-y-6">
                {/* Original Input Data */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-500" />
                    Original Input Data
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">Raw data as uploaded (first 10 rows)</p>
                  <div className="glass-card rounded-2xl overflow-hidden border border-indigo-100 shadow-sm shadow-indigo-100/50">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                          <tr>
                            {preprocessedData.originalSampleData && preprocessedData.originalSampleData.length > 0 &&
                              Object.keys(preprocessedData.originalSampleData[0]).map((key: string) => (
                                <th key={key} className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                                  {key}
                                </th>
                              ))
                            }
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 divide-y divide-slate-100">
                          {preprocessedData.originalSampleData && preprocessedData.originalSampleData.map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-indigo-50/50 transition-colors">
                              {preprocessedData.originalSampleData[0] && Object.keys(preprocessedData.originalSampleData[0]).map((key: string, i: number) => {
                                const value = row[key];
                                return (
                                  <td key={i} className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-r-0 font-medium">
                                    {value !== null && value !== undefined ? (typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : String(value)) : 'N/A'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Preprocessed Data */}
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    Preprocessed Data
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">After cleaning, encoding, and scaling (first 10 rows)</p>
                  <div className="glass-card rounded-2xl overflow-hidden border border-emerald-100 shadow-sm shadow-emerald-100/50">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                          <tr>
                            {preprocessedData.sampleData && preprocessedData.sampleData.length > 0 &&
                              Object.keys(preprocessedData.sampleData[0]).map((key: string) => (
                                <th key={key} className="px-5 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                                  {key}
                                </th>
                              ))
                            }
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 divide-y divide-slate-100">
                          {preprocessedData.sampleData && preprocessedData.sampleData.map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-emerald-50/50 transition-colors">
                              {preprocessedData.sampleData[0] && Object.keys(preprocessedData.sampleData[0]).map((key: string, i: number) => {
                                const value = row[key];
                                return (
                                  <td key={i} className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-r-0 font-medium">
                                    {value !== null && value !== undefined ? (typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : String(value)) : 'N/A'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
            <span>Back to Upload</span>
          </button>

          {preprocessedData && !isProcessing && (
            <button
              onClick={() => onNext('predict')}
              className="group flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold border border-transparent hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Run Predictions</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreprocessingPage;