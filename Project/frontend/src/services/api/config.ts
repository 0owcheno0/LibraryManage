import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { ErrorHandler } from '../../utils/errorHandler';

/**
 * API配置常量
 */
export const API_CONFIG = {
  // 基础URL配置
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  // 请求超时时间
  TIMEOUT: 10000,
  // token存储key
  TOKEN_KEY: 'accessToken',
  // 刷新token存储key
  REFRESH_TOKEN_KEY: 'refreshToken',
  // 用户信息存储key
  USER_KEY: 'user',
} as const;

/**
 * 获取存储的token
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(API_CONFIG.TOKEN_KEY);
};

/**
 * 获取存储的刷新token
 */
export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);
};

/**
 * 设置token到本地存储
 */
export const setStoredToken = (token: string): void => {
  localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
};

/**
 * 设置刷新token到本地存储
 */
export const setStoredRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * 清除所有认证信息
 */
export const clearAuthStorage = (): void => {
  localStorage.removeItem(API_CONFIG.TOKEN_KEY);
  localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
  localStorage.removeItem(API_CONFIG.USER_KEY);
};

/**
 * 创建统一的axios默认配置
 */
export const createAxiosDefaults = (): CreateAxiosDefaults => ({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 添加认证头到配置
 */
export const addAuthHeader = (config: any = {}): any => {
  const token = getStoredToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

/**
 * 创建带认证和统一错误处理的axios实例
 */
export const createAuthenticatedAxios = (): AxiosInstance => {
  const instance = axios.create(createAxiosDefaults());
  
  // 请求拦截器 - 添加认证token
  instance.interceptors.request.use(
    (config) => {
      return addAuthHeader(config);
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // 响应拦截器 - 统一错误处理
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 统一错误处理
      const errorInfo = ErrorHandler.handleApiError(error);
      ErrorHandler.showError(errorInfo);
      return Promise.reject(error);
    }
  );
  
  return instance;
};

/**
 * 创建带统一错误处理的纯净axios实例
 */
export const createPureAxios = (): AxiosInstance => {
  const instance = axios.create(createAxiosDefaults());
  
  // 响应拦截器 - 统一错误处理
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 统一错误处理
      const errorInfo = ErrorHandler.handleApiError(error);
      ErrorHandler.showError(errorInfo);
      return Promise.reject(error);
    }
  );
  
  return instance;
};

export default {
  API_CONFIG,
  getStoredToken,
  getStoredRefreshToken,
  setStoredToken,
  setStoredRefreshToken,
  clearAuthStorage,
  createAxiosDefaults,
  addAuthHeader,
  createAuthenticatedAxios,
  createPureAxios,
};