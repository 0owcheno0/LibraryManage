import Database from 'better-sqlite3';
import path from 'path';
import { TagDao } from './tagDao';

// 数据库连接
const dbPath = path.join(__dirname, '../../../database/knowledge_base.db');
const db = new Database(dbPath);

// 接口定义
export interface DocumentTag {
  document_id: number;
  tag_id: number;
  created_at?: string;
}

export interface DocumentWithTags {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  tags: {
    id: number;
    name: string;
    color: string;
    description?: string;
  }[];
}

export interface TagWithDocumentCount {
  id: number;
  name: string;
  color: string;
  description?: string;
  document_count: number;
}

export class DocumentTagDao {
  
  /**
   * 批量添加文档标签关联
   */
  static addDocumentTags(documentId: number, tagIds: number[]): { 
    success: boolean, 
    message: string,
    added: number 
  } {
    if (!tagIds || tagIds.length === 0) {
      return {
        success: true,
        message: '没有标签需要添加',
        added: 0
      };
    }

    const transaction = db.transaction(() => {
      let addedCount = 0;
      
      for (const tagId of tagIds) {
        try {
          // 检查关联是否已存在
          const existsStmt = db.prepare(`
            SELECT COUNT(*) as count FROM document_tags 
            WHERE document_id = ? AND tag_id = ?
          `);
          const exists = existsStmt.get(documentId, tagId) as { count: number };
          
          if (exists.count === 0) {
            // 添加新关联
            const insertStmt = db.prepare(`
              INSERT INTO document_tags (document_id, tag_id) 
              VALUES (?, ?)
            `);
            insertStmt.run(documentId, tagId);
            addedCount++;
            
            // 更新标签使用次数
            TagDao.updateTagUsageCount(tagId);
          }
        } catch (error) {
          console.error(`Error adding tag ${tagId} to document ${documentId}:`, error);
          // 继续处理其他标签，不中断事务
        }
      }
      
      return addedCount;
    });

    try {
      const added = transaction();
      return {
        success: true,
        message: `成功添加 ${added} 个标签关联`,
        added
      };
    } catch (error) {
      console.error('Add document tags error:', error);
      return {
        success: false,
        message: '添加标签关联失败',
        added: 0
      };
    }
  }

  /**
   * 批量移除文档标签关联
   */
  static removeDocumentTags(documentId: number, tagIds: number[]): { 
    success: boolean, 
    message: string,
    removed: number 
  } {
    if (!tagIds || tagIds.length === 0) {
      return {
        success: true,
        message: '没有标签需要移除',
        removed: 0
      };
    }

    const transaction = db.transaction(() => {
      let removedCount = 0;
      
      for (const tagId of tagIds) {
        try {
          // 删除关联
          const deleteStmt = db.prepare(`
            DELETE FROM document_tags 
            WHERE document_id = ? AND tag_id = ?
          `);
          const result = deleteStmt.run(documentId, tagId);
          
          if (result.changes > 0) {
            removedCount++;
            // 更新标签使用次数
            TagDao.updateTagUsageCount(tagId);
          }
        } catch (error) {
          console.error(`Error removing tag ${tagId} from document ${documentId}:`, error);
          // 继续处理其他标签，不中断事务
        }
      }
      
      return removedCount;
    });

    try {
      const removed = transaction();
      return {
        success: true,
        message: `成功移除 ${removed} 个标签关联`,
        removed
      };
    } catch (error) {
      console.error('Remove document tags error:', error);
      return {
        success: false,
        message: '移除标签关联失败',
        removed: 0
      };
    }
  }

  /**
   * 获取文档的所有标签
   */
  static getDocumentTags(documentId: number): {
    id: number;
    name: string;
    color: string;
    description?: string;
  }[] {
    const stmt = db.prepare(`
      SELECT t.id, t.name, t.color, t.description
      FROM tags t
      INNER JOIN document_tags dt ON t.id = dt.tag_id
      WHERE dt.document_id = ?
      ORDER BY t.name ASC
    `);
    
    return stmt.all(documentId) as {
      id: number;
      name: string;
      color: string;
      description?: string;
    }[];
  }

