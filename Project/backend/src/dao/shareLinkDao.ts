import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface ShareLink {
  id: number;
  document_id: number;
  token: string;
  expires_at: string;
  password_hash?: string;
  download_limit?: number;
  download_count: number;
  created_by: number;
  created_at: string;
}

export class ShareLinkDao {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 创建分享链接
   */
  static async createShareLink(
    documentId: number,
    token: string,
    expiresAt: string,
    createdBy: number,
    passwordHash?: string,
    downloadLimit?: number
  ): Promise<number | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        INSERT INTO share_links (
          document_id, token, expires_at, password_hash, download_limit, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(
        documentId,
        token,
        expiresAt,
        passwordHash || null,
        downloadLimit || null,
        createdBy
      );
      
      return result.lastInsertRowid as number;
    } catch (error) {
      console.error('创建分享链接失败:', error);
      return null;
    }
  }

  /**
   * 根据token查找分享链接
   */
  static async findByToken(token: string): Promise<ShareLink | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM share_links WHERE token = ?');
      const shareLink = stmt.get(token) as ShareLink | undefined;
      return shareLink || null;
    } catch (error) {
      console.error('根据token查找分享链接失败:', error);
      return null;
    }
  }

  /**
   * 根据文档ID获取分享链接列表
   */
  static async findByDocumentId(documentId: number): Promise<ShareLink[]> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM share_links WHERE document_id = ? ORDER BY created_at DESC');
      return stmt.all(documentId) as ShareLink[];
    } catch (error) {
      console.error('根据文档ID获取分享链接列表失败:', error);
      return [];
    }
  }

  /**
   * 删除分享链接
   */
  static async deleteShareLink(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('DELETE FROM share_links WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('删除分享链接失败:', error);
      return false;
    }
  }

  /**
   * 更新下载次数
   */
  static async incrementDownloadCount(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE share_links 
        SET download_count = download_count + 1, updated_at = datetime('now')
        WHERE id = ?
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新分享链接下载次数失败:', error);
      return false;
    }
  }

  /**
   * 检查分享链接是否有效
   */
  static async isShareLinkValid(token: string): Promise<boolean> {
    try {
      const shareLink = await this.findByToken(token);
      
      if (!shareLink) {
        return false;
      }

      // 检查是否过期
      if (shareLink.expires_at) {
        const now = new Date();
        const expiresAt = new Date(shareLink.expires_at);
        if (now > expiresAt) {
          return false;
        }
      }

      // 检查下载次数限制
      if (shareLink.download_limit && shareLink.download_count >= shareLink.download_limit) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('检查分享链接有效性失败:', error);
      return false;
    }
  }
}