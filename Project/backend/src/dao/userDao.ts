import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';
import { User } from '../models/User';

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role_id: number;
  role_name: string;
  status: number;
  created_at: string;
  last_login_at?: string;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface UpdateUserStatusData {
  status: number;
}

export interface UpdateUserRoleData {
  role_id: number;
}

export class UserDao {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 根据ID获取用户信息（包含角色名称）
   */
  static async getUserById(id: number): Promise<UserListItem | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        SELECT 
          u.*,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.status != -1
      `);
      
      const user = stmt.get(id) as UserListItem | undefined;
      return user || null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取用户列表 - 支持分页和搜索
   */
  static async getUsers(page: number = 1, pageSize: number = 20, keyword?: string): Promise<{
    users: UserListItem[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const db = this.getDb();
      
      // 构建查询条件
      let whereConditions: string[] = ['u.status != -1']; // 不查询已删除用户
      let params: any[] = [];

      // 关键词搜索
      if (keyword) {
        whereConditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // 获取总数
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM users u
        ${whereClause}
      `;
      const countResult = db.prepare(countQuery).get(...params) as { total: number };
      const total = countResult.total;

      // 获取分页数据
      const offset = (page - 1) * pageSize;
      const dataQuery = `
        SELECT 
          u.*,
          r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      const users = db.prepare(dataQuery).all(...params) as UserListItem[];

      return {
        users,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(id: number, updateData: UpdateUserData): Promise<boolean> {
    try {
      const db = this.getDb();
      
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.full_name !== undefined) {
        fields.push('full_name = ?');
        values.push(updateData.full_name);
      }
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.avatar_url !== undefined) {
        fields.push('avatar_url = ?');
        values.push(updateData.avatar_url);
      }

      if (fields.length === 0) {
        return true; // 没有更新内容
      }

      fields.push('updated_at = datetime(\'now\')');
      values.push(id);

      const stmt = db.prepare(`
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = ? AND status != -1
      `);

      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  }

  /**
   * 更新用户密码
   */
  static async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE users 
        SET password_hash = ?, updated_at = datetime('now')
        WHERE id = ? AND status != -1
      `);
      
      const result = stmt.run(passwordHash, id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新用户密码失败:', error);
      return false;
    }
  }

  /**
   * 更新用户状态（启用/禁用）
   */
  static async updateUserStatus(id: number, statusData: UpdateUserStatusData): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE users 
        SET status = ?, updated_at = datetime('now')
        WHERE id = ? AND status != -1
      `);
      
      const result = stmt.run(statusData.status, id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新用户状态失败:', error);
      return false;
    }
  }

  /**
   * 更新用户角色
   */
  static async updateUserRole(id: number, roleData: UpdateUserRoleData): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE users 
        SET role_id = ?, updated_at = datetime('now')
        WHERE id = ? AND status != -1
      `);
      
      const result = stmt.run(roleData.role_id, id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新用户角色失败:', error);
      return false;
    }
  }

  /**
   * 软删除用户
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE users 
        SET status = -1, updated_at = datetime('now')
        WHERE id = ? AND status != -1
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    }
  }

  /**
   * 更新用户最后登录时间
   */
  static async updateLastLogin(id: number): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        UPDATE users 
        SET last_login_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ? AND status = 1
      `);
      
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('更新最后登录时间失败:', error);
      return false;
    }
  }

  /**
   * 验证用户密码
   */
  static async verifyPassword(userId: number, passwordHash: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE id = ? AND password_hash = ? AND status = 1
      `);
      
      const result = stmt.get(userId, passwordHash) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('验证用户密码失败:', error);
      return false;
    }
  }
}