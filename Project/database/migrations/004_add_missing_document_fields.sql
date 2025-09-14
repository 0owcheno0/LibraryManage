-- 添加缺失的文档字段
-- 创建时间: 2025-09-14

-- 添加文件扩展名字段
ALTER TABLE documents ADD COLUMN file_extension VARCHAR(10) DEFAULT '';

-- 添加友好类型字段
ALTER TABLE documents ADD COLUMN friendly_type VARCHAR(50) DEFAULT '';

-- 添加格式化大小字段
ALTER TABLE documents ADD COLUMN formatted_size VARCHAR(20) DEFAULT '';

-- 添加缩略图路径字段（可选）
ALTER TABLE documents ADD COLUMN thumbnail_path VARCHAR(500) DEFAULT NULL;

-- 添加内容文本字段（用于全文搜索）
ALTER TABLE documents ADD COLUMN content_text TEXT DEFAULT NULL;

-- 更新现有记录的默认值
UPDATE documents SET 
  file_extension = CASE 
    WHEN mime_type LIKE 'image/%' THEN 'image'
    WHEN mime_type LIKE '%pdf%' THEN 'pdf'
    WHEN mime_type LIKE '%word%' THEN 'doc'
    WHEN mime_type LIKE '%text%' THEN 'txt'
    ELSE 'file'
  END,
  friendly_type = CASE 
    WHEN mime_type LIKE 'image/%' THEN '图片'
    WHEN mime_type LIKE '%pdf%' THEN 'PDF文档'
    WHEN mime_type LIKE '%word%' THEN 'Word文档'
    WHEN mime_type LIKE '%text%' THEN '文本文件'
    ELSE '文件'
  END,
  formatted_size = CASE 
    WHEN file_size < 1024 THEN file_size || ' B'
    WHEN file_size < 1024*1024 THEN ROUND(file_size/1024.0, 1) || ' KB'
    WHEN file_size < 1024*1024*1024 THEN ROUND(file_size/1024.0/1024.0, 1) || ' MB'
    ELSE ROUND(file_size/1024.0/1024.0/1024.0, 1) || ' GB'
  END
WHERE file_extension = '' OR file_extension IS NULL;