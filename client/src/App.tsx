import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProgressStepper from './components/ProgressStepper';
import HomePage from './pages/HomePage';
import PreprocessingPage from './pages/PreprocessingPage';
import PredictionPage from './pages/PredictionPage';
import ReportPage from './pages/ReportPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SurveyPage from './pages/SurveyPage_new';
import ReviewPage from './pages/ReviewPage_new';
import SurveyRespondentPage from './pages/SurveyRespondentPage';
import LoginModal from './components/LoginModal';
import UserProfileModal from './components/UserProfileModal';
import { useAppStore, Step } from './store/useAppStore';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentStep, setCurrentStep,
    user, setUser,
    setToken,
    uploadedFile, setUploadedFile,
    preprocessedData, setPreprocessedData,
    predictionResults, setPredictionResults
  } = useAppStore();

  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const steps: { key: Step; title: string; description: string; path: string }[] = [
    { key: 'upload', title: 'Upload', description: 'Upload your dataset', path: '/' },
    { key: 'preprocess', title: 'Preprocess', description: 'Clean and prepare data', path: '/preprocess' },
    { key: 'predict', title: 'Predict', description: 'Run ML predictions', path: '/predict' },
    { key: 'report', title: 'Report', description: 'View results dashboard', path: '/report' },
    { key: 'recommendations', title: 'Insights', description: 'AI recommendations', path: '/recommendations' },
    { key: 'survey', title: 'Survey', description: 'Build feedback surveys', path: '/survey' },
    { key: 'review', title: 'Review', description: 'Analyze responses', path: '/review' },
  ];

  // Sync route with state
  useEffect(() => {
    const currentPath = location.pathname;
    const step = steps.find(s => s.path === currentPath);
    if (step && step.key !== currentStep) {
      setCurrentStep(step.key);
    }
  }, [location.pathname, setCurrentStep, steps]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  const handleStepClick = (stepKey: Step) => {
    const step = steps.find(s => s.key === stepKey);
    if (step) {
      setCurrentStep(step.key);
      navigate(step.path);
    }
  };

  const commonProps = {
    onNext: (nextStepKey: Step) => {
      handleStepClick(nextStepKey);
    },
    onBack: () => {
      const currentIndex = steps.findIndex(step => step.key === currentStep);
      if (currentIndex > 0) {
        handleStepClick(steps[currentIndex - 1].key);
      }
    },
  };

  const MainLayout = () => (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setUser(null);
          setToken(null);
          setCurrentStep('upload');
          navigate('/');
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {isOffline && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2 text-center text-sm font-medium z-50 sticky top-0 shadow-sm flex items-center justify-center gap-2">
          <span>⚠️</span> You are currently offline. Operating in read-only mode.
        </div>
      )}

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
              Transform Insights into <span className="text-gradient">Retention</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Predict customer churn with enterprise-grade machine learning algorithms and uncover actionable insights to scale your business.
            </p>
          </div>

          <ProgressStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          <div className="mt-8">
            <Routes>
              <Route path="/" element={<HomePage {...commonProps} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />} />
              <Route path="/preprocess" element={<PreprocessingPage {...commonProps} uploadedFile={uploadedFile} preprocessedData={preprocessedData} setPreprocessedData={setPreprocessedData} />} />
              <Route path="/predict" element={<PredictionPage {...commonProps} preprocessedData={preprocessedData} predictionResults={predictionResults} setPredictionResults={setPredictionResults} />} />
              <Route path="/report" element={<ReportPage {...commonProps} predictionResults={predictionResults} />} />
              <Route path="/recommendations" element={<RecommendationsPage {...commonProps} predictionResults={predictionResults} preprocessedData={preprocessedData} />} />
              <Route path="/survey" element={<SurveyPage {...commonProps} />} />
              <Route path="/review" element={<ReviewPage {...commonProps} />} />
            </Routes>
          </div>
        </div>
      </main>

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={(userData, token) => {
            setUser(userData);
            setToken(token);
            setIsLoginModalOpen(false);
          }}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={() => {
            setUser(null);
            setToken(null);
            setIsProfileModalOpen(false);
            setCurrentStep('upload');
            navigate('/');
          }}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/survey/:id" element={<SurveyRespondentPage />} />
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </div>
  );
}

export default App;