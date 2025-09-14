import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface Document {
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
  is_public: number; // 0: 私有, 1: 公开
  view_count: number;
  download_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
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
  is_public?: number;
  created_by: number;
  tag_ids?: number[];
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  is_public?: number;
}

export interface DocumentFilter {
  userId?: number;
  isPublic?: boolean;
  mimeType?: string;
  createdBy?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'title' | 'file_size' | 'view_count';
  orderDirection?: 'ASC' | 'DESC';
}

export interface DocumentWithTags extends Document {
  tags: Array<{ id: number; name: string; color: string }>;
}

export class DocumentModel {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 创建文档记录
   */
  static async create(documentData: CreateDocumentData): Promise<Document> {
    try {
      const db = this.getDb();
      
      // 开始事务
      const transaction = db.transaction((data: CreateDocumentData) => {
        // 插入文档记录
        const insertStmt = db.prepare(`
          INSERT INTO documents (
            title, description, file_name, file_path, file_size, mime_type, 
            file_hash, file_extension, friendly_type, formatted_size,
            is_public, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        const result = insertStmt.run(
          data.title,
          data.description || null,
          data.file_name,
          data.file_path,
          data.file_size,
          data.mime_type,
          data.file_hash,
          data.file_extension,
          data.friendly_type,
          data.formatted_size,
          data.is_public || 0,
          data.created_by
        );

        const documentId = result.lastInsertRowid as number;

        // 如果有标签，插入关联记录
        if (data.tag_ids && data.tag_ids.length > 0) {
          const insertTagStmt = db.prepare(`
            INSERT INTO document_tags (document_id, tag_id) VALUES (?, ?)
          `);

          for (const tagId of data.tag_ids) {
            insertTagStmt.run(documentId, tagId);
          }
        }

        return documentId;
      });

      const documentId = transaction(documentData);
      
      // 获取创建的文档
      const document = await this.findById(documentId);
      if (!document) {
        throw new Error('创建文档后无法获取文档信息');
      }

      return document;
    } catch (error) {
      console.error('创建文档失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID查找文档
   */
  static async findById(id: number): Promise<Document | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
      const document = stmt.get(id) as Document | undefined;
      return document || null;
    } catch (error) {
      console.error('查找文档失败:', error);
      return null;
    }
  }

  /**
   * 根据文件哈希查找文档（检查重复）
   */
  static async findByFileHash(fileHash: string): Promise<Document | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM documents WHERE file_hash = ? LIMIT 1');
      const document = stmt.get(fileHash) as Document | undefined;
      return document || null;
    } catch (error) {
      console.error('根据文件哈希查找文档失败:', error);
      return null;
    }
  }

  /**
   * 检查用户是否有权限访问文档
   */
  static async checkAccess(documentId: number, userId?: number): Promise<{ hasAccess: boolean; document?: Document }> {
    try {
      const document = await this.findById(documentId);
      if (!document) {
        return { hasAccess: false };
      }

      // 公开文档所有人都能访问
      if (document.is_public === 1) {
        return { hasAccess: true, document };
      }

      // 私有文档只有创建者可以访问
      if (userId && document.created_by === userId) {
        return { hasAccess: true, document };
      }

      return { hasAccess: false, document };
    } catch (error) {
      console.error('检查文档访问权限失败:', error);
      return { hasAccess: false };
    }
  }

  /**
   * 更新文档信息
   */
  static async update(id: number, updateData: UpdateDocumentData): Promise<boolean> {
    try {
      const db = this.getDb();
      
      const fields = [];
      const values = [];

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
        UPDATE documents SET ${fields.join(', ')} WHERE id = ?
      `);

      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error('更新文档失败:', error);
      return false;
    }
  }

  /**
   * 删除文档
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      
      const transaction = db.transaction((docId: number) => {
        // 删除文档标签关联
        const deleteTagsStmt = db.prepare('DELETE FROM document_tags WHERE document_id = ?');
        deleteTagsStmt.run(docId);

        // 删除文档记录
        const deleteDocStmt = db.prepare('DELETE FROM documents WHERE id = ?');
        const result = deleteDocStmt.run(docId);
        
        return result.changes > 0;
      });

      return transaction(id);
    } catch (error) {
      console.error('删除文档失败:', error);
      return false;
    }
  }

  /**
   * 获取文档列表
   */
  static async findMany(filter: DocumentFilter = {}): Promise<Document[]> {
    try {
      const db = this.getDb();
      
      let sql = 'SELECT * FROM documents WHERE 1=1';
      const params: any[] = [];

      // 添加过滤条件
      if (filter.userId !== undefined) {
        sql += ' AND (created_by = ? OR is_public = 1)';
        params.push(filter.userId);
      }

      if (filter.isPublic !== undefined) {
        sql += ' AND is_public = ?';
        params.push(filter.isPublic ? 1 : 0);
      }

      if (filter.mimeType !== undefined) {
        sql += ' AND mime_type = ?';
        params.push(filter.mimeType);
      }

      if (filter.createdBy !== undefined) {
        sql += ' AND created_by = ?';
        params.push(filter.createdBy);
      }

      // 排序
      const orderBy = filter.orderBy || 'created_at';
      const orderDirection = filter.orderDirection || 'DESC';
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;

      // 分页
      if (filter.limit !== undefined) {
        sql += ' LIMIT ?';
        params.push(filter.limit);
        
        if (filter.offset !== undefined) {
          sql += ' OFFSET ?';
          params.push(filter.offset);
        }
      }

      const stmt = db.prepare(sql);
      const documents = stmt.all(...params) as Document[];
      
      return documents;
    } catch (error) {
      console.error('获取文档列表失败:', error);
      return [];
    }
  }

  /**
   * 获取文档及其标签
   */
  static async findByIdWithTags(id: number): Promise<DocumentWithTags | null> {
    try {
      const document = await this.findById(id);
      if (!document) {
        return null;
      }

      const db = this.getDb();
      const stmt = db.prepare(`
        SELECT t.id, t.name, t.color
        FROM tags t
        INNER JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = ?
      `);
      
      const tags = stmt.all(id) as Array<{ id: number; name: string; color: string }>;

      return {
        ...document,
        tags
      };
    } catch (error) {
      console.error('获取文档及标签失败:', error);
      return null;
    }
  }

  /**
   * 更新浏览次数
   */
  static async incrementViewCount(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('UPDATE documents SET view_count = view_count + 1 WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新浏览次数失败:', error);
      return false;
    }
  }

  /**
   * 更新下载次数
   */
  static async incrementDownloadCount(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('UPDATE documents SET download_count = download_count + 1 WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新下载次数失败:', error);
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  static async getStats(userId?: number): Promise<{
    total: number;
    public: number;
    private: number;
    totalSize: number;
    myDocuments?: number;
  }> {
    try {
      const db = this.getDb();
      
      // 总数统计
      const totalStmt = db.prepare('SELECT COUNT(*) as count FROM documents');
      const total = (totalStmt.get() as { count: number }).count;

      // 公开文档统计
      const publicStmt = db.prepare('SELECT COUNT(*) as count FROM documents WHERE is_public = 1');
      const publicCount = (publicStmt.get() as { count: number }).count;

      // 私有文档统计
      const privateCount = total - publicCount;

      // 总大小统计
      const sizeStmt = db.prepare('SELECT SUM(file_size) as total_size FROM documents');
      const totalSize = (sizeStmt.get() as { total_size: number | null }).total_size || 0;

      const stats: any = {
        total,
        public: publicCount,
        private: privateCount,
        totalSize,
      };

      // 如果提供了用户ID，获取用户的文档数量
      if (userId !== undefined) {
        const myDocsStmt = db.prepare('SELECT COUNT(*) as count FROM documents WHERE created_by = ?');
        stats.myDocuments = (myDocsStmt.get(userId) as { count: number }).count;
      }

      return stats;
    } catch (error) {
      console.error('获取文档统计失败:', error);
      return {
        total: 0,
        public: 0,
        private: 0,
        totalSize: 0,
      };
    }
  }
}