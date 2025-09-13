import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 数据库连接管理类（开发模式）
 * 提供单例模式的数据库连接
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db!: Database.Database;
  private dbPath: string;

  private constructor() {
    // 获取数据库路径，支持环境变量配置
    this.dbPath =
      process.env.DB_PATH || path.join(__dirname, '../../../database/knowledge_base.db');

    this.initializeDatabase();
  }

  /**
   * 初始化数据库连接
   */
  private initializeDatabase(): void {
    try {
      // 确保数据库目录存在
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // 连接数据库
      this.db = new Database(this.dbPath);
      
      // 配置数据库
      this.configureDatabase();
      
      console.log(`✅ 数据库连接成功: ${this.dbPath}`);
      
      // 如果数据库为空，初始化表结构
      this.ensureTablesExist();
      
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  /**
   * 确保数据库表存在
   */
  private ensureTablesExist(): void {
    try {
      // 检查是否存在用户表
      const tableExists = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      ).get();
      
      if (!tableExists) {
        console.log('🔧 数据库表不存在，正在初始化...');
        this.initializeTables();
      }
    } catch (error) {
      console.error('❌ 检查数据库表失败:', error);
    }
  }

  /**
   * 初始化数据库表
   */
  private initializeTables(): void {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schema);
        console.log('✅ 数据库表初始化完成');
      } else {
        console.warn('⚠️ 数据库模式文件不存在，跳过初始化');
      }
    } catch (error) {
      console.error('❌ 数据库表初始化失败:', error);
    }
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
    // 启用WAL模式提高性能
    this.db.pragma('journal_mode = WAL');
    
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 设置同步模式
    this.db.pragma('synchronous = NORMAL');
    
    console.log('🚀 数据库配置完成');
  }

  /**
   * 检查数据库连接状态
   */
  public isConnected(): boolean {
    try {
      // 尝试执行一个简单的查询
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
      const isConnected = this.isConnected();
      
      if (!isConnected) {
        return {
          status: 'unhealthy',
          message: '数据库连接失败',
          details: {
            path: this.dbPath,
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      // 获取数据库统计信息
      const stats = {
        users: this.db.prepare('SELECT COUNT(*) as count FROM users').get(),
        documents: this.db.prepare('SELECT COUNT(*) as count FROM documents').get(),
        tags: this.db.prepare('SELECT COUNT(*) as count FROM tags').get(),
      };
      
      return {
        status: 'healthy',
        message: '数据库连接正常',
        details: {
          path: this.dbPath,
          statistics: stats,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `数据库健康检查失败: ${error}`,
        details: {
          path: this.dbPath,
          error: error,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * 执行事务
   */
  public transaction<T>(fn: (db: Database.Database) => T): T {
    const transaction = this.db.transaction(fn);
    return transaction(this.db);
  }

  /**
   * 备份数据库
   */
  public async backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 使用SQLite的BACKUP命令
        this.db.exec(`VACUUM INTO '${backupPath}'`);
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
