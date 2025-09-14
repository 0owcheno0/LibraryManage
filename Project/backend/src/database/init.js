const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// 创建数据库目录
const dbDir = path.join(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 连接数据库
const dbPath = path.join(dbDir, 'knowledge_base.db');
const db = new sqlite3.Database(dbPath);

console.log('开始初始化数据库...');

// 使用事务确保数据一致性
db.serialize(() => {
  // 启用外键约束和其他配置
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');

  // 创建用户表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      avatar_url VARCHAR(255),
      role_id INTEGER DEFAULT 3,
      status INTEGER DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    err => {
      if (err) console.error('创建用户表失败:', err);
      else console.log('用户表创建成功');
    }
  );

  // 创建角色表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    err => {
      if (err) console.error('创建角色表失败:', err);
      else console.log('角色表创建成功');
    }
  );

  // 创建文档表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER,
      file_type VARCHAR(50),
      mime_type VARCHAR(100),
      thumbnail_path VARCHAR(500),
      content_text TEXT,
      created_by INTEGER NOT NULL,
      visibility INTEGER DEFAULT 2,
      download_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
    err => {
      if (err) console.error('创建文档表失败:', err);
      else console.log('文档表创建成功');
    }
  );

  // 创建标签表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) UNIQUE NOT NULL,
      color VARCHAR(7) DEFAULT '#1890ff',
      description TEXT,
      created_by INTEGER,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    err => {
      if (err) console.error('创建标签表失败:', err);
      else console.log('标签表创建成功');
    }
  );

  // 创建文档标签关联表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS document_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE(document_id, tag_id)
    )
  `,
    err => {
      if (err) console.error('创建文档标签关联表失败:', err);
      else console.log('文档标签关联表创建成功');
    }
  );

  // 创建权限表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_type VARCHAR(50) NOT NULL,
      resource_id INTEGER,
      user_id INTEGER NOT NULL,
      permission_type VARCHAR(20) NOT NULL,
      granted_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `,
    err => {
      if (err) console.error('创建权限表失败:', err);
      else console.log('权限表创建成功');
    }
  );

  // 创建系统配置表
  db.run(
    `
    CREATE TABLE IF NOT EXISTS system_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key VARCHAR(100) UNIQUE NOT NULL,
      config_value TEXT,
      description TEXT,
      category VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    err => {
      if (err) console.error('创建系统配置表失败:', err);
      else console.log('系统配置表创建成功');
    }
  );

  console.log('数据表创建完成');

  // 插入初始角色数据
  const roleStmt = db.prepare(
    'INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)'
  );
  roleStmt.run(1, 'admin', '系统管理员', JSON.stringify(['*']));
  roleStmt.run(
    2,
    'editor',
    '编辑者',
    JSON.stringify(['document:read', 'document:write', 'document:delete'])
  );
  roleStmt.run(3, 'viewer', '查看者', JSON.stringify(['document:read']));
  roleStmt.finalize();

  console.log('角色数据插入完成');

  // 插入管理员用户
  const saltRounds = 10;
  const adminPassword = bcrypt.hashSync('admin123', saltRounds);

  const userStmt = db.prepare(
    'INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role_id, status) VALUES (?, ?, ?, ?, ?, ?)'
  );
  userStmt.run('admin', 'admin@example.com', adminPassword, '系统管理员', 1, 1);
  userStmt.finalize();

  console.log('管理员用户创建完成');

  // 插入基础标签
  const tagStmt = db.prepare(
    'INSERT OR IGNORE INTO tags (name, color, description) VALUES (?, ?, ?)'
  );
  tagStmt.run('技术文档', '#1890ff', '技术相关文档');
  tagStmt.run('产品文档', '#52c41a', '产品相关文档');
  tagStmt.run('API文档', '#722ed1', 'API接口文档');
  tagStmt.run('用户手册', '#fa8c16', '用户使用手册');
  tagStmt.run('项目文档', '#eb2f96', '项目相关文档');
  tagStmt.finalize();

  console.log('基础标签创建完成');

  // 创建索引以提高查询性能
  db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by)');
  db.run('CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title)');
  db.run('CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_document_tags_document ON document_tags(document_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_permissions_user ON permissions(user_id)');
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource_type, resource_id)'
  );

  console.log('索引创建完成');

  // 验证数据库结构
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('查询表列表失败:', err);
    } else {
      console.log(
        '数据库表列表:',
        tables.map(t => t.name)
      );
    }

    // 验证数据
    db.get('SELECT COUNT(*) as count FROM users', (err, userCount) => {
      if (!err) console.log(`用户数量: ${userCount.count}`);
    });

    db.get('SELECT COUNT(*) as count FROM roles', (err, roleCount) => {
      if (!err) console.log(`角色数量: ${roleCount.count}`);
    });

    db.get('SELECT COUNT(*) as count FROM tags', (err, tagCount) => {
      if (!err) console.log(`标签数量: ${tagCount.count}`);
    });

    // 关闭数据库连接
    db.close(err => {
      if (err) {
        console.error('关闭数据库失败:', err);
      } else {
        console.log('数据库初始化完成！');
        console.log(`数据库位置: ${dbPath}`);
        console.log('默认管理员账号: admin / admin123');
      }
    });
  });
});