  /**
   * 全量更新文档标签(删除旧的+添加新的)
   */
  static updateDocumentTags(documentId: number, tagIds: number[]): { 
    success: boolean, 
    message: string,
    changes: {
      removed: number;
      added: number;
    }
  } {
    const transaction = db.transaction(() => {
      // 1. 获取当前文档的所有标签ID
      const currentTagsStmt = db.prepare(`
        SELECT tag_id FROM document_tags WHERE document_id = ?
      `);
      const currentTags = currentTagsStmt.all(documentId) as { tag_id: number }[];
      const currentTagIds = currentTags.map(t => t.tag_id);
      
      // 2. 计算要移除和要添加的标签
      const newTagIds = tagIds || [];
      const toRemove = currentTagIds.filter(id => !newTagIds.includes(id));
      const toAdd = newTagIds.filter(id => !currentTagIds.includes(id));
      
      let removedCount = 0;
      let addedCount = 0;
      
      // 3. 移除不再需要的标签
      if (toRemove.length > 0) {
        const removeStmt = db.prepare(`
          DELETE FROM document_tags 
          WHERE document_id = ? AND tag_id = ?
        `);
        
        for (const tagId of toRemove) {
          const result = removeStmt.run(documentId, tagId);
          if (result.changes > 0) {
            removedCount++;
            TagDao.updateTagUsageCount(tagId);
          }
        }
      }
      
      // 4. 添加新的标签
      if (toAdd.length > 0) {
        const addStmt = db.prepare(`
          INSERT INTO document_tags (document_id, tag_id) 
          VALUES (?, ?)
        `);
        
        for (const tagId of toAdd) {
          try {
            addStmt.run(documentId, tagId);
            addedCount++;
            TagDao.updateTagUsageCount(tagId);
          } catch (error) {
            console.error(`Error adding tag ${tagId}:`, error);
            // 继续处理其他标签
          }
        }
      }
      
      return { removed: removedCount, added: addedCount };
    });

    try {
      const changes = transaction();
      return {
        success: true,
        message: `标签更新成功：移除 ${changes.removed} 个，添加 ${changes.added} 个`,
        changes
      };
    } catch (error) {
      console.error('Update document tags error:', error);
      return {
        success: false,
        message: '更新文档标签失败',
        changes: { removed: 0, added: 0 }
      };
    }
  }

  /**
   * 获取带标签信息的文档
   */
  static getDocumentWithTags(documentId: number): DocumentWithTags | null {
    // 获取文档基本信息
    const docStmt = db.prepare(`
      SELECT * FROM documents WHERE id = ?
    `);
    const document = docStmt.get(documentId);
    
    if (!document) {
      return null;
    }
    
    // 获取文档标签
    const tags = this.getDocumentTags(documentId);
    
    return {
      ...document,
      tags
    } as DocumentWithTags;
  }

