import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
  created_at: string;
  updated_at: string;
}

export class RoleModel {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  /**
   * 根据角色ID查找角色
   */
  static async findById(id: number): Promise<Role | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM roles WHERE id = ?');
      const role = stmt.get(id) as Role | undefined;
      return role || null;
    } catch (error) {
      console.error('查找角色失败:', error);
      return null;
    }
  }

  /**
   * 根据角色名称查找角色
   */
  static async findByName(name: string): Promise<Role | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM roles WHERE name = ?');
      const role = stmt.get(name) as Role | undefined;
      return role || null;
    } catch (error) {
      console.error('查找角色失败:', error);
      return null;
    }
  }

  /**
   * 获取所有角色列表
   */
  static async getAll(): Promise<Role[]> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM roles ORDER BY id ASC');
      const roles = stmt.all() as Role[];
      return roles;
    } catch (error) {
      console.error('获取角色列表失败:', error);
      return [];
    }
  }

  /**
   * 解析角色权限
   */
  static parsePermissions(permissionsJson: string): string[] {
    try {
      return JSON.parse(permissionsJson);
    } catch {
      return [];
    }
  }

  /**
   * 检查角色是否有特定权限
   */
  static hasPermission(role: Role, permission: string): boolean {
    const permissions = this.parsePermissions(role.permissions);
    return permissions.includes('*') || permissions.includes(permission);
  }
}