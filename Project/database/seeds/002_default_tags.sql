-- 插入默认标签数据
-- 创建时间: 2025-09-14

-- 插入系统默认标签
INSERT OR IGNORE INTO tags (id, name, color, description, created_by, usage_count) VALUES 
  (1, '重要', '#ff4d4f', '重要文档标签', 1, 0),
  (2, '工作', '#1890ff', '工作相关文档', 1, 0),
  (3, '项目', '#52c41a', '项目文档', 1, 0),
  (4, '会议', '#faad14', '会议记录和文档', 1, 0),
  (5, '技术', '#722ed1', '技术相关文档', 1, 0),
  (6, '设计', '#eb2f96', '设计文档和资料', 1, 0),
  (7, '测试', '#13c2c2', '测试相关文档', 1, 0),
  (8, '文档', '#fa8c16', '一般文档分类', 1, 0);

-- 更新标签ID序列
UPDATE sqlite_sequence SET seq = 8 WHERE name = 'tags';