// 开发模式：暂时跳过数据库连接，使用模拟数据
// import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 数据库连接管理类（开发模式）
 * 提供单例模式的数据库连接
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: any;
  private dbPath: string;

  private constructor() {
    // 获取数据库路径，支持环境变量配置
    this.dbPath =
      process.env.DB_PATH || path.join(__dirname, '../../../database/knowledge_base.db');

    // 开发模式：跳过实际数据库连接
    this.db = {
      prepare: () => ({ get: () => null, all: () => [], run: () => null }),
      pragma: () => null,
      exec: () => null,
      transaction: (fn: any) => () => fn(this.db),
      backup: () => ({ complete: () => null }),
      close: () => null,
    };

    console.log(`🗄️ 数据库连接（开发模式）: ${this.dbPath}`);
  }

  /**
   * 获取数据库连接实例（单例模式）
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * 获取数据库对象
   */
  public getDatabase(): any {
    return this.db;
  }

  /**
   * 配置数据库（开发模式空实现）
   */
  private configureDatabase(): void {
    // 开发模式：跳过数据库配置
    console.log('🚀 数据库配置跳过（开发模式）');
  }

  /**
   * 检查数据库连接状态（开发模式）
   */
  public isConnected(): boolean {
    return true; // 开发模式始终返回true
  }

  /**
   * 执行数据库健康检查（开发模式）
   */
  public healthCheck(): { status: string; message: string; details?: any } {
    return {
      status: 'healthy',
      message: '开发模式 - 数据库连接跳过',
      details: {
        mode: 'development',
        mock_data: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 执行事务（开发模式）
   */
  public transaction<T>(fn: (db: any) => T): T {
    return fn(this.db);
  }

  /**
   * 备份数据库
   */
  public async backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const backup = this.db.backup(backupPath);
        backup.complete();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 优化数据库
   */
  public optimize(): void {
    // 分析数据库统计信息
    this.db.exec('ANALYZE');

    // 清理和优化
    this.db.exec('VACUUM');

    // 重建索引
    this.db.exec('REINDEX');
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

/**
 * 获取数据库实例的便捷函数（开发模式）
 */
export function getDatabase(): any {
  return DatabaseConnection.getInstance().getDatabase();
}

/**
 * 获取数据库连接实例的便捷函数
 */
export function getDatabaseConnection(): DatabaseConnection {
  return DatabaseConnection.getInstance();
}
