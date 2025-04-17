import axios from 'axios';

// Base API URL - this should match your backend port
const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloodbank_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const auth = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
};

// Blood request endpoints
export const bloodRequests = {
  getAll: async () => {
    const response = await apiClient.get('/requests');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/requests/${id}`);
    return response.data;
  },
  create: async (requestData: any) => {
    const response = await apiClient.post('/requests', requestData);
    return response.data;
  },
  updateStatus: async (id: string, statusData: any) => {
    const response = await apiClient.put(`/requests/${id}/status`, statusData);
    return response.data;
  },
  getByRecipient: async (recipientId: string) => {
    const response = await apiClient.get(`/requests/recipient/${recipientId}`);
    return response.data;
  },
};

// Inventory endpoints
export const inventory = {
  getAll: async () => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },
  getByBloodGroup: async (bloodGroup: string) => {
    const response = await apiClient.get(`/inventory/bloodgroup/${bloodGroup}`);
    return response.data;
  },
};

// Donor endpoints
export const donors = {
  getAll: async () => {
    const response = await apiClient.get('/donors');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/donors/${id}`);
    return response.data;
  },
  create: async (donorData: any) => {
    const response = await apiClient.post('/donors', donorData);
    return response.data;
  },
  update: async (id: string, donorData: any) => {
    const response = await apiClient.put(`/donors/${id}`, donorData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/donors/${id}`);
    return response.data;
  },
};

// Recipient endpoints
export const recipients = {
  getAll: async () => {
    const response = await apiClient.get('/recipients');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/recipients/${id}`);
    return response.data;
  },
};

// Donation endpoints
export const donations = {
  getAll: async () => {
    const response = await apiClient.get('/donations');
    return response.data;
  },
  create: async (donationData: any) => {
    const response = await apiClient.post('/donations', donationData);
    return response.data;
  },
  getByDonor: async (donorId: string) => {
    const response = await apiClient.get(`/donations/donor/${donorId}`);
    return response.data;
  },
};

// Report endpoints
export const reports = {
  getStats: async () => {
    const response = await apiClient.get('/reports/stats');
    return response.data;
  },
  getInventorySummary: async () => {
    const response = await apiClient.get('/reports/inventory');
    return response.data;
  },
};

export default {
  auth,
  bloodRequests,
  inventory,
  donors,
  recipients,
  donations,
  reports,
}; 