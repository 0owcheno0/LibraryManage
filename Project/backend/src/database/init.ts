import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(__dirname, '../../../database/knowledge_base.db');

/**
 * 初始化SQLite数据库和表结构
 * 基于数据库设计文档创建完整的表结构
 */
export class DatabaseInitializer {
  private db: Database.Database;

  constructor() {
    // 确保数据库目录存在
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 连接数据库
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL'); // 启用WAL模式提高性能
    this.db.pragma('foreign_keys = ON'); // 启用外键约束
  }

  /**
   * 创建所有数据表
   */
  public async createTables(): Promise<void> {
    console.log('🗄️ 开始创建数据库表结构...');

    // 1. 创建用户表
    this.createUsersTable();

    // 2. 创建角色表
    this.createRolesTable();

    // 3. 创建用户角色关联表
    this.createUserRolesTable();

    // 4. 创建文档表
    this.createDocumentsTable();

    // 5. 创建标签表
    this.createTagsTable();

    // 6. 创建文档标签关联表
    this.createDocumentTagsTable();

    // 7. 创建权限表
    this.createPermissionsTable();

    // 8. 创建系统配置表
    this.createSystemConfigsTable();

    console.log('✅ 数据库表结构创建完成');
  }

  /**
   * 创建用户表
   */
  private createUsersTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500),
        role_id INTEGER DEFAULT 3,
        status INTEGER DEFAULT 1,
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(sql);

    // 创建索引
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);');

    console.log('✓ 用户表 (users) 创建完成');
  }

  /**
   * 创建角色表
   */
  private createRolesTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions TEXT, -- JSON格式存储权限列表
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(sql);
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);');

    console.log('✓ 角色表 (roles) 创建完成');
  }

  /**
   * 创建用户角色关联表
   */
  private createUserRolesTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      );
    `;

    this.db.exec(sql);
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);');

    console.log('✓ 用户角色关联表 (user_roles) 创建完成');
  }

  /**
   * 创建文档表
   */
  private createDocumentsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_hash VARCHAR(64), -- MD5哈希，防重复上传
        is_public BOOLEAN DEFAULT 0, -- 0=私有, 1=公开
        view_count INTEGER DEFAULT 0,
        download_count INTEGER DEFAULT 0,
        created_by INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active', -- active, deleted, archived
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    this.db.exec(sql);

    // 创建索引
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);');

    console.log('✓ 文档表 (documents) 创建完成');
  }

  /**
   * 创建标签表
   */
  private createTagsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#1890ff', -- 十六进制颜色代码
        description TEXT,
        usage_count INTEGER DEFAULT 0, -- 使用次数统计
        created_by INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    this.db.exec(sql);

    // 创建索引
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_tags_created_by ON tags(created_by);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);');

    console.log('✓ 标签表 (tags) 创建完成');
  }

  /**
   * 创建文档标签关联表
   */
  private createDocumentTagsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS document_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(document_id, tag_id)
      );
    `;

    this.db.exec(sql);

    // 创建索引
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);'
    );
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON document_tags(tag_id);');

    console.log('✓ 文档标签关联表 (document_tags) 创建完成');
  }

  /**
   * 创建权限表
   */
  private createPermissionsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resource_type VARCHAR(50) NOT NULL,  -- 'document', 'tag', 'user'
        resource_id INTEGER,
        user_id INTEGER NOT NULL,
        permission_type VARCHAR(20) NOT NULL,  -- 'read', 'write', 'delete', 'admin'
        granted_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    this.db.exec(sql);

    // 创建索引
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_permissions_user ON permissions(user_id);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource_type, resource_id);');

    console.log('✓ 权限表 (permissions) 创建完成');
  }

  /**
   * 创建系统配置表
   */
  private createSystemConfigsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS system_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value TEXT,
        description TEXT,
        config_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
        is_public BOOLEAN DEFAULT 0, -- 是否可公开访问
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    this.db.exec(sql);
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);'
    );

    console.log('✓ 系统配置表 (system_configs) 创建完成');
  }

  /**
   * 插入初始数据
   */
  public async seedData(): Promise<void> {
    console.log('🌱 开始插入初始数据...');

    // 插入角色数据
    await this.seedRoles();

    // 插入管理员用户
    await this.seedAdminUser();

    // 插入系统配置
    await this.seedSystemConfigs();

    console.log('✅ 初始数据插入完成');
  }

  /**
   * 插入角色数据
   */
  private async seedRoles(): Promise<void> {
    const roles = [
      {
        name: 'admin',
        description: '系统管理员',
        permissions: '["*"]',
      },
      {
        name: 'editor',
        description: '编辑者',
        permissions: '["document:read", "document:write", "document:delete", "tag:read", "tag:write"]',
      },
      {
        name: 'viewer',
        description: '查看者',
        permissions: '["document:read", "tag:read"]',
      },
    ];

    const insertRole = this.db.prepare(`
      INSERT OR IGNORE INTO roles (name, description, permissions)
      VALUES (?, ?, ?)
    `);

    for (const role of roles) {
      insertRole.run(role.name, role.description, role.permissions);
    }

    console.log('✓ 角色数据插入完成 (admin, editor, viewer)');
  }

  /**
   * 插入管理员用户
   */
  private async seedAdminUser(): Promise<void> {
    // 创建默认管理员用户
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const insertUser = this.db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run('admin', 'admin@example.com', passwordHash, '系统管理员', 1, 1);

    if (result.changes > 0) {
      // 获取admin用户ID和admin角色ID
      const adminUser = this.db
        .prepare('SELECT id FROM users WHERE username = ?')
        .get('admin') as any;
      const adminRole = this.db.prepare('SELECT id FROM roles WHERE name = ?').get('admin') as any;

      // 分配admin角色
      const insertUserRole = this.db.prepare(`
        INSERT OR IGNORE INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `);

      insertUserRole.run(adminUser.id, adminRole.id);

      console.log('✓ 管理员用户创建完成 (admin/admin123)');
    } else {
      console.log('✓ 管理员用户已存在');
    }
  }

  /**
   * 插入系统配置
   */
  private async seedSystemConfigs(): Promise<void> {
    const configs = [
      {
        key: 'app_name',
        value: '团队知识库管理系统',
        description: '应用名称',
        category: 'basic',
      },
      {
        key: 'max_file_size',
        value: '52428800', // 50MB
        description: '最大文件上传大小 (50MB)',
        category: 'upload',
      },
      {
        key: 'allowed_file_types',
        value: '["pdf","doc","docx","ppt","pptx","xls","xlsx","txt","md","jpg","jpeg","png","gif"]',
        description: '允许上传的文件类型',
        category: 'upload',
      },
      {
        key: 'default_visibility',
        value: '2',
        description: '默认文档可见性 (1:私有, 2:团队, 3:公开)',
        category: 'document',
      },
      {
        key: 'enable_comments',
        value: 'true',
        description: '是否启用文档评论功能',
        category: 'feature',
      },
      {
        key: 'enable_download_stats',
        value: 'true',
        description: '是否启用下载统计',
        category: 'feature',
      },
      {
        key: 'jwt_expires_in',
        value: '24h',
        description: 'JWT令牌过期时间',
        category: 'auth',
        is_public: 0,
      },
      {
        key: 'enable_user_registration',
        value: 'true',
        description: '是否允许用户注册',
        type: 'boolean',
        is_public: 1,
      },
    ];

    const insertConfig = this.db.prepare(`
      INSERT OR IGNORE INTO system_configs (config_key, config_value, description, category)
      VALUES (?, ?, ?, ?)
    `);

    for (const config of configs) {
      insertConfig.run(config.key, config.value, config.description, config.category);
    }

    console.log('✓ 系统配置数据插入完成');
  }

  /**
   * 创建数据库触发器
   */
  public createTriggers(): void {
    console.log('🔧 创建数据库触发器...');

    // 更新updated_at字段的触发器
    const updateTriggers = ['users', 'roles', 'documents', 'tags', 'system_configs'];

    for (const table of updateTriggers) {
      const triggerSQL = `
        CREATE TRIGGER IF NOT EXISTS update_${table}_updated_at
        AFTER UPDATE ON ${table}
        BEGIN
          UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
      `;
      this.db.exec(triggerSQL);
    }

    // 标签使用次数统计触发器
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_tag_usage_count_on_insert
      AFTER INSERT ON document_tags
      BEGIN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
      END;
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_tag_usage_count_on_delete
      AFTER DELETE ON document_tags
      BEGIN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
      END;
    `);

    console.log('✓ 数据库触发器创建完成');
  }

  /**
   * 验证数据库完整性
   */
  public validateDatabase(): boolean {
    console.log('🔍 验证数据库完整性...');

    try {
      // 检查所有表是否存在
      const tables = [
        'users',
        'roles',
        'user_roles',
        'documents',
        'tags',
        'document_tags',
        'permissions',
        'system_configs',
      ];

      for (const table of tables) {
        const result = this.db
          .prepare(
            `
          SELECT name FROM sqlite_master WHERE type='table' AND name=?
        `
          )
          .get(table);

        if (!result) {
          throw new Error(`表 ${table} 不存在`);
        }
      }

      // 检查数据完整性
      const adminUser = this.db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
      const adminRole = this.db.prepare('SELECT * FROM roles WHERE name = ?').get('admin');

      if (!adminUser || !adminRole) {
        throw new Error('初始数据不完整');
      }

      console.log('✅ 数据库完整性验证通过');
      return true;
    } catch (error) {
      console.error('❌ 数据库完整性验证失败:', error);
      return false;
    }
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    this.db.close();
    console.log('🔒 数据库连接已关闭');
  }

  /**
   * 获取数据库统计信息
   */
  public getStats(): any {
    const stats = {
      users: this.db.prepare('SELECT COUNT(*) as count FROM users').get(),
      roles: this.db.prepare('SELECT COUNT(*) as count FROM roles').get(),
      documents: this.db.prepare('SELECT COUNT(*) as count FROM documents').get(),
      tags: this.db.prepare('SELECT COUNT(*) as count FROM tags').get(),
      database_size: fs.statSync(DB_PATH).size,
    };

    return stats;
  }
}

// 如果直接运行此文件，执行数据库初始化
if (require.main === module) {
  async function initDatabase() {
    const initializer = new DatabaseInitializer();

    try {
      await initializer.createTables();
      initializer.createTriggers();
      await initializer.seedData();

      const isValid = initializer.validateDatabase();
      if (isValid) {
        const stats = initializer.getStats();
        console.log('📊 数据库统计信息:', stats);
        console.log('🎉 数据库初始化完成！');
        console.log('💡 默认管理员账号: admin/admin123');
      }
    } catch (error) {
      console.error('💥 数据库初始化失败:', error);
    } finally {
      initializer.close();
    }
  }

  initDatabase();
}