  /**
   * 批量获取多个文档的标签
   */
  static getDocumentsBatchTags(documentIds: number[]): Map<number, {
    id: number;
    name: string;
    color: string;
    description?: string;
  }[]> {
    if (!documentIds || documentIds.length === 0) {
      return new Map();
    }
    
    const placeholders = documentIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT dt.document_id, t.id, t.name, t.color, t.description
      FROM tags t
      INNER JOIN document_tags dt ON t.id = dt.tag_id
      WHERE dt.document_id IN (${placeholders})
      ORDER BY dt.document_id, t.name ASC
    `);
    
    const results = stmt.all(...documentIds) as {
      document_id: number;
      id: number;
      name: string;
      color: string;
      description: string | null;
    }[];
    
    const tagMap = new Map<number, {
      id: number;
      name: string;
      color: string;
      description?: string;
    }[]>();
    
    // 初始化所有文档的标签数组
    documentIds.forEach(id => {
      tagMap.set(id, []);
    });
    
    // 分组标签
    results.forEach(row => {
      const existing = tagMap.get(row.document_id) || [];
      const tagObj: {
        id: number;
        name: string;
        color: string;
        description?: string;
      } = {
        id: row.id,
        name: row.name,
        color: row.color
      };
      
      if (row.description !== null) {
        tagObj.description = row.description;
      }
      
      existing.push(tagObj);
      tagMap.set(row.document_id, existing);
    });
    
    return tagMap;
  }

  /**
   * 根据标签筛选文档
   */
  static getDocumentsByTags(tagIds: number[], options?: {
    matchAll?: boolean; // true: AND操作，false: OR操作
    limit?: number;
    offset?: number;
  }): {
    documents: DocumentWithTags[];
    total: number;
  } {
    const { matchAll = false, limit, offset } = options || {};
    
    if (!tagIds || tagIds.length === 0) {
      return { documents: [], total: 0 };
    }
    
    let query: string;
    let countQuery: string;
    
    if (matchAll) {
      // AND操作：文档必须包含所有指定标签
      const placeholders = tagIds.map(() => '?').join(',');
      query = `
        SELECT DISTINCT d.*
        FROM documents d
        INNER JOIN document_tags dt ON d.id = dt.document_id
        WHERE dt.tag_id IN (${placeholders})
        GROUP BY d.id
        HAVING COUNT(DISTINCT dt.tag_id) = ?
        ORDER BY d.created_at DESC
      `;
      countQuery = `
        SELECT COUNT(DISTINCT d.id) as count
        FROM documents d
        INNER JOIN document_tags dt ON d.id = dt.document_id
        WHERE dt.tag_id IN (${placeholders})
        GROUP BY d.id
        HAVING COUNT(DISTINCT dt.tag_id) = ?
      `;
    } else {
      // OR操作：文档包含任意一个指定标签
      const placeholders = tagIds.map(() => '?').join(',');
      query = `
        SELECT DISTINCT d.*
        FROM documents d
        INNER JOIN document_tags dt ON d.id = dt.document_id
        WHERE dt.tag_id IN (${placeholders})
        ORDER BY d.created_at DESC
      `;
      countQuery = `
        SELECT COUNT(DISTINCT d.id) as count
        FROM documents d
        INNER JOIN document_tags dt ON d.id = dt.document_id
        WHERE dt.tag_id IN (${placeholders})
      `;
    }
    
    // 添加分页
    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }
    
    try {
      // 执行查询
      let queryParams = [...tagIds];
      if (matchAll) {
        queryParams.push(tagIds.length);
      }
      
      const stmt = db.prepare(query);
      const documents = stmt.all(...queryParams) as any[];
      
      // 获取总数
      let countParams = [...tagIds];
      if (matchAll) {
        countParams.push(tagIds.length);
      }
      
      const countStmt = db.prepare(countQuery);
      const countResult = matchAll 
        ? countStmt.all(...countParams).length  // HAVING子句需要计算组数
        : (countStmt.get(...countParams) as { count: number }).count;
      
      // 批量获取标签信息
      const documentIds = documents.map(d => d.id);
      const tagsMap = this.getDocumentsBatchTags(documentIds);
      
      // 组合结果
      const documentsWithTags: DocumentWithTags[] = documents.map(doc => ({
        ...doc,
        tags: tagsMap.get(doc.id) || []
      }));
      
      return {
        documents: documentsWithTags,
        total: countResult
      };
    } catch (error) {
      console.error('Get documents by tags error:', error);
      return { documents: [], total: 0 };
    }
  }

  /**
   * 获取热门标签（按文档数量排序）
   */
  static getPopularTagsWithDocumentCount(limit: number = 10): TagWithDocumentCount[] {
    const stmt = db.prepare(`
      SELECT 
        t.id, t.name, t.color, t.description,
        COUNT(dt.document_id) as document_count
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.tag_id
      GROUP BY t.id
      HAVING document_count > 0
      ORDER BY document_count DESC, t.name ASC
      LIMIT ?
    `);
    
    return stmt.all(limit) as TagWithDocumentCount[];
  }

  /**
   * 删除文档时清理标签关联
   */
  static removeAllDocumentTags(documentId: number): { 
    success: boolean, 
    message: string,
    removed: number 
  } {
    const transaction = db.transaction(() => {
      // 获取要删除的标签，用于更新使用次数
      const tagsStmt = db.prepare(`
        SELECT tag_id FROM document_tags WHERE document_id = ?
      `);
      const tags = tagsStmt.all(documentId) as { tag_id: number }[];
      
      // 删除关联
      const deleteStmt = db.prepare(`
        DELETE FROM document_tags WHERE document_id = ?
      `);
      const result = deleteStmt.run(documentId);
      
      // 更新标签使用次数
      for (const tag of tags) {
        TagDao.updateTagUsageCount(tag.tag_id);
      }
      
      return result.changes;
    });

    try {
      const removed = transaction();
      return {
        success: true,
        message: `成功清理 ${removed} 个标签关联`,
        removed
      };
    } catch (error) {
      console.error('Remove all document tags error:', error);
      return {
        success: false,
        message: '清理标签关联失败',
        removed: 0
      };
    }
  }

  /**
   * 获取文档标签关联统计
   */
  static getDocumentTagStats(): {
    totalRelations: number;
    documentsWithTags: number;
    averageTagsPerDocument: number;
    tagsInUse: number;
  } {
    const totalRelationsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM document_tags
    `);
    const totalRelations = (totalRelationsStmt.get() as { count: number }).count;

    const documentsWithTagsStmt = db.prepare(`
      SELECT COUNT(DISTINCT document_id) as count FROM document_tags
    `);
    const documentsWithTags = (documentsWithTagsStmt.get() as { count: number }).count;

    const tagsInUseStmt = db.prepare(`
      SELECT COUNT(DISTINCT tag_id) as count FROM document_tags
    `);
    const tagsInUse = (tagsInUseStmt.get() as { count: number }).count;

    const averageTagsPerDocument = documentsWithTags > 0 
      ? Math.round((totalRelations / documentsWithTags) * 100) / 100 
      : 0;

    return {
      totalRelations,
      documentsWithTags,
      averageTagsPerDocument,
      tagsInUse
    };
  }
}

export default DocumentTagDao;