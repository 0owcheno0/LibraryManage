import { getDatabase } from '../database/connection';
import type Database from 'better-sqlite3';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  role_id: number;
  status: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string | undefined;
  created_at: string;
}

export class UserModel {
  private static getDb(): Database.Database {
    return getDatabase();
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND status = 1');
      const user = stmt.get(email) as User | undefined;
      return user || null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  static async findByUsername(username: string): Promise<User | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND status = 1');
      const user = stmt.get(username) as User | undefined;
      return user || null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  static async findById(id: string | number): Promise<User | null> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT * FROM users WHERE id = ? AND status = 1');
      const user = stmt.get(id) as User | undefined;
      return user || null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  static async create(userData: CreateUserData): Promise<User> {
    try {
      const db = this.getDb();
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password_hash, full_name, role_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 3, 1, datetime('now'), datetime('now'))
      `);
      
      const result = stmt.run(
        userData.username,
        userData.email,
        userData.password, // 注意：这里应该是已经哈希过的密码
        userData.full_name || userData.username
      );
      
      // 获取创建的用户
      const newUser = await this.findById(result.lastInsertRowid as number);
      if (!newUser) {
        throw new Error('创建用户后无法获取用户信息');
      }
      
      return newUser;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  static async emailExists(email: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
      const result = stmt.get(email) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('检查邮箱是否存在失败:', error);
      return false;
    }
  }

  static async usernameExists(username: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?');
      const result = stmt.get(username) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('检查用户名是否存在失败:', error);
      return false;
    }
  }

  static toProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url || undefined,
      created_at: user.created_at,
    };
  }
}
