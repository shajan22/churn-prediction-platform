import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, LogOut, Clock, Activity, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

interface UserProfileModalProps {
    onClose: () => void;
    onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose, onLogout }) => {
    const { user, setUser, setPredictionResults } = useAppStore();
    const [recentWorks, setRecentWorks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentWorks = async () => {
            if (!user?.id) return;
            try {
                const [surveysRes, reportsRes] = await Promise.all([
                    apiClient.listSurveys(),
                    apiClient.listReports()
                ]);

                let combinedWorks: any[] = [];

                if (surveysRes.success && surveysRes.data?.surveys) {
                    const mappedSurveys = surveysRes.data.surveys.map((s: any) => ({ ...s, type: 'survey' }));
                    combinedWorks = [...combinedWorks, ...mappedSurveys];
                }

                if (reportsRes.success && reportsRes.data?.reports) {
                    const mappedReports = reportsRes.data.reports.map((r: any) => ({ ...r, type: 'report' }));
                    combinedWorks = [...combinedWorks, ...mappedReports];
                }

                // Sort by newest first and limit to 5
                const sorted = combinedWorks
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5);
                setRecentWorks(sorted);
            } catch (err) {
                console.error('Failed to fetch recent works:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentWorks();
    }, [user?.id]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError('Image must be less than 2MB');
            return;
        }

        try {
            setIsUploading(true);
            setError('');

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const response = await apiClient.updateProfilePhoto(base64String);

                if (response.success) {
                    setUser({ ...user, profilePhoto: base64String });
                } else {
                    setError(response.message || 'Failed to update photo');
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsUploading(false);
        }
    };

    const handleWorkClick = (work: any) => {
        if (work.type === 'report') {
            setPredictionResults(work.data);
            onClose();
            navigate('/report');
        } else if (work.type === 'survey') {
            onClose();
            navigate('/survey', { state: { surveyId: work.id } });
        }
    };

    const handleDeleteWork = async (e: React.MouseEvent, work: any) => {
        e.stopPropagation();
        if (!user?.id) return;

        if (!window.confirm(`Are you sure you want to delete this ${work.type}?`)) {
            return;
        }

        try {
            setIsDeleting(work.id);
            let response;
            if (work.type === 'report') {
                response = await apiClient.deleteReport(work.id);
            } else if (work.type === 'survey') {
                response = await apiClient.deleteSurvey(work.id);
            }

            if (response?.success) {
                // Update local state to remove the item immediately
                setRecentWorks(prev => prev.filter(w => w.id !== work.id || w.type !== work.type));
            } else {
                setError(response?.message || `Failed to delete ${work.type}`);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during deletion');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-8 relative border-b border-indigo-100/50">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center">
                        {/* Profile Photo Area */}
                        <div className="relative group mb-4">
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ${!user?.profilePhoto ? 'bg-indigo-100 text-indigo-600' : ''}`}
                            >
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {error && (
                            <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 flex items-center gap-1.5 py-1.5 px-3 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h2>
                        <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            Recent Works
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : recentWorks.length > 0 ? (
                            recentWorks.map((work, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleWorkClick(work)}
                                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer"
                                    title={work.type === 'report' ? "Click to view dashboard" : "Click to view survey"}
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{work.title}</p>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(work.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 text-xs font-bold rounded-full ${work.type === 'report'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-indigo-50 text-indigo-700'
                                            }`}>
                                            {work.type === 'report' ? 'Report Dashboard' : 'Survey'}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteWork(e, work)}
                                            disabled={isDeleting === work.id}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title={`Delete ${work.type}`}
                                        >
                                            {isDeleting === work.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 border-dashed">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Activity className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No recent works found</p>
                                <p className="text-sm text-slate-400 mt-1">Start a new project to see it here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold rounded-xl transition-colors border border-slate-200 hover:border-red-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

            </div >
        </div >
    );
};

export default UserProfileModal;
