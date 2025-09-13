import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  role?: string; // 添加角色字段
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}

export interface RefreshResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}

class AuthService {
  private readonly api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      response => response,
      async error => {
        // 如果是登录或注册请求失败，直接抛出错误，不进行重定向
        const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                             error.config?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthRequest) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', refreshResponse.data.accessToken);
              localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);

              error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
              return this.api.request(error.config);
            } catch (refreshError) {
              this.clearTokens();
              // 使用编程式导航而不是window.location
              if (window.location.pathname !== '/login') {
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }
          } else {
            this.clearTokens();
            // 使用编程式导航而不是window.location
            if (window.location.pathname !== '/login') {
              window.history.pushState({}, '', '/login');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await this.api.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getUserInfo(): Promise<User> {
    const response = await this.api.get<{ data: User }>('/auth/me');
    return response.data.data;
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
