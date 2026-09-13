import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evntpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

// API Endpoints Services
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const eventsApi = {
  list: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  publish: (id) => api.post(`/events/${id}/publish`),
  submitApproval: (id) => api.post(`/events/${id}/submit-approval`),
  approve: (id) => api.post(`/events/${id}/approve`),
  reject: (id) => api.post(`/events/${id}/reject`),
  cancel: (id) => api.post(`/events/${id}/cancel`),
  complete: (id) => api.post(`/events/${id}/complete`),
};

export const registrationsApi = {
  register: (eventId) => api.post(`/events/${eventId}/register`),
  cancel: (eventId) => api.delete(`/events/${eventId}/register`),
  getMyRegistrations: () => api.get('/users/me/registrations'),
  getEventRegistrations: (eventId) => api.get(`/events/${eventId}/registrations`),
};

export const ticketsApi = {
  getById: (id) => api.get(`/tickets/${id}`),
};

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  getStats: (eventId) => api.get(`/events/${eventId}/attendance/stats`),
  getList: (eventId) => api.get(`/events/${eventId}/attendance`),
};

export const pollsApi = {
  getEventPolls: (eventId) => api.get(`/events/${eventId}/polls`),
  create: (eventId, data) => api.post(`/events/${eventId}/polls`, data),
  vote: (pollId, optionId) => api.post(`/polls/${pollId}/vote`, { option_id: optionId }),
  updateStatus: (pollId, status) => api.put(`/polls/${pollId}/status?status=${status}`),
};

export const feedbackApi = {
  submit: (eventId, data) => api.post(`/events/${eventId}/feedback`, data),
  getStats: (eventId) => api.get(`/events/${eventId}/feedback/stats`),
};

export const analyticsApi = {
  getEventAnalytics: (eventId) => api.get(`/events/${eventId}/analytics`),
  getPlatformStats: () => api.get('/analytics/platform'),
};

export const clubsApi = {
  list: () => api.get('/clubs'),
  getById: (id) => api.get(`/clubs/${id}`),
  getEvents: (id) => api.get(`/clubs/${id}/events`),
  create: (data) => api.post('/clubs', data),
  delete: (id) => api.delete(`/clubs/${id}`),
  getManagedClubs: () => api.get('/clubs/my/managed'),
  getOrganizers: (clubId) => api.get(`/clubs/${clubId}/organizers`),
  assignOrganizer: (clubId, data) => api.post(`/clubs/${clubId}/organizers`, data),
  removeOrganizer: (clubId, userId) => api.delete(`/clubs/${clubId}/organizers/${userId}`),
};

export const usersApi = {
  list: () => api.get('/users'),
  updateMe: (data) => api.put('/users/me', data),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export default api;
