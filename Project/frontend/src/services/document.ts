import { createAuthenticatedAxios } from './api/config';
import {
  Document,
  DocumentListResponse,
  DocumentDetailResponse,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentListParams,
  ApiResponse,
} from '../types';

class DocumentService {
  private readonly api = createAuthenticatedAxios();

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

    // 修复参数名：使用后端期望的 is_public 而不是 isPublic
    formData.append('is_public', data.isPublic ? '1' : '0');

    // 修复参数名：使用后端期望的 tag_ids 而不是 tags
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('tag_ids[]', tag.toString());
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/documents/${id}/preview`;
  }

  // 获取文档下载URL
  getDownloadUrl(id: number): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/documents/${id}/download`;
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