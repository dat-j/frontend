import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configure axios defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
  };
  token: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
  };
  token: string;
}

interface FacebookPage {
  id: string;
  name: string;
  picture?: string;
  access_token: string;
  category?: string;
  followers_count?: number;
  is_connected: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  facebookPages?: FacebookPage[];
}

export const authService = {
  // Login user
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('auth-token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  },

  // Register user
  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.token) {
        localStorage.setItem('auth-token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(message);
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('auth-token');
  },

  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể lấy thông tin người dùng';
      throw new Error(message);
    }
  },

  // Process Facebook OAuth callback
  async processFacebookCallback(code: string, state: string, redirectUri: string): Promise<User> {
    try {
      const response = await api.post('/facebook/oauth/callback', {
        code,
        state,
        redirectUri
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xử lý callback Facebook thất bại';
      throw new Error(message);
    }
  },

  // Connect Facebook page (legacy method - still needed for manual connections)
  async connectFacebookPage(pageId: string, accessToken: string): Promise<User> {
    try {
      const response = await api.post('/facebook/pages/connect', {
        pageId,
        accessToken
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Kết nối trang Facebook thất bại';
      throw new Error(message);
    }
  },

  // Disconnect Facebook page
  async disconnectFacebookPage(pageId: string): Promise<User> {
    try {
      const response = await api.delete(`/facebook/pages/${pageId}/disconnect`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ngắt kết nối trang Facebook thất bại';
      throw new Error(message);
    }
  },

  // Get connected Facebook pages
  async getConnectedPages(): Promise<FacebookPage[]> {
    try {
      const response = await api.get('/facebook/pages');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể lấy danh sách trang Facebook';
      throw new Error(message);
    }
  },

  // Verify user token
  async verifyToken(): Promise<boolean> {
    try {
      await api.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Setup Facebook webhook for a page
  async setupWebhook(pageId: string): Promise<void> {
    try {
      await api.post(`/facebook/pages/${pageId}/webhook`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Thiết lập webhook thất bại';
      throw new Error(message);
    }
  },

  // Get Facebook page info
  async getPageInfo(pageId: string): Promise<FacebookPage> {
    try {
      const response = await api.get(`/facebook/pages/${pageId}/info`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể lấy thông tin trang';
      throw new Error(message);
    }
  }
}; 