import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message, notification } from 'antd';
import { createAuthenticatedAxios, createPureAxios } from '../services/api/config';
import { ErrorHandler } from './errorHandler';

// 请求重试配置
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

// 默认重试配置
const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // 只对网络错误和5xx服务器错误重试
    return !error.response || (error.response.status >= 500);
  }
};

// 请求重试函数
const retryRequest = async (
  originalRequest: AxiosRequestConfig, 
  retryConfig: RetryConfig
): Promise<AxiosResponse> => {
  const { retries, retryDelay, retryCondition } = retryConfig;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios(originalRequest);
    } catch (error: any) {
      // 如果是最后一次尝试或者不满足重试条件，抛出错误
      if (attempt === retries || !retryCondition(error)) {
        throw error;
      }
      
      // 等待一段时间后重试，使用指数退避
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// 创建带认证的axios实例用于全局请求
const authenticatedAxios = createAuthenticatedAxios();

// 请求拦截器
authenticatedAxios.interceptors.request.use(
  (config) => {
    // 添加请求ID用于追踪
    config.headers = config.headers || {};
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
authenticatedAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 处理认证错误
    if (error.response?.status === 401) {
      // 清除过期的认证信息
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // 处理权限错误
    if (error.response?.status === 403) {
      notification.error({
        message: '权限不足',
        description: '您没有权限执行此操作，请联系管理员。',
        placement: 'topRight'
      });
      return Promise.reject(error);
    }

    // 处理服务器错误 - 自动重试
    if (!originalRequest._retry && (error.response?.status && error.response?.status >= 500 || !error.response)) {
      originalRequest._retry = true;
      
      try {
        return await retryRequest(originalRequest, defaultRetryConfig);
      } catch (retryError) {
        // 重试失败，显示友好错误信息
        const isNetworkError = !error.response;
        const errorMessage = isNetworkError 
          ? '网络连接异常，请检查网络设置'
          : '服务器暂时不可用，请稍后重试';
        
        message.error(errorMessage);
        
        // 记录错误到日志服务
        logErrorToService(error, 'axios-retry-failed');
        
        return Promise.reject(retryError);
      }
    }

    // 处理客户端错误
    if (error.response?.status && error.response?.status >= 400 && error.response?.status < 500) {
      const errorData: any = error.response.data || {};
      const errorMessage = errorData?.message || '请求处理失败';
      
      // 显示具体错误信息
      message.error(errorMessage);
      
      // 记录客户端错误
      console.error('客户端请求错误:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: errorData
      });
    }

    // 记录所有错误
    logErrorToService(error, 'axios-interceptor');
    
    return Promise.reject(error);
  }
);

/**
 * 记录错误到服务端
 */
async function logErrorToService(error: AxiosError, source: string) {
  try {
    const errorLog = {
      source,
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      requestId: (error.config as any)?.headers?.['X-Request-ID']
    };

    // 使用纯净的axios实例发送日志，避免拦截器循环
    const logAxios = createPureAxios();
    await logAxios.post('/api/v1/logs/error', errorLog).catch(() => {
      // 如果日志服务不可用，存储到本地
      const localErrors = JSON.parse(localStorage.getItem('networkErrors') || '[]');
      localErrors.push(errorLog);
      if (localErrors.length > 100) {
        localErrors.splice(0, localErrors.length - 100);
      }
      localStorage.setItem('networkErrors', JSON.stringify(localErrors));
    });
  } catch (logError) {
    console.error('无法记录网络错误日志:', logError);
  }
}

/**
 * 全局未捕获的Promise rejection处理
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise rejection:', event.reason);
  
  // 记录到错误服务
  const errorLog = {
    type: 'unhandled-promise-rejection',
    message: event.reason?.message || 'Unknown promise rejection',
    stack: event.reason?.stack,
    timestamp: (new Date()).toISOString(),
    url: window.location.href
  };

  fetch('/api/v1/logs/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorLog)
  }).catch(() => {
    // 存储到本地
    const localErrors = JSON.parse(localStorage.getItem('unhandledErrors') || '[]');
    localErrors.push(errorLog);
    if (localErrors.length > 50) {
      localErrors.splice(0, localErrors.length - 50);
    }
    localStorage.setItem('unhandledErrors', JSON.stringify(localErrors));
  });

  // 防止在控制台显示错误（可选）
  // event.preventDefault();
});

/**
 * 全局JavaScript错误处理
 */
window.addEventListener('error', (event) => {
  console.error('全局JavaScript错误:', event.error);
  
  const errorLog = {
    type: 'javascript-error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: (new Date()).toISOString(),
    url: window.location.href
  };

  fetch('/api/v1/logs/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorLog)
  }).catch(() => {
    // 存储到本地
    const localErrors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
    localErrors.push(errorLog);
    if (localErrors.length > 50) {
      localErrors.splice(0, localErrors.length - 50);
    }
    localStorage.setItem('jsErrors', JSON.stringify(localErrors));
  });
});

// 导出带认证的axios实例
export { authenticatedAxios as default };
export { createAuthenticatedAxios, createPureAxios };