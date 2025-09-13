import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface DocumentDetail {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
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
  creator_email: string;
  tags: Array<{ id: number; name: string; color: string }>;
}

export interface DocumentListItem {
  id: number;
  title: string;
  description?: string;
  file_name: string;
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
  creator_name: string;
  tag_count: number;
}

export interface DocumentQuery {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'file_size' | 'view_count' | 'download_count';
  sortOrder?: 'ASC' | 'DESC';
  userId?: number | undefined;
  isPublic?: boolean | undefined;
  mimeType?: string | undefined;
  createdBy?: number | undefined;
  keyword?: string | undefined;
  tagIds?: number[] | undefined;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  is_public?: number;
}

export class DocumentDao {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 获取文档列表 - 支持高级查询、分页和排序
   */
  static async getDocuments(query: DocumentQuery): Promise<{
    documents: DocumentListItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const db = this.getDb();
      const {
        page = 1,
        pageSize = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        userId,
        isPublic,
        mimeType,
        createdBy,
        keyword,
        tagIds = []
      } = query;

      // 构建基础查询
      let whereConditions: string[] = ['d.status = 1']; // 只查询未删除的文档
      let params: any[] = [];
      let joins: string[] = [];

      // 用户权限过滤
      if (userId !== undefined) {
        whereConditions.push('(d.upload_user_id = ? OR d.is_public = 1)');
        params.push(userId);
      }

      // 公开状态过滤
      if (isPublic !== undefined) {
        whereConditions.push('d.is_public = ?');
        params.push(isPublic ? 1 : 0);
      }

      // 文件类型过滤
      if (mimeType) {
        whereConditions.push('d.mime_type = ?');
        params.push(mimeType);
      }

      // 创建者过滤
      if (createdBy) {
        whereConditions.push('d.upload_user_id = ?');
        params.push(createdBy);
      }

      // 关键词搜索
      if (keyword) {
        whereConditions.push('(d.title LIKE ? OR d.description LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 标签过滤
      if (tagIds.length > 0) {
        joins.push('INNER JOIN document_tags dt ON d.id = dt.document_id');
        whereConditions.push(`dt.tag_id IN (${tagIds.map(() => '?').join(',')})`);
        params.push(...tagIds);
      }

      // 构建JOIN语句
      const joinClause = joins.join(' ');
      
      // 构建WHERE语句
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // 构建主查询
      const baseQuery = `
        FROM documents d
        INNER JOIN users u ON d.upload_user_id = u.id
        LEFT JOIN (
          SELECT document_id, COUNT(*) as tag_count
          FROM document_tags
          GROUP BY document_id
        ) tc ON d.id = tc.document_id
        ${joinClause}
        ${whereClause}
      `;

      // 获取总数
      const countQuery = `SELECT COUNT(DISTINCT d.id) as total ${baseQuery}`;
      const countResult = db.prepare(countQuery).get(...params) as { total: number };
      const total = countResult.total;

      // 获取分页数据
      const offset = (page - 1) * pageSize;
      const dataQuery = `
        SELECT DISTINCT
          d.id,
          d.title,
          d.description,
          d.file_name,
          d.file_size,
          d.mime_type,
          d.file_extension,
          d.friendly_type,
          d.formatted_size,
          d.is_public,
          d.view_count,
          d.download_count,
          d.upload_user_id,
          d.created_at,
          u.full_name as creator_name,
          COALESCE(tc.tag_count, 0) as tag_count
        ${baseQuery}
        ORDER BY d.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      const documents = db.prepare(dataQuery).all(...params) as DocumentListItem[];

      return {
        documents,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error('获取文档列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取文档详情 - 包含创建者和标签信息
   */
  static async getDocumentById(id: number): Promise<DocumentDetail | null> {
    try {
      const db = this.getDb();
      
      // 获取文档基本信息和创建者信息
      const documentQuery = `
        SELECT 
          d.*,
          u.full_name as creator_name,
          u.email as creator_email
        FROM documents d
        INNER JOIN users u ON d.upload_user_id = u.id
        WHERE d.id = ? AND d.status = 1
      `;
      
      const document = db.prepare(documentQuery).get(id) as Omit<DocumentDetail, 'tags'> | undefined;
      
      if (!document) {
        return null;
      }

      // 获取文档标签
      const tagsQuery = `
        SELECT t.id, t.name, t.color
        FROM tags t
        INNER JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = ?
        ORDER BY t.name
      `;
      
      const tags = db.prepare(tagsQuery).all(id) as Array<{ id: number; name: string; color: string }>;

      return {
        ...document,
        tags
      };
    } catch (error) {
      console.error('获取文档详情失败:', error);
      return null;
    }
  }

  /**
   * 更新文档浏览次数
   */
  static async incrementViewCount(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE documents 
        SET view_count = view_count + 1, updated_at = datetime('now')
        WHERE id = ? AND status = 1
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新浏览次数失败:', error);
      return false;
    }
  }

  /**
   * 更新文档下载次数
   */
  static async incrementDownloadCount(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE documents 
        SET download_count = download_count + 1, updated_at = datetime('now')
        WHERE id = ? AND status = 1
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新下载次数失败:', error);
      return false;
    }
  }

  /**
   * 更新文档信息
   */
  static async updateDocument(id: number, updateData: UpdateDocumentData): Promise<boolean> {
    try {
      const db = this.getDb();
      
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title);
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.is_public !== undefined) {
        fields.push('is_public = ?');
        values.push(updateData.is_public);
      }

      if (fields.length === 0) {
        return true; // 没有更新内容
      }

      fields.push('updated_at = datetime(\'now\')');
      values.push(id);

      const stmt = db.prepare(`
        UPDATE documents 
        SET ${fields.join(', ')} 
        WHERE id = ? AND status = 1
      `);

      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error('更新文档失败:', error);
      return false;
    }
  }

  /**
   * 软删除文档
   */
  static async deleteDocument(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      
      const transaction = db.transaction((docId: number) => {
        // 软删除文档
        const deleteDocStmt = db.prepare(`
          UPDATE documents 
          SET status = 0, updated_at = datetime('now')
          WHERE id = ? AND status = 1
        `);
        const result = deleteDocStmt.run(docId);
        
        if (result.changes > 0) {
          // 删除文档标签关联
          const deleteTagsStmt = db.prepare('DELETE FROM document_tags WHERE document_id = ?');
          deleteTagsStmt.run(docId);
        }
        
        return result.changes > 0;
      });

      return transaction(id);
    } catch (error) {
      console.error('删除文档失败:', error);
      return false;
    }
  }

  /**
   * 检查文档访问权限
   */
  static async checkDocumentAccess(id: number, userId?: number): Promise<{
    hasAccess: boolean;
    document?: DocumentDetail;
    isOwner?: boolean;
  }> {
    try {
      const document = await this.getDocumentById(id);
      if (!document) {
        return { hasAccess: false };
      }

      // 公开文档所有人都能访问
      if (document.is_public === 1) {
        return { 
          hasAccess: true, 
          document,
          isOwner: userId ? document.upload_user_id === userId : false
        };
      }

      // 私有文档只有创建者可以访问
      if (userId && document.upload_user_id === userId) {
        return { 
          hasAccess: true, 
          document,
          isOwner: true
        };
      }

      return { hasAccess: false, document };
    } catch (error) {
      console.error('检查文档访问权限失败:', error);
      return { hasAccess: false };
    }
  }

  /**
   * 检查用户是否为文档所有者
   */
  static async checkDocumentOwner(id: number, userId: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM documents 
        WHERE id = ? AND upload_user_id = ? AND status = 1
      `);
      
      const result = stmt.get(id, userId) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('检查文档所有者失败:', error);
      return false;
    }
  }

