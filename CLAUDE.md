# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目信息

这是一个团队知识库管理工具项目：
- 功能：文档上传、搜索、标签化，支持团队共享文档和知识
- 架构：三层架构（WebApp + WebService + DB）
- 数据库：SQLite
- 权限：用户管理和浏览权限分配

## 项目架构

### 目录结构
```
/
├── frontend/     # Web前端应用
├── backend/      # Web服务API层
├── database/     # SQLite数据库文件
└── docs/         # 项目文档
```

### 技术要求
- 三层架构：前端展示层 + 后端服务层 + 数据库层
- 数据库使用SQLite
- 支持用户认证和权限控制