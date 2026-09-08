import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach JWT token automatically to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('boo_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('boo_admin_token');
      localStorage.removeItem('boo_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),

  // Dashboard Overview KPIs
  getStats: () => api.get('/orders/stats/overview'),

  // Cars (Vehicles)
  getCars: (params) => api.get('/cars', { params }),
  getCar: (id) => api.get(`/cars/${id}`),
  createCar: (formData) => api.post('/cars', formData),
  updateCar: (id, formData) => api.put(`/cars/${id}`, formData),
  deleteCar: (id) => api.delete(`/cars/${id}`),

  // Spare Parts
  getSpareParts: (params) => api.get('/products', { params }),
  getSparePart: (id) => api.get(`/products/${id}`),
  createSparePart: (formData) => api.post('/products', formData),
  updateSparePart: (id, formData) => api.put(`/products/${id}`, formData),
  deleteSparePart: (id) => api.delete(`/products/${id}`),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (formData) => api.post('/categories', formData),
  updateCategory: (id, formData) => api.put(`/categories/${id}`, formData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Maintenance Services
  getServices: () => api.get('/services'),
  createService: (formData) => api.post('/services', formData),
  updateService: (id, formData) => api.put(`/services/${id}`, formData),
  deleteService: (id) => api.delete(`/services/${id}`),

  // Maintenance Bookings
  getBookings: (params) => api.get('/bookings', { params }),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),

  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),

  // Hero Carousel
  getSlides: () => api.get('/slides'),
  createSlide: (formData) => api.post('/slides', formData),
  updateSlide: (id, formData) => api.put(`/slides/${id}`, formData),
  deleteSlide: (id) => api.delete(`/slides/${id}`),

  // Website Content
  getContent: () => api.get('/content'),
  updateContent: (formData) => api.put('/content', formData),

  // Contact Messages
  getMessages: (params) => api.get('/messages', { params }),
  updateMessage: (id, data) => api.put(`/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),

  // Standalone Image Upload
  uploadImage: (formData) => api.post('/upload', formData),
  deleteImage: (publicId) => api.delete('/upload', { data: { publicId } })
};

export default api;