  /**
   * 获取文档统计信息
   */
  static async getDocumentStats(userId?: number): Promise<{
    total: number;
    public: number;
    private: number;
    totalSize: number;
    totalViews: number;
    totalDownloads: number;
    myDocuments?: number;
  }> {
    try {
      const db = this.getDb();
      
      // 基础统计
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public,
          SUM(CASE WHEN is_public = 0 THEN 1 ELSE 0 END) as private,
          COALESCE(SUM(file_size), 0) as totalSize,
          COALESCE(SUM(view_count), 0) as totalViews,
          COALESCE(SUM(download_count), 0) as totalDownloads
        FROM documents 
        WHERE status = 1
      `;
      
      const stats = db.prepare(statsQuery).get() as {
        total: number;
        public: number;
        private: number;
        totalSize: number;
        totalViews: number;
        totalDownloads: number;
      };

      const result: any = {
        total: stats.total,
        public: stats.public,
        private: stats.private,
        totalSize: stats.totalSize,
        totalViews: stats.totalViews,
        totalDownloads: stats.totalDownloads,
      };

      // 如果提供了用户ID，获取用户的文档数量
      if (userId !== undefined) {
        const myDocsStmt = db.prepare(`
          SELECT COUNT(*) as count 
          FROM documents 
          WHERE upload_user_id = ? AND status = 1
        `);
        const myDocs = myDocsStmt.get(userId) as { count: number };
        result.myDocuments = myDocs.count;
      }

      return result;
    } catch (error) {
      console.error('获取文档统计失败:', error);
      return {
        total: 0,
        public: 0,
        private: 0,
        totalSize: 0,
        totalViews: 0,
        totalDownloads: 0,
      };
    }
  }
}