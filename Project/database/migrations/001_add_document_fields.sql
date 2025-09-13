-- 添加文档上传功能所需的字段
-- Migration: 001_add_document_fields.sql

-- 添加文件哈希字段用于去重
ALTER TABLE documents ADD COLUMN file_hash VARCHAR(32);

-- 添加文件扩展名字段
ALTER TABLE documents ADD COLUMN file_extension VARCHAR(10);

-- 添加友好的文件类型名称
ALTER TABLE documents ADD COLUMN friendly_type VARCHAR(50);

-- 添加格式化的文件大小字符串
ALTER TABLE documents ADD COLUMN formatted_size VARCHAR(20);

-- 添加公开/私有字段 (兼容现有的visibility字段)
ALTER TABLE documents ADD COLUMN is_public INTEGER DEFAULT 0;

-- 更新字段映射 (将upload_user_id映射为created_by)
ALTER TABLE documents ADD COLUMN created_by INTEGER;

-- 复制数据从upload_user_id到created_by
UPDATE documents SET created_by = upload_user_id WHERE created_by IS NULL;

-- 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_file_extension ON documents(file_extension);