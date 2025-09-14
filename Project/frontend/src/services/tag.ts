import { createAuthenticatedAxios, createPureAxios } from './api/config';

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  document_count?: number;
}

export interface CreateTagData {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
  description?: string;
}

export interface TagListResponseData {
  tags: Tag[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TagListResponse {
  code: number;
  message: string;
  data: TagListResponseData;
  timestamp: string;
}

export interface PopularTagListResponseData {
  tags: Tag[];
  count: number;
}

export interface PopularTagListResponse {
  code: number;
  message: string;
  data: PopularTagListResponseData;
  timestamp: string;
}

export interface TagResponse {
  code: number;
  message: string;
  data: Tag;
  timestamp: string;
}

export interface TagSearchQuery {
  keyword?: string;
  limit?: number;
  offset?: number;
}

class TagService {
  private readonly api = createAuthenticatedAxios();
  private readonly publicApi = createPureAxios();

  // 获取标签列表（公开接口，不需要认证）
  async getTags(): Promise<TagListResponse> {
    const response = await this.publicApi.get<TagListResponse>('/tags');
    return response.data;
  }

  // 获取热门标签
  async getPopularTags(): Promise<PopularTagListResponse> {
    const response = await this.publicApi.get<PopularTagListResponse>('/tags/popular');
    return response.data;
  }

  // 搜索标签
  async searchTags(query: TagSearchQuery): Promise<TagListResponse> {
    const params = new URLSearchParams();
    if (query.keyword) params.append('keyword', query.keyword);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    
    const response = await this.publicApi.get<TagListResponse>(`/tags/search?${params}`);
    return response.data;
  }

  // 创建标签（需要认证和权限）
  async createTag(data: CreateTagData): Promise<TagResponse> {
    const response = await this.api.post<TagResponse>('/tags', data);
    return response.data;
  }

  // 获取单个标签详情
  async getTag(id: number): Promise<TagResponse> {
    const response = await this.publicApi.get<TagResponse>(`/tags/${id}`);
    return response.data;
  }

  // 更新标签（需要认证）
  async updateTag(id: number, data: UpdateTagData): Promise<TagResponse> {
    const response = await this.api.put<TagResponse>(`/tags/${id}`, data);
    return response.data;
  }

  // 删除标签（需要认证）
  async deleteTag(id: number): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  // 获取我创建的标签（需要认证）
  async getMyTags(): Promise<TagListResponse> {
    const response = await this.api.get<TagListResponse>('/tags/my/created');
    return response.data;
  }

  // 同步标签使用计数（管理员功能）
  async syncUsageCounts(): Promise<void> {
    await this.api.post('/tags/sync-usage-counts');
  }
}

export const tagService = new TagService();