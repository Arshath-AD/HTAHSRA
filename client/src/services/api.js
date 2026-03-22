import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const SCREENSHOT_BASE = import.meta.env.VITE_SCREENSHOT_URL || '/screenshots';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const urlsApi = {
    getAll: (params = {}) => api.get('/urls', { params }),
    getById: (id) => api.get(`/urls/${id}`),
    create: (data) => api.post('/urls', data),
    update: (id, data) => api.put(`/urls/${id}`, data),
    delete: (id) => api.delete(`/urls/${id}`),
    refresh: (id) => api.post(`/urls/${id}/refresh`),
    uploadImage: (id, base64Data) => api.post(`/urls/${id}/image`, { base64Data })
};

export const categoriesApi = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    delete: (id) => api.delete(`/categories/${id}`)
};

export function getScreenshotUrl(filename) {
    if (!filename) return null;
    return `${SCREENSHOT_BASE}/${filename}`;
}

export default api;
