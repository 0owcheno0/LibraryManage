import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
}

class RequestService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      config => {
        // 添加认证token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 开发环境下打印请求信息
        if (import.meta.env.DEV) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;

        // 开发环境下打印响应信息
        if (import.meta.env.DEV) {
          console.log('📦 API Response:', data);
        }

        return response;
      },
      error => {
        // 处理响应错误
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              // 未授权，清除token并跳转到登录页
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              message.error('登录已过期，请重新登录');
              break;
            case 403:
              message.error('没有权限访问此资源');
              break;
            case 404:
              message.error('请求的资源不存在');
              break;
            case 500:
              message.error('服务器内部错误');
              break;
            default:
              message.error(data?.message || '请求失败');
          }
        } else if (error.request) {
          // 网络错误
          message.error('网络连接失败，请检查网络设置');
        } else {
          // 其他错误
          message.error(`请求出错：${error.message}`);
        }

        return Promise.reject(error);
      }
    );
  }

  // GET请求
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config).then(res => res.data);
  }

  // POST请求
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config).then(res => res.data);
  }

  // PUT请求
  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config).then(res => res.data);
  }

  // DELETE请求
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config).then(res => res.data);
  }

  // 文件上传
  public upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<T>> {
    return this.instance
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      })
      .then(res => res.data);
  }
}

// 创建请求实例
const request = new RequestService();

export default request;
