import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Step = 'upload' | 'preprocess' | 'predict' | 'report' | 'recommendations' | 'survey' | 'review';

interface User {
    id?: number;
    name: string;
    email: string;
    profilePhoto?: string;
}

interface AppState {
    currentStep: Step;
    user: User | null;
    token: string | null;
    uploadedFile: File | null;
    preprocessedData: any;
    predictionResults: any;

    // Actions
    setCurrentStep: (step: Step) => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setUploadedFile: (file: File | null) => void;
    setPreprocessedData: (data: any) => void;
    setPredictionResults: (results: any) => void;
    resetSession: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            currentStep: 'upload',
            user: null,
            token: null,
            uploadedFile: null,
            preprocessedData: null,
            predictionResults: null,

            setCurrentStep: (step) => set({ currentStep: step }),
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setUploadedFile: (file) => set(() => ({
                uploadedFile: file,
                // Reset session data if a new file is uploaded
                ...(file ? { preprocessedData: null, predictionResults: null } : {})
            })),
            setPreprocessedData: (data) => set({ preprocessedData: data }),
            setPredictionResults: (results) => set({ predictionResults: results }),
            resetSession: () => set({
                uploadedFile: null,
                preprocessedData: null,
                predictionResults: null,
                currentStep: 'upload'
            }),
        }),
        {
            name: 'churn-predict-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                currentStep: state.currentStep
            }), // Persist token with user and step
        }
    )
);
