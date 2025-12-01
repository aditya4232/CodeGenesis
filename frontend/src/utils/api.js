import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiClient = {
    // Health
    health: () => api.get('/health'),

    // Documents
    ingestDocument: (formData) => api.post('/api/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    listDocuments: (params) => api.get('/api/documents', { params }),
    getDocument: (docId) => api.get(`/api/documents/${docId}`),
    deleteDocument: (docId) => api.delete(`/api/documents/${docId}`),

    // Query
    query: (data) => api.post('/api/query', data),
    queryHistory: (params) => api.get('/api/query/history', { params }),

    // System
    systemStatus: () => api.get('/api/system/status'),
    systemMetrics: () => api.get('/api/system/metrics'),
    knowledgeTimeline: (params) => api.get('/api/knowledge/timeline', { params }),
    triggerConsolidation: () => api.post('/api/system/consolidate'),
};

export default api;
