import Database from 'better-sqlite3';
import path from 'path';
import { DocumentTagDao } from '../dao/documentTagDao';
import type { DocumentWithTags } from '../dao/documentTagDao';

// 数据库连接
const dbPath = path.join(__dirname, '../../../database/knowledge_base.db');
const db = new Database(dbPath);

// 搜索参数接口
export interface SearchParams {
  q?: string;           // 搜索关键词
  tags?: number[] | undefined;      // 标签ID数组
  fileType?: string;    // 文件类型过滤
  mimeType?: string;    // MIME类型过滤
  isPublic?: boolean | undefined;   // 是否公开
  userId?: number | undefined;      // 用户ID (用于权限控制)
  page?: number;        // 页码
  pageSize?: number;    // 页面大小
  sortBy?: 'relevance' | 'created_at' | 'file_size' | 'view_count' | 'download_count';
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;   // 开始日期
  endDate?: string;     // 结束日期
}

// 搜索结果接口
export interface SearchResult {
  documents: DocumentWithTags[];
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

export class SearchService {
  
  /**
   * 全文搜索文档
   */
  static async searchDocuments(params: SearchParams): Promise<SearchResult> {
    const startTime = Date.now();
    const {
      q = '',
      tags = [],
      fileType,
      mimeType,
      isPublic,
      userId,
      page = 1,
      pageSize = 20,
      sortBy = 'relevance',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = params;

    try {
      // 构建查询条件
      const conditions: string[] = [];
      const queryParams: any[] = [];
      
      // 关键词搜索 - 在标题、描述、文件名中搜索
      if (q.trim()) {
        conditions.push(`(
          d.title LIKE ? OR 
          d.description LIKE ? OR 
          d.file_name LIKE ?
        )`);
        const keyword = `%${q.trim()}%`;
        queryParams.push(keyword, keyword, keyword);
      }

      // 标签筛选
      if (tags.length > 0) {
        const tagPlaceholders = tags.map(() => '?').join(',');
        conditions.push(`d.id IN (
          SELECT dt.document_id 
          FROM document_tags dt 
          WHERE dt.tag_id IN (${tagPlaceholders})
          GROUP BY dt.document_id
          HAVING COUNT(DISTINCT dt.tag_id) = ?
        )`);
        queryParams.push(...tags, tags.length);
      }

      // 文件类型筛选
      if (fileType) {
        if (fileType === 'image') {
          conditions.push(`d.mime_type LIKE 'image/%'`);
        } else if (fileType === 'document') {
          conditions.push(`(
            d.mime_type LIKE '%pdf%' OR 
            d.mime_type LIKE '%word%' OR 
            d.mime_type LIKE '%document%'
          )`);
        } else if (fileType === 'spreadsheet') {
          conditions.push(`(
            d.mime_type LIKE '%excel%' OR 
            d.mime_type LIKE '%sheet%'
          )`);
        } else if (fileType === 'presentation') {
          conditions.push(`(
            d.mime_type LIKE '%powerpoint%' OR 
            d.mime_type LIKE '%presentation%'
          )`);
        } else if (fileType === 'text') {
          conditions.push(`d.mime_type LIKE 'text/%'`);
        }
      }

      // MIME类型筛选
      if (mimeType) {
        conditions.push(`d.mime_type = ?`);
        queryParams.push(mimeType);
      }

      // 权限筛选
      if (isPublic !== undefined) {
        conditions.push(`d.is_public = ?`);
        queryParams.push(isPublic ? 1 : 0);
      } else if (userId) {
        // 如果没有指定公开性，则显示公开文档或用户自己的文档
        conditions.push(`(d.is_public = 1 OR d.upload_user_id = ?)`);
        queryParams.push(userId);
      } else {
        // 游客只能看公开文档
        conditions.push(`d.is_public = 1`);
      }

      // 日期范围筛选
      if (startDate) {
        conditions.push(`d.created_at >= ?`);
        queryParams.push(startDate);
      }
      if (endDate) {
        conditions.push(`d.created_at <= ?`);
        queryParams.push(endDate);
      }

      // 构建WHERE子句
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 构建排序子句
      let orderClause = '';
      switch (sortBy) {
        case 'relevance':
          // 相关性排序：优先考虑标题匹配，然后是创建时间
          if (q.trim()) {
            orderClause = `ORDER BY 
              CASE WHEN d.title LIKE ? THEN 1 ELSE 2 END ASC,
              d.created_at DESC`;
            queryParams.push(`%${q.trim()}%`);
          } else {
            orderClause = `ORDER BY d.created_at DESC`;
          }
          break;
        case 'created_at':
          orderClause = `ORDER BY d.created_at ${sortOrder}`;
          break;
        case 'file_size':
          orderClause = `ORDER BY d.file_size ${sortOrder}`;
          break;
        case 'view_count':
          orderClause = `ORDER BY d.view_count ${sortOrder}`;
          break;
        case 'download_count':
          orderClause = `ORDER BY d.download_count ${sortOrder}`;
          break;
        default:
          orderClause = `ORDER BY d.created_at DESC`;
      }

      // 查询总数
      const countQuery = `
        SELECT COUNT(DISTINCT d.id) as total
        FROM documents d
        LEFT JOIN users u ON d.created_by = u.id
        ${whereClause}
      `;
      
      const countStmt = db.prepare(countQuery);
      const countResult = countStmt.get(...queryParams) as { total: number };
      const total = countResult.total;

      // 查询文档列表
      const offset = (page - 1) * pageSize;
      const documentsQuery = `
        SELECT 
          d.*,
          u.username as creator_username,
          u.full_name as creator_name,
          (SELECT COUNT(*) FROM document_tags dt WHERE dt.document_id = d.id) as tag_count,
          CASE 
            WHEN d.mime_type LIKE 'image/%' THEN '图片'
            WHEN d.mime_type LIKE '%pdf%' THEN 'PDF'
            WHEN d.mime_type LIKE '%word%' OR d.mime_type LIKE '%document%' THEN 'Word'
            WHEN d.mime_type LIKE '%excel%' OR d.mime_type LIKE '%sheet%' THEN 'Excel'
            WHEN d.mime_type LIKE '%powerpoint%' OR d.mime_type LIKE '%presentation%' THEN 'PPT'
            WHEN d.mime_type LIKE 'text/%' THEN '文本'
            ELSE '其他'
          END as friendly_type,
          CASE 
            WHEN d.file_size < 1024 THEN d.file_size || ' B'
            WHEN d.file_size < 1048576 THEN ROUND(d.file_size / 1024.0, 2) || ' KB'
            WHEN d.file_size < 1073741824 THEN ROUND(d.file_size / 1048576.0, 2) || ' MB'
            ELSE ROUND(d.file_size / 1073741824.0, 2) || ' GB'
          END as formatted_size
        FROM documents d
        LEFT JOIN users u ON d.upload_user_id = u.id
        ${whereClause}
        ${orderClause}
        LIMIT ? OFFSET ?
      `;

      const documentsStmt = db.prepare(documentsQuery);
      const documents = documentsStmt.all(...queryParams, pageSize, offset) as any[];

      // 获取文档标签
      const documentIds = documents.map(d => d.id);
      const tagsMap = DocumentTagDao.getDocumentsBatchTags(documentIds);

      // 组装结果
      const documentsWithTags: DocumentWithTags[] = documents.map(doc => ({
        ...doc,
        tags: tagsMap.get(doc.id) || []
      }));

      const searchTime = Date.now() - startTime;
      const hasMore = (page * pageSize) < total;

      return {
        documents: documentsWithTags,
        total,
        page,
        pageSize,
        searchTime,
        hasMore
      };

    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * 获取搜索聚合信息（用于搜索facets）
   */
  static async getSearchFacets(params: Omit<SearchParams, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): Promise<SearchFacets> {
    const { q = '', tags = [], userId, isPublic } = params;

    try {
      // 构建基础查询条件（不包括facet字段）
      const baseConditions: string[] = [];
      const baseParams: any[] = [];

      if (q.trim()) {
        baseConditions.push(`(
          d.title LIKE ? OR 
          d.description LIKE ? OR 
          d.file_name LIKE ?
        )`);
        const keyword = `%${q.trim()}%`;
        baseParams.push(keyword, keyword, keyword);
      }

      // 权限筛选
      if (isPublic !== undefined) {
        baseConditions.push(`d.is_public = ?`);
        baseParams.push(isPublic ? 1 : 0);
      } else if (userId) {
        baseConditions.push(`(d.is_public = 1 OR d.upload_user_id = ?)`);
        baseParams.push(userId);
      } else {
        baseConditions.push(`d.is_public = 1`);
      }

      const baseWhere = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';

      // 获取文件类型统计
      const fileTypesQuery = `
        SELECT 
          CASE 
            WHEN d.mime_type LIKE 'image/%' THEN '图片'
            WHEN d.mime_type LIKE '%pdf%' THEN 'PDF'
            WHEN d.mime_type LIKE '%word%' OR d.mime_type LIKE '%document%' THEN 'Word'
            WHEN d.mime_type LIKE '%excel%' OR d.mime_type LIKE '%sheet%' THEN 'Excel'
            WHEN d.mime_type LIKE '%powerpoint%' OR d.mime_type LIKE '%presentation%' THEN 'PPT'
            WHEN d.mime_type LIKE 'text/%' THEN '文本'
            ELSE '其他'
          END as type,
          COUNT(*) as count
        FROM documents d
        ${baseWhere}
        GROUP BY type
        ORDER BY count DESC
      `;

      const fileTypesStmt = db.prepare(fileTypesQuery);
      const fileTypes = fileTypesStmt.all(...baseParams) as { type: string; count: number; }[];

      // 获取热门标签统计
      const tagsQuery = `
        SELECT 
          t.id, t.name, t.color, COUNT(dt.document_id) as count
        FROM tags t
        INNER JOIN document_tags dt ON t.id = dt.tag_id
        INNER JOIN documents d ON dt.document_id = d.id
        ${baseWhere}
        GROUP BY t.id, t.name, t.color
        ORDER BY count DESC
        LIMIT 20
      `;

      const tagsStmt = db.prepare(tagsQuery);
      const tagsResult = tagsStmt.all(...baseParams) as { id: number; name: string; color: string; count: number; }[];

      // 获取创建者统计
      const creatorsQuery = `
        SELECT 
          u.id, u.full_name as name, COUNT(d.id) as count
        FROM users u
        INNER JOIN documents d ON u.id = d.created_by
        ${baseWhere}
        GROUP BY u.id, u.full_name
        ORDER BY count DESC
        LIMIT 10
      `;

      const creatorsStmt = db.prepare(creatorsQuery);
      const creators = creatorsStmt.all(...baseParams) as { id: number; name: string; count: number; }[];

      return {
        fileTypes,
        tags: tagsResult,
        creators
      };

    } catch (error) {
      console.error('Get search facets error:', error);
      throw error;
    }
  }

  /**
   * 获取搜索建议
   */
  static async getSearchSuggestions(keyword: string = '', limit: number = 10): Promise<SearchSuggestion> {
    try {
      const suggestions: string[] = [];
      
      if (keyword.trim()) {
        // 基于文档标题获取建议
        const titleSuggestionsQuery = `
          SELECT DISTINCT title
          FROM documents 
          WHERE title LIKE ? AND is_public = 1
          ORDER BY view_count DESC, created_at DESC
          LIMIT ?
        `;
        
        const titleStmt = db.prepare(titleSuggestionsQuery);
        const titleResults = titleStmt.all(`%${keyword.trim()}%`, limit) as { title: string }[];
        suggestions.push(...titleResults.map(r => r.title));
      }

      // 获取热门标签
      const popularTagsQuery = `
        SELECT t.id, t.name, t.color
        FROM tags t
        INNER JOIN document_tags dt ON t.id = dt.tag_id
        INNER JOIN documents d ON dt.document_id = d.id
        WHERE d.is_public = 1
        GROUP BY t.id, t.name, t.color
        ORDER BY COUNT(dt.document_id) DESC
        LIMIT ?
      `;

      const popularTagsStmt = db.prepare(popularTagsQuery);
      const popularTags = popularTagsStmt.all(10) as { id: number; name: string; color: string; }[];

      return {
        suggestions: suggestions.slice(0, limit),
        popularTags
      };

    } catch (error) {
      console.error('Get search suggestions error:', error);
      return {
        suggestions: [],
        popularTags: []
      };
    }
  }

  /**
   * 获取热门搜索关键词（基于文档标题和标签）
   */
  static async getPopularSearchKeywords(limit: number = 20): Promise<string[]> {
    try {
      // 基于浏览量和下载量获取热门文档标题中的关键词
      const query = `
        SELECT title, view_count + download_count as popularity
        FROM documents 
        WHERE is_public = 1 AND title IS NOT NULL AND title != ''
        ORDER BY popularity DESC, created_at DESC
        LIMIT ?
      `;

      const stmt = db.prepare(query);
      const results = stmt.all(limit * 2) as { title: string; popularity: number }[];

      // 提取关键词（简单的基于空格分词）
      const keywords = new Set<string>();
      results.forEach(row => {
        const words = row.title
          .split(/[\s\-_.,，。、]+/)
          .filter(word => word.length >= 2)
          .slice(0, 3); // 每个标题最多取3个关键词
        
        words.forEach(word => keywords.add(word.toLowerCase()));
      });

      return Array.from(keywords).slice(0, limit);

    } catch (error) {
      console.error('Get popular keywords error:', error);
      return [];
    }
  }
}

export default SearchService;