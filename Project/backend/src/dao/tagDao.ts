import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

// 接口定义
export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  created_by?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
  description?: string;
  created_by?: number;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
  description?: string;
}

export interface TagListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'usage_count' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface TagWithUsage extends Tag {
  document_count: number;
}

export class TagDao {
  private static getDb(): Database.Database {
    return getDatabase();
  }
  
  /**
   * 创建标签
   */
  static createTag(data: CreateTagData): Tag {
    const db = this.getDb();
    const stmt = db.prepare(`
      INSERT INTO tags (name, color, description, created_by)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.name,
      data.color || '#1890ff',
      data.description || null,
      data.created_by || null
    );
    
    return this.getTagById(result.lastInsertRowid as number)!;
  }

  /**
   * 获取标签列表（支持分页和排序）
   */
  static getTags(query: TagListQuery = {}): { 
    tags: TagWithUsage[], 
    total: number, 
    page: number, 
    pageSize: number 
  } {
    const db = this.getDb();
    const {
      page = 1,
      pageSize = 50,
      sortBy = 'name',
      sortOrder = 'ASC',
      search = ''
    } = query;
    
    const offset = (page - 1) * pageSize;
    
    // 构建查询条件
    let whereClause = '';
    let params: any[] = [];
    
    if (search) {
      whereClause = 'WHERE t.name LIKE ?';
      params.push(`%${search}%`);
    }
    
    // 排序字段映射
    const sortMapping: Record<string, string> = {
      'name': 't.name',
      'usage_count': 't.usage_count',
      'created_at': 't.created_at'
    };
    
    const orderBy = `ORDER BY ${sortMapping[sortBy]} ${sortOrder}`;
    
    // 查询标签列表（包含使用次数统计）
    const tagsStmt = db.prepare(`
      SELECT 
        t.*,
        COUNT(dt.document_id) as document_count
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.tag_id
      ${whereClause}
      GROUP BY t.id
      ${orderBy}
      LIMIT ? OFFSET ?
    `);
    
    const tags = tagsStmt.all(...params, pageSize, offset) as TagWithUsage[];
    
    // 查询总数
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM tags t ${whereClause}
    `);
    
    const countParams = search ? [search.replace(/%/g, '')] : [];
    const totalResult = countStmt.get(...countParams.map(p => `%${p}%`)) as { count: number };
    const total = totalResult.count;
    
    return {
      tags,
      total,
      page,
      pageSize
    };
  }

  /**
   * 根据ID获取标签
   */
  static getTagById(id: number): Tag | null {
    const db = this.getDb();
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    return stmt.get(id) as Tag | null;
  }

  /**
   * 根据名称获取标签
   */
  static getTagByName(name: string): Tag | null {
    const db = this.getDb();
    const stmt = db.prepare('SELECT * FROM tags WHERE name = ?');
    return stmt.get(name) as Tag | null;
  }

  /**
   * 更新标签
   */
  static updateTag(id: number, data: UpdateTagData): Tag | null {
    const db = this.getDb();
    const setClause: string[] = [];
    const params: any[] = [];
    
    if (data.name !== undefined) {
      setClause.push('name = ?');
      params.push(data.name);
    }
    
    if (data.color !== undefined) {
      setClause.push('color = ?');
      params.push(data.color);
    }
    
    if (data.description !== undefined) {
      setClause.push('description = ?');
      params.push(data.description);
    }
    
    if (setClause.length === 0) {
      return this.getTagById(id);
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`
      UPDATE tags 
      SET ${setClause.join(', ')} 
      WHERE id = ?
    `);
    
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.getTagById(id);
  }

