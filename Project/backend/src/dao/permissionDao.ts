import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface DocumentPermission {
  id: number;
  resource_type: string;
  resource_id: number;
  user_id: number;
  permission_type: string;
  granted_by: number;
  created_at: string;
}

export class PermissionDao {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 为文档添加用户权限
   */
  static async addDocumentPermission(
    documentId: number,
    userId: number,
    permissionType: string,
    grantedBy: number
  ): Promise<number | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        INSERT INTO permissions (
          resource_type, resource_id, user_id, permission_type, granted_by, created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run('document', documentId, userId, permissionType, grantedBy);
      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('添加文档权限失败:', error);
      return null;
    }
  }

  /**
   * 移除文档用户权限
   */
  static async removeDocumentPermission(documentId: number, userId: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        DELETE FROM permissions 
        WHERE resource_type = 'document' AND resource_id = ? AND user_id = ?
      `);
      
      const result = stmt.run(documentId, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('移除文档权限失败:', error);
      return false;
    }
  }

  /**
   * 获取文档权限列表
   */
  static async getDocumentPermissions(documentId: number): Promise<DocumentPermission[]> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        SELECT p.*, u.full_name as user_name
        FROM permissions p
        INNER JOIN users u ON p.user_id = u.id
        WHERE p.resource_type = 'document' AND p.resource_id = ?
        ORDER BY p.created_at DESC
      `);
      
      return stmt.all(documentId) as DocumentPermission[];
    } catch (error) {
      console.error('获取文档权限列表失败:', error);
      return [];
    }
  }

  /**
   * 检查用户对文档的权限
   */
  static async checkUserDocumentPermission(
    documentId: number,
    userId: number,
    requiredPermission: string
  ): Promise<boolean> {
    try {
      const db = this.getDb();
      
      // 检查用户是否是文档所有者
      const ownerCheck = db.prepare(`
        SELECT COUNT(*) as count 
        FROM documents 
        WHERE id = ? AND upload_user_id = ?
      `).get(documentId, userId) as { count: number };
      
      if (ownerCheck.count > 0) {
        return true; // 文档所有者拥有所有权限
      }

      // 检查用户是否有特定权限
      const permissionCheck = db.prepare(`
        SELECT permission_type 
        FROM permissions 
        WHERE resource_type = 'document' AND resource_id = ? AND user_id = ?
      `).get(documentId, userId) as { permission_type: string } | undefined;
      
      if (!permissionCheck) {
        return false; // 用户没有权限
      }

      // 权限级别检查
      const permissionLevels: Record<string, number> = {
        'read': 1,
        'write': 2,
        'admin': 3
      };

      const userLevel = permissionLevels[permissionCheck.permission_type] || 0;
      const requiredLevel = permissionLevels[requiredPermission] || 0;

      return userLevel >= requiredLevel;
    } catch (error) {
      console.error('检查用户文档权限失败:', error);
      return false;
    }
  }
}