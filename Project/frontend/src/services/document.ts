import axios from 'axios';
import {
  Document,
  DocumentListResponse,
  DocumentDetailResponse,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentListParams,
  ApiResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class DocumentService {
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
      error => {
        if (error.response?.status === 401) {
          // 重定向到登录页面
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // 获取文档列表
  async getDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await this.api.get<ApiResponse<DocumentListResponse>>(
      `/documents?${queryParams.toString()}`,
    );
    return response.data.data;
  }

  // 获取文档详情
  async getDocument(id: number): Promise<DocumentDetailResponse> {
    const response = await this.api.get<ApiResponse<DocumentDetailResponse>>(`/documents/${id}`);
    return response.data.data;
  }

  // 上传文档
  async uploadDocument(data: DocumentCreateRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);

    if (data.description) {
      formData.append('description', data.description);
    }

    formData.append('isPublic', data.isPublic.toString());

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    }

    const response = await this.api.post<ApiResponse<Document>>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // 更新文档
  async updateDocument(id: number, data: DocumentUpdateRequest): Promise<Document> {
    const response = await this.api.put<ApiResponse<Document>>(`/documents/${id}`, data);
    return response.data.data;
  }

  // 删除文档
  async deleteDocument(id: number): Promise<void> {
    await this.api.delete(`/documents/${id}`);
  }

  // 下载文档 - 使用新的下载服务
  async downloadDocument(id: number, options?: {
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }): Promise<void> {
    const { downloadService } = await import('./downloadService');
    return downloadService.downloadDocument(id, options);
  }

  // 获取文档预览URL
  getPreviewUrl(id: number): string {
    return `${API_BASE_URL}/documents/${id}/preview`;
  }

  // 获取文档下载URL
  getDownloadUrl(id: number): string {
    return `${API_BASE_URL}/documents/${id}/download`;
  }

  // 增加浏览次数
  async incrementViewCount(id: number): Promise<void> {
    await this.api.post(`/documents/${id}/view`);
  }

  // 搜索文档
  async searchDocuments(
    keyword: string,
    params: Omit<DocumentListParams, 'keyword'> = {},
  ): Promise<DocumentListResponse> {
    return this.getDocuments({ ...params, keyword });
  }
}

export const documentService = new DocumentService();
export default DocumentService;