  /**
   * 删除标签（检查是否有关联文档）
   */
  static deleteTag(id: number): { 
    success: boolean, 
    message: string, 
    documentCount?: number 
  } {
    const db = this.getDb();
    // 检查是否有文档使用此标签
    const usageStmt = db.prepare(`
      SELECT COUNT(*) as count FROM document_tags WHERE tag_id = ?
    `);
    const usageResult = usageStmt.get(id) as { count: number };
    
    if (usageResult.count > 0) {
      return {
        success: false,
        message: '无法删除：该标签正在被文档使用',
        documentCount: usageResult.count
      };
    }
    
    // 删除标签
    const deleteStmt = db.prepare('DELETE FROM tags WHERE id = ?');
    const result = deleteStmt.run(id);
    
    if (result.changes === 0) {
      return {
        success: false,
        message: '标签不存在'
      };
    }
    
    return {
      success: true,
      message: '标签删除成功'
    };
  }

  /**
   * 强制删除标签（同时删除关联关系）
   */
  static forceDeleteTag(id: number): { success: boolean, message: string } {
    const db = this.getDb();
    const transaction = db.transaction(() => {
      // 删除文档关联
      const deleteRelationsStmt = db.prepare('DELETE FROM document_tags WHERE tag_id = ?');
      deleteRelationsStmt.run(id);
      
      // 删除标签
      const deleteTagStmt = db.prepare('DELETE FROM tags WHERE id = ?');
      const result = deleteTagStmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('标签不存在');
      }
    });
    
    try {
      transaction();
      return {
        success: true,
        message: '标签及其关联关系删除成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败'
      };
    }
  }

  /**
   * 获取标签使用次数
   */
  static getTagUsageCount(id: number): number {
    const db = this.getDb();
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM document_tags WHERE tag_id = ?
    `);
    const result = stmt.get(id) as { count: number };
    return result.count;
  }

  /**
   * 获取热门标签（按使用次数排序）
   */
  static getPopularTags(limit: number = 10): TagWithUsage[] {
    const db = this.getDb();
    const stmt = db.prepare(`
      SELECT 
        t.*,
        COUNT(dt.document_id) as document_count
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.tag_id
      GROUP BY t.id
      HAVING document_count > 0
      ORDER BY document_count DESC, t.name ASC
      LIMIT ?
    `);
    
    return stmt.all(limit) as TagWithUsage[];
  }

  /**
   * 更新标签使用次数（当文档标签关系改变时调用）
   */
  static updateTagUsageCount(tagId: number): void {
    const db = this.getDb();
    const stmt = db.prepare(`
      UPDATE tags 
      SET usage_count = (
        SELECT COUNT(*) FROM document_tags WHERE tag_id = ?
      )
      WHERE id = ?
    `);
    
    stmt.run(tagId, tagId);
  }

  /**
   * 批量更新所有标签的使用次数
   */
  static updateAllTagUsageCounts(): void {
    const db = this.getDb();
    const stmt = db.prepare(`
      UPDATE tags 
      SET usage_count = (
        SELECT COUNT(*) FROM document_tags WHERE tag_id = tags.id
      )
    `);
    
    stmt.run();
  }

  /**
   * 检查标签名称是否已存在
   */
  static isTagNameExists(name: string, excludeId?: number): boolean {
    const db = this.getDb();
    let stmt: any;
    let params: any[];
    
    if (excludeId) {
      stmt = db.prepare('SELECT COUNT(*) as count FROM tags WHERE name = ? AND id != ?');
      params = [name, excludeId];
    } else {
      stmt = db.prepare('SELECT COUNT(*) as count FROM tags WHERE name = ?');
      params = [name];
    }
    
    const result = stmt.get(...params) as { count: number };
    return result.count > 0;
  }

  /**
   * 获取用户创建的标签
   */
  static getTagsByCreator(userId: number): Tag[] {
    const db = this.getDb();
    const stmt = db.prepare(`
      SELECT * FROM tags 
      WHERE created_by = ? 
      ORDER BY created_at DESC
    `);
    
    return stmt.all(userId) as Tag[];
  }

  /**
   * 搜索标签
   */
  static searchTags(keyword: string, limit: number = 20): Tag[] {
    const db = this.getDb();
    const stmt = db.prepare(`
      SELECT * FROM tags 
      WHERE name LIKE ? 
      ORDER BY usage_count DESC, name ASC
      LIMIT ?
    `);
    
    return stmt.all(`%${keyword}%`, limit) as Tag[];
  }
}

export default TagDao;