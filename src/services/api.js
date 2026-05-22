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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
};

export const productsAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getProductById: (id) => API.get(`/products/${id}`),
  createReview: (id, reviewData) => API.post(`/products/${id}/review`, reviewData),
};

export const cartAPI = {
  getCart: () => API.get('/cart'),
  syncCart: (cartItems) => API.post('/cart', { cartItems }),
};

export const ordersAPI = {
  createOrder: (orderData) => API.post('/orders', orderData),
  verifyPayment: (paymentDetails) => API.post('/orders/verify', paymentDetails),
  getMyOrders: () => API.get('/orders/mine'),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, orderStatus) => API.put(`/admin/orders/${id}`, { orderStatus }),
  createProduct: (formData) => API.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, formData) => API.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
};

export default API;
