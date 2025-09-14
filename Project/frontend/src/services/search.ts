import { createAuthenticatedAxios } from './api/config';
import type { ApiResponse } from '../types';

// 搜索参数接口
export interface SearchParams {
  q?: string;           // 搜索关键词
  tags?: number[] | undefined;      // 标签ID数组
  fileType?: string;    // 文件类型过滤
  mimeType?: string;    // MIME类型过滤
  isPublic?: boolean | undefined;   // 是否公开
  page?: number;        // 页码
  pageSize?: number;    // 页面大小
  sortBy?: 'relevance' | 'created_at' | 'file_size' | 'view_count' | 'download_count';
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;   // 开始日期
  endDate?: string;     // 结束日期
}

// 搜索结果接口
export interface SearchResult {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
  searchTime: number;
  hasMore: boolean;
  facets?: SearchFacets;
}

// 搜索聚合信息
export interface SearchFacets {
  fileTypes: { type: string; count: number; }[];
  tags: { id: number; name: string; color: string; count: number; }[];
  creators: { id: number; name: string; count: number; }[];
}

// 搜索建议接口
export interface SearchSuggestion {
  suggestions: string[];
  popularTags: { id: number; name: string; color: string; }[];
  recentSearches?: string[];
}

// 热门关键词接口
export interface PopularKeywords {
  keywords: string[];
  count: number;
}

// 文档接口（扩展基础Document类型）
export interface Document {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  friendly_type: string;
  formatted_size: string;
  is_public: number;
  view_count: number;
  download_count: number;
  upload_user_id: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_username: string;
  tag_count: number;
  tags?: DocumentTag[];
}

export interface DocumentTag {
  id: number;
  name: string;
  color?: string;
  created_at: string;
}

class SearchService {
  private readonly api = createAuthenticatedAxios();
  private baseURL = '/api/v1/search';

  /**
   * 搜索文档
   */
  async searchDocuments(params: SearchParams): Promise<SearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      // 构建查询参数
      if (params.q) queryParams.append('q', params.q);
      if (params.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }
      if (params.fileType) queryParams.append('fileType', params.fileType);
      if (params.mimeType) queryParams.append('mimeType', params.mimeType);
      if (params.isPublic !== undefined) queryParams.append('isPublic', String(params.isPublic));
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await this.api.get<ApiResponse<SearchResult>>(`${this.baseURL}?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('搜索文档失败:', error);
      throw error;
    }
  }

  /**
   * 高级搜索（包含facets）
   */
  async advancedSearch(params: SearchParams): Promise<SearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      // 构建查询参数
      if (params.q) queryParams.append('q', params.q);
      if (params.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }
      if (params.fileType) queryParams.append('fileType', params.fileType);
      if (params.mimeType) queryParams.append('mimeType', params.mimeType);
      if (params.isPublic !== undefined) queryParams.append('isPublic', String(params.isPublic));
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await this.api.get<ApiResponse<SearchResult>>(`${this.baseURL}/advanced?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('高级搜索失败:', error);
      throw error;
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(keyword?: string, limit?: number): Promise<SearchSuggestion> {
    try {
      const queryParams = new URLSearchParams();
      
      if (keyword) queryParams.append('q', keyword);
      if (limit) queryParams.append('limit', limit.toString());

      const response = await this.api.get<ApiResponse<SearchSuggestion>>(`${this.baseURL}/suggestions?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      throw error;
    }
  }

  /**
   * 获取热门搜索关键词
   */
  async getPopularKeywords(limit?: number): Promise<PopularKeywords> {
    try {
      const queryParams = new URLSearchParams();
      
      if (limit) queryParams.append('limit', limit.toString());

      const response = await this.api.get<ApiResponse<PopularKeywords>>(`${this.baseURL}/popular?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('获取热门关键词失败:', error);
      throw error;
    }
  }

  /**
   * 获取搜索统计（管理员）
   */
  async getSearchStats(): Promise<any> {
    try {
      const response = await this.api.get<ApiResponse<any>>(`${this.baseURL}/stats`);
      return response.data.data;
    } catch (error) {
      console.error('获取搜索统计失败:', error);
      throw error;
    }
  }
}

// 搜索历史管理
class SearchHistoryManager {
  private key = 'search_history';
  private maxHistory = 10;

  /**
   * 添加搜索历史
   */
  addSearch(keyword: string): void {
    if (!keyword.trim()) return;

    try {
      const history = this.getHistory();
      const cleanKeyword = keyword.trim();
      
      // 移除重复项
      const filteredHistory = history.filter(item => item !== cleanKeyword);
      
      // 添加到开头
      const newHistory = [cleanKeyword, ...filteredHistory].slice(0, this.maxHistory);
      
      localStorage.setItem(this.key, JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  /**
   * 获取搜索历史
   */
  getHistory(): string[] {
    try {
      const history = localStorage.getItem(this.key);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  /**
   * 清空搜索历史
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('清空搜索历史失败:', error);
    }
  }

  /**
   * 删除特定搜索历史
   */
  removeHistory(keyword: string): void {
    try {
      const history = this.getHistory();
      const newHistory = history.filter(item => item !== keyword);
      localStorage.setItem(this.key, JSON.stringify(newHistory));
    } catch (error) {
      console.error('删除搜索历史失败:', error);
    }
  }
}

// 搜索关键词高亮工具
export class HighlightHelper {
  /**
   * 高亮文本中的关键词
   */
  static highlightText(text: string, keywords: string | string[], className: string = 'search-highlight'): string {
    if (!text || !keywords) return text;

    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    const escapedKeywords = keywordArray
      .filter(keyword => keyword.trim())
      .map(keyword => this.escapeRegExp(keyword.trim()));

    if (escapedKeywords.length === 0) return text;

    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
  }

  /**
   * 转义正则表达式特殊字符
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 移除HTML标签
   */
  static stripHtml(html: string): string {
    if (typeof window !== 'undefined' && window.DOMParser) {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      } catch (error) {
        // 如果DOMParser失败，使用正则表达式作为后备方案
        return html.replace(/<[^>]*>/g, '');
      }
    }
    
    // 在非浏览器环境中使用正则表达式
    return html.replace(/<[^>]*>/g, '');
  }
}

// 导出实例
export const searchService = new SearchService();
export const searchHistoryManager = new SearchHistoryManager();
export default searchService;