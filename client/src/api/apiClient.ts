import { useAppStore } from '../store/useAppStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = useAppStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiClient = {
  async uploadFile(file: File) {
    const token = useAppStore.getState().token;
    if (!token) {
      throw new Error('You must be logged in to upload files.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
    });

    return response.json();
  },

  async preprocessData(filepath: string) {
    const response = await fetch(`${API_BASE_URL}/preprocess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ filepath }),
    });

    return response.json();
  },

  async predictChurn(sessionId: string, targetColumn?: string) {
    const body: any = { sessionId };

    // Only include targetColumn if explicitly provided
    if (targetColumn) {
      body.targetColumn = targetColumn;
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    return response.json();
  },

  async getRecommendations(predictionResults: any, sessionId?: string) {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ predictionResults, sessionId }),
    });

    return response.json();
  },

  async createSurvey(surveyData: any) {
    const response = await fetch(`${API_BASE_URL}/survey/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(surveyData),
    });

    return response.json();
  },

  async getSurvey(surveyId: string) {
    const response = await fetch(`${API_BASE_URL}/survey/${surveyId}`, {
      method: 'GET',
    });

    return response.json();
  },

  async submitSurveyResponse(surveyId: string, responseData: any) {
    const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    });

    return response.json();
  },

  async getSurveyResults(surveyId: string) {
    const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/results`, {
      method: 'GET',
    });

    return response.json();
  },

  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    return response.json();
  },

  async signup(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return response.json();
  },

  async updateProfilePhoto(photoData: string) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ photoData }),
    });

    return response.json();
  },

  async listSurveys() {
    const response = await fetch(`${API_BASE_URL}/survey/list`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return response.json();
  },

  async saveReport(title: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/report/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, data }),
    });

    return response.json();
  },

  async listReports() {
    const response = await fetch(`${API_BASE_URL}/report/list`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return response.json();
  },

  async submitSurvey(surveyId: number, responses: any, customerEmail?: string) {
    const response = await fetch(`${API_BASE_URL}/survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ surveyId, responses, customerEmail }),
    });

    return response.json();
  },

  async getSurveyAnalytics(surveyId: number) {
    const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return response.json();
  },

  async deleteReport(reportId: number) {
    const response = await fetch(`${API_BASE_URL}/report/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return response.json();
  },

  async deleteSurvey(surveyId: number) {
    const response = await fetch(`${API_BASE_URL}/survey/${surveyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return response.json();
  }
};
