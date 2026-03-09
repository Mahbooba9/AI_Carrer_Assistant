import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    return api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  get: () => api.get('/resume'),
};

export const jobsAPI = {
  search: (role) => api.post('/jobs/search', { role }),
};

export const resumeImproveAPI = {
  improve: (role) => api.post('/resume/improve', { role }),
};

export const interviewAPI = {
  generateMaterial: (role) => api.post('/interview/material', { role }),
  generateQuiz: (role) => api.post('/interview/quiz', { role }),
  submitQuiz: (quizId, userAnswers) =>
    api.post('/interview/quiz/submit', { quizId, userAnswers }),
};

export const chatAPI = {
  ask: (question) => api.post('/chat/ask', { question }),
  getHistory: () => api.get('/chat/history'),
};

export default api;