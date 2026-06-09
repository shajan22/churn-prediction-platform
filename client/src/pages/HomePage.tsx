import React, { useCallback, useState } from 'react';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { motion } from 'framer-motion';

interface HomePageProps {
  onNext: (step: 'preprocess') => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNext, uploadedFile, setUploadedFile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file =>
      file.type === 'text/csv' ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (validFile) {
      setUploadedFile(validFile);
      setUploadError(null);
    } else {
      setUploadError('Please upload a CSV or Excel file');
    }
  }, [setUploadedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadError(null);
    }
  };

  const handleContinue = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await apiClient.uploadFile(uploadedFile);
      onNext('preprocess');
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-indigo-100/50">
            <Upload className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
            Upload Your Dataset
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Drag and drop your raw customer data to start analyzing and predicting churn behavior.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 mb-8 max-w-2xl mx-auto cursor-pointer"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>

            {uploadedFile ? (
              <div className="space-y-2 py-2">
                <p className="text-lg font-semibold text-emerald-600 flex items-center justify-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">✓</span>
                  File ready for analysis
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-slate-400 font-medium">
                  Supports CSV, Excel files (Max 10MB)
                </p>
              </div>
            )}

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-block mt-4 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all duration-200 shadow-sm"
            >
              {uploadedFile ? 'Switch File' : 'Browse Files'}
            </label>
          </div>
        </div>

        {uploadedFile && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleContinue}
              disabled={isUploading}
              className="group flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-300/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <span>{isUploading ? 'Uploading...' : 'Continue to Analysis'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {uploadError}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
          <div className="text-center p-6 bg-white/50 rounded-2xl hover:bg-indigo-50/30 transition-colors border border-transparent hover:border-indigo-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-700 font-bold shadow-sm shadow-indigo-100">
              1
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Upload Data</h3>
            <p className="text-sm text-slate-500 font-medium">Securely upload your CRM dataset in CSV or Excel format</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-2xl hover:bg-violet-50/30 transition-colors border border-transparent hover:border-violet-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-violet-700 font-bold shadow-sm shadow-violet-100">
              2
            </div>
            <h3 className="font-bold text-slate-800 mb-2">AI Analysis</h3>
            <p className="text-sm text-slate-500 font-medium">Our advanced ML models process and predict risk factors</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-2xl hover:bg-emerald-50/30 transition-colors border border-transparent hover:border-emerald-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-700 font-bold shadow-sm shadow-emerald-100">
              3
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Get Insights</h3>
            <p className="text-sm text-slate-500 font-medium">Receive actionable, strategic recommendations for retention</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;