-- 团队知识库管理系统数据库架构
-- 启用外键约束
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    role_id INTEGER DEFAULT 3,
    status INTEGER DEFAULT 1,  -- 1: 正常, 0: 禁用
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT,  -- JSON格式存储权限列表
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建文档表
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
    content_text TEXT,  -- 用于全文搜索的文档内容
    upload_user_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT 0,  -- 0: 私有, 1: 公开
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',  -- active, deleted, archived
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建标签表
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
);

-- 创建文档标签关联表
CREATE TABLE IF NOT EXISTS document_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(document_id, tag_id)
);

-- 创建权限表
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

-- 创建分享链接表
CREATE TABLE IF NOT EXISTS share_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME,
    password_hash VARCHAR(255),
    download_limit INTEGER,
    download_count INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    category VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_user ON documents(upload_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_document_tags_document ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_document ON share_links(document_id);

-- 插入初始角色数据
INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES 
(1, 'admin', '系统管理员', '["*"]'),
(2, 'editor', '编辑者', '["document:read", "document:write", "document:delete", "tag:read", "tag:write"]'),
(3, 'viewer', '查看者', '["document:read", "tag:read"]');

-- 插入管理员用户 (密码为 admin123 的 bcrypt 哈希值)
INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role_id, status) VALUES 
('admin', 'admin@example.com', '$2b$10$sK7zHZ8Z8Z8Z8Z8Z8Z8Z8e8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', '系统管理员', 1, 1);

-- 插入基础标签
INSERT OR IGNORE INTO tags (name, color, description) VALUES 
('技术文档', '#1890ff', '技术相关文档'),
('产品文档', '#52c41a', '产品相关文档'),
('API文档', '#722ed1', 'API接口文档'),
('用户手册', '#fa8c16', '用户使用手册'),
('项目文档', '#eb2f96', '项目相关文档'),
('培训资料', '#13c2c2', '培训相关资料'),
('规范标准', '#f5222d', '规范和标准文档'),
('会议记录', '#52c41a', '会议纪要和记录');

-- 插入系统配置
INSERT OR IGNORE INTO system_configs (config_key, config_value, description, category) VALUES 
('app_name', '团队知识库管理系统', '应用名称', 'basic'),
('max_file_size', '52428800', '最大文件上传大小 (50MB)', 'upload'),
('allowed_file_types', '["pdf","doc","docx","ppt","pptx","xls","xlsx","txt","md","jpg","jpeg","png","gif"]', '允许上传的文件类型', 'upload'),
('default_visibility', '2', '默认文档可见性 (1:私有, 2:团队, 3:公开)', 'document'),
('enable_comments', 'true', '是否启用文档评论功能', 'feature'),
('enable_download_stats', 'true', '是否启用下载统计', 'feature');