import { createAuthenticatedAxios, createPureAxios } from './api/config';
import { API_CONFIG } from './api/config';

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
  // 使用纯净的axios实例，因为认证相关请求不需要认证头
  private readonly api = createPureAxios();

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

  // 使用带认证的axios实例
  private readonly authenticatedApi = createAuthenticatedAxios();

  async logout(): Promise<void> {
    try {
      await this.authenticatedApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getUserInfo(): Promise<User> {
    const response = await this.authenticatedApi.get<{ data: User }>('/auth/me');
    return response.data.data;
  }

  private clearTokens(): void {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(API_CONFIG.TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(API_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();