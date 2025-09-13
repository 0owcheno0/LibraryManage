// 注意：当前使用SQLite CLI创建了数据库，运行时需要安装 better-sqlite3 或 sqlite3 包
// import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 数据库连接管理类
 * 提供单例模式的数据库连接
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: any; // Database.Database;
  private dbPath: string;

  private constructor() {
    // 获取数据库路径，支持环境变量配置
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database/knowledge_base.db');
    
    // 确保数据库目录存在
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 初始化数据库连接
    // this.db = new Database(this.dbPath);
    console.log(`数据库路径: ${this.dbPath}`);
    
    // 配置数据库
    this.configureDatabase();
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
  public getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * 配置数据库
   */
  private configureDatabase(): void {
    // 启用WAL模式，提高并发性能
    this.db.pragma('journal_mode = WAL');
    
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 设置同步模式
    this.db.pragma('synchronous = NORMAL');
    
    // 设置缓存大小 (64MB)
    this.db.pragma('cache_size = -65536');
    
    // 设置临时存储为内存
    this.db.pragma('temp_store = MEMORY');
    
    // 设置mmap大小 (256MB)
    this.db.pragma('mmap_size = 268435456');
  }

  /**
   * 检查数据库连接状态
   */
  public isConnected(): boolean {
    try {
      this.db.prepare('SELECT 1').get();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 执行数据库健康检查
   */
  public healthCheck(): { status: string; message: string; details?: any } {
    try {
      // 检查连接
      if (!this.isConnected()) {
        return { status: 'error', message: '数据库连接失败' };
      }

      // 检查表是否存在
      const tables = ['users', 'documents', 'tags'];
      const tableCheck = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN (${tables.map(() => '?').join(',')})
      `).all(...tables);

      if (tableCheck.length !== tables.length) {
        return { 
          status: 'warning', 
          message: '部分数据表缺失',
          details: { expected: tables.length, found: tableCheck.length }
        };
      }

      // 获取数据库统计信息
      const stats = {
        file_size: fs.statSync(this.dbPath).size,
        page_count: this.db.pragma('page_count', { simple: true }),
        page_size: this.db.pragma('page_size', { simple: true }),
        user_count: this.db.prepare('SELECT COUNT(*) as count FROM users').get(),
        document_count: this.db.prepare('SELECT COUNT(*) as count FROM documents').get(),
        tag_count: this.db.prepare('SELECT COUNT(*) as count FROM tags').get()
      };

      return { 
        status: 'healthy', 
        message: '数据库运行正常',
        details: stats
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: `数据库健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 执行事务
   */
  public transaction<T>(fn: (db: Database.Database) => T): T {
    const transaction = this.db.transaction(fn);
    return transaction();
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
 * 获取数据库实例的便捷函数
 */
export function getDatabase(): Database.Database {
  return DatabaseConnection.getInstance().getDatabase();
}

/**
 * 获取数据库连接实例的便捷函数
 */
export function getDatabaseConnection(): DatabaseConnection {
  return DatabaseConnection.getInstance();
}