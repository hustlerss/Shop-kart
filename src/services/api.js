import axios from 'axios';

export const getBackendURL = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) {
    // If the url ends with '/api', strip it to get the base backend URL
    return url.endsWith('/api') ? url.slice(0, -4) : url;
  }
  return 'http://localhost:5000';
};

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.length <= 2) return imagePath; // emoji or single-char
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const backendUrl = getBackendURL();
  return `${backendUrl}${imagePath}`;
};

const API = axios.create({
  baseURL: getBackendURL(),
});

// Request interceptor to automatically inject JWT token
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
      
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 unauth responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear user info and token on unauth responses
      localStorage.removeItem('userInfo');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/api/auth/login', credentials),
  register: (userData) => API.post('/api/auth/register', userData),
  getProfile: () => API.get('/api/auth/profile'),
  updateProfile: (profileData) => API.put('/api/auth/profile', profileData),
};

export const productsAPI = {
  getProducts: (params) => API.get('/api/products', { params }),
  getProductById: (id) => API.get(`/api/products/${id}`),
  createReview: (id, reviewData) => API.post(`/api/products/${id}/review`, reviewData),
};

export const cartAPI = {
  getCart: () => API.get('/api/cart'),
  syncCart: (cartItems) => API.post('/api/cart', { cartItems }),
};

export const ordersAPI = {
  createOrder: (orderData) => API.post('/api/orders', orderData),
  verifyPayment: (paymentDetails) => API.post('/api/orders/verify', paymentDetails),
  getMyOrders: () => API.get('/api/orders/mine'),
};

export const adminAPI = {
  getStats: () => API.get('/api/admin/stats'),
  getUsers: () => API.get('/api/admin/users'),
  deleteUser: (id) => API.delete(`/api/admin/users/${id}`),
  getOrders: () => API.get('/api/admin/orders'),
  updateOrderStatus: (id, orderStatus) => API.put(`/api/admin/orders/${id}`, { orderStatus }),
  createProduct: (formData) => API.post('/api/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, formData) => API.put(`/api/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => API.delete(`/api/admin/products/${id}`),
};

export default API;
