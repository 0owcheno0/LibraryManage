# CLAUDE.md - 团队知识库管理工具项目指导

本文件为未来的Claude实例提供完整的项目指导，确保能够高效地协助继续开发此团队知识库管理工具。

## 🎯 项目概述

### 项目基本信息
- **项目名称**: 团队知识库管理工具 (Team Knowledge Base Management Tool)
- **项目类型**: 全栈Web应用
- **开发环境**: macOS 11.7.10 单机开发
- **开发模式**: Claude AI 协助的单人全栈开发
- **项目位置**: `/Users/weichen/Documents/testClass`
- **项目状态**: 设计和规划阶段完成，准备开始代码实现

### 核心功能
1. **文档管理**: 支持多种格式文档的上传、存储、预览、下载
2. **智能搜索**: 基于标题、内容、标签的全文搜索功能
3. **标签系统**: 灵活的标签分类和管理体系
4. **权限控制**: 基于角色的访问控制(RBAC)系统
5. **团队协作**: 文档共享、评论、版本管理功能

### 技术架构
```
┌─────────────────────────────────────────────────────┐
│                  浏览器客户端                        │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS/HTTP
┌─────────────────▼───────────────────────────────────┐
│                前端应用层                           │
│         React + TypeScript + Ant Design           │
└─────────────────┬───────────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────────┐
│                后端服务层                           │
│         Node.js + Express + TypeScript             │
└─────────────────┬───────────────────────────────────┘
                  │ SQL
┌─────────────────▼───────────────────────────────────┐
│                数据存储层                           │
│              SQLite + 文件系统                      │
└─────────────────────────────────────────────────────┘
```

## 📁 项目目录结构

### 当前目录布局
```
/Users/weichen/Documents/testClass/
├── Project/                      # 🎯 项目代码根目录 (待创建)
│   ├── frontend/                 # 前端React应用
│   │   ├── src/
│   │   │   ├── components/       # 通用组件
│   │   │   ├── pages/           # 页面组件
│   │   │   ├── services/        # API服务
│   │   │   ├── hooks/           # 自定义Hook
│   │   │   ├── contexts/        # React Context
│   │   │   ├── types/           # TypeScript类型定义
│   │   │   └── utils/           # 工具函数
│   │   ├── public/              # 静态资源
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   ├── backend/                  # 后端Node.js应用
│   │   ├── src/
│   │   │   ├── controllers/     # 控制器
│   │   │   ├── services/        # 业务逻辑服务
│   │   │   ├── models/          # 数据模型
│   │   │   ├── routes/          # 路由定义
│   │   │   ├── middleware/      # 中间件
│   │   │   ├── database/        # 数据库配置
│   │   │   └── utils/           # 工具函数
│   │   ├── uploads/             # 文件上传目录
│   │   ├── logs/                # 日志文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── database/                 # 数据库文件
│   │   ├── knowledge_base.db    # SQLite数据库文件
│   │   ├── migrations/          # 数据库迁移脚本
│   │   └── seeds/               # 初始数据脚本
│   ├── tests/                    # 测试文件
│   │   ├── unit/                # 单元测试
│   │   ├── integration/         # 集成测试
│   │   ├── e2e/                 # 端到端测试
│   │   └── fixtures/            # 测试数据
│   ├── scripts/                  # 构建和部署脚本
│   ├── docs/                     # 项目内部文档
│   ├── .env.example             # 环境变量示例
│   ├── docker-compose.yml       # Docker配置
│   ├── package.json             # 根级依赖
│   └── README.md                # 项目说明
├── 📋 项目文档 (已完成)
│   ├── 项目题目.md               # 原始项目需求
│   ├── 设计文档/                 # 系统设计文档目录
│   │   ├── 需求分析文档.md       # 功能需求分析
│   │   ├── 系统设计文档.md       # 系统架构设计
│   │   ├── 数据库设计文档.md     # 数据库结构设计
│   │   └── API接口设计文档.md    # RESTful API设计
│   ├── 技术文档/                 # 技术实现文档目录
│   │   ├── 架构设计文档.md       # 技术架构设计
│   │   ├── 部署说明文档.md       # 部署和运维指南
│   │   └── 开发环境配置文档.md   # macOS开发环境配置
│   ├── 项目管理文档/             # 项目管理文档目录
│   │   ├── 开发计划文档.md       # 4周开发计划
│   │   └── 测试计划文档.md       # 测试策略和用例
│   ├── README.md                # 项目总览
│   └── CLAUDE.md                # 本文件 - Claude指导文档
└── .git/                        # Git版本控制
```

**重要说明**: 
- `Project/` 目录是项目代码的根目录，所有实际开发代码都应放在此目录下
- 根目录下的`.md`文件是完整的技术文档，为开发提供指导
- 在生成代码时，确保使用`Project/`目录作为代码根路径

## 🔧 技术栈详情

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite (现代前端构建工具)
- **UI组件库**: Ant Design (企业级UI组件)
- **路由**: React Router v6
- **状态管理**: React Context API + useReducer
- **HTTP客户端**: Axios
- **样式**: CSS Modules + Ant Design主题
- **测试**: Vitest + React Testing Library

### 后端技术栈
- **运行时**: Node.js 16+
- **框架**: Express.js + TypeScript
- **数据库**: SQLite 3.x + better-sqlite3
- **认证**: JWT (JSON Web Tokens)
- **文件处理**: Multer (文件上传)
- **密码加密**: bcryptjs
- **日志**: winston
- **测试**: Jest + Supertest

### 开发工具
- **代码编辑器**: VS Code
- **版本控制**: Git
- **包管理器**: npm
- **API测试**: Postman
- **数据库管理**: DB Browser for SQLite

## 🗄️ 数据库设计

### 核心数据表
```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文档表
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 标签表
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#1890ff',
    description TEXT,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 文档标签关联表
CREATE TABLE document_tags (
    document_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (document_id, tag_id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

### 用户角色权限
- **admin**: 系统管理员，所有权限
- **editor**: 编辑者，可创建、编辑、删除文档
- **viewer**: 查看者，只能查看和下载文档

## 🚀 API接口设计

### 认证相关
```typescript
POST /api/v1/auth/register    // 用户注册
POST /api/v1/auth/login       // 用户登录
POST /api/v1/auth/logout      // 用户登出
GET  /api/v1/auth/me          // 获取当前用户信息
```

### 文档管理
```typescript
GET    /api/v1/documents              // 获取文档列表
POST   /api/v1/documents              // 上传文档
GET    /api/v1/documents/:id          // 获取文档详情
PUT    /api/v1/documents/:id          // 更新文档信息
DELETE /api/v1/documents/:id          // 删除文档
GET    /api/v1/documents/:id/download // 下载文档
```

### 搜索功能
```typescript
GET /api/v1/search           // 全文搜索
GET /api/v1/search/advanced  // 高级搜索
```

### 标签管理
```typescript
GET    /api/v1/tags     // 获取标签列表
POST   /api/v1/tags     // 创建标签
PUT    /api/v1/tags/:id // 更新标签
DELETE /api/v1/tags/:id // 删除标签
```

## 📅 开发计划 (4周 - 2025.09.13 至 2025.10.10)

### Week 1: 基础框架搭建 (2025.09.13-09.19) ✅ 当前阶段
**目标**: 完成项目基础架构和用户认证模块
- [x] macOS开发环境配置
- [x] 技术文档生成完成
- [ ] 项目目录结构初始化
- [ ] 数据库架构和初始化脚本
- [ ] 后端基础框架 (Express + TypeScript)
- [ ] 前端基础框架 (React + Vite + Ant Design)
- [ ] 用户注册/登录功能
- [ ] JWT认证中间件

### Week 2: 核心功能开发 (2025.09.20-09.26)
**目标**: 实现文档管理核心功能
- [ ] 文件上传功能 (支持多种格式)
- [ ] 文档CRUD操作
- [ ] 文档列表和详情页面
- [ ] 基础的前端路由和页面结构
- [ ] API接口完善和测试

### Week 3: 高级功能实现 (2025.09.27-10.03)
**目标**: 实现搜索、标签和权限功能
- [ ] 全文搜索功能
- [ ] 标签系统实现
- [ ] 权限控制和角色管理
- [ ] 用户界面优化
- [ ] 响应式设计

### Week 4: 测试和完善 (2025.10.04-10.10)
**目标**: 系统测试、性能优化和部署准备
- [ ] 完整功能测试
- [ ] 性能优化
- [ ] 用户体验改进
- [ ] 部署脚本和文档

## 🧪 测试策略

### 测试金字塔 (Claude AI 协助)
- **70% 单元测试**: Claude生成组件和函数测试
- **20% 集成测试**: Claude生成API和数据库集成测试
- **10% E2E测试**: Claude生成用户流程测试

### 测试工具配置
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration", 
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### 性能目标 (macOS本地环境)
- 页面加载时间: < 2秒
- API响应时间: < 1秒
- 搜索响应时间: < 1秒
- 文件上传: 10MB文件 < 10秒

## 🛠️ 开发最佳实践

### 代码生成原则
1. **模块化开发**: 每次生成一个完整的功能模块
2. **类型安全**: 使用TypeScript，确保类型定义完整
3. **错误处理**: 完善的错误处理和用户反馈
4. **性能优化**: 考虑懒加载、缓存、分页等优化策略
5. **安全性**: 实现输入验证、SQL注入防护、XSS防护

### 文件组织规范
```typescript
// 统一的导入顺序
import React from 'react';                    // React相关
import { Button, Form } from 'antd';          // UI组件库
import { apiService } from '../services';     // 项目内部模块
import type { User, Document } from '../types'; // 类型定义
```

### API响应格式
```typescript
// 成功响应
{
  success: true,
  data: any,
  message?: string
}

// 错误响应  
{
  success: false,
  error: string,
  code?: string
}
```

## 🔐 安全考虑

### 认证安全
- JWT Token安全存储和刷新机制
- 密码强度验证和bcrypt加密
- 会话管理和自动登出

### 数据安全
- SQL注入防护 (参数化查询)
- XSS攻击防护 (输入验证和输出编码)
- 文件上传安全 (类型验证、大小限制)
- CSRF攻击防护

### 权限控制
- 基于角色的访问控制(RBAC)
- API级别的权限验证
- 前端路由权限保护

## 🚢 部署配置

### 开发环境启动
```bash
# 后端启动
cd Project/backend
npm install
npm run dev

# 前端启动  
cd Project/frontend
npm install
npm run dev

# 数据库初始化
npm run db:init
npm run db:seed
```

### 环境变量配置
```bash
# .env
NODE_ENV=development
PORT=8000
JWT_SECRET=your-secret-key
DB_PATH=./database/knowledge_base.db
UPLOAD_DIR=./uploads
```

## 🤖 Claude AI 协助指南

### 代码生成请求模式
1. **明确需求**: "请生成用户登录页面组件，包含表单验证和API调用"
2. **提供上下文**: 说明现有的技术栈、目录结构、API设计
3. **指定输出**: 明确需要生成的文件路径和功能范围
4. **测试要求**: 是否需要同时生成测试用例

### 常用请求模板
```
请基于以下需求生成代码：
- 功能: [具体功能描述]
- 技术栈: React + TypeScript + Ant Design
- 文件位置: Project/frontend/src/[具体路径]
- API接口: [相关API接口]
- 测试要求: [是否需要测试用例]
```

### 问题解决流程
1. **错误分析**: 提供完整的错误信息和上下文
2. **解决方案**: 获取详细的修复步骤和代码
3. **最佳实践**: 询问性能优化和安全建议
4. **测试验证**: 生成相应的测试用例验证修复

## 📝 当前开发状态

### 已完成 ✅
- [x] 完整的技术文档体系
- [x] 数据库设计和表结构定义
- [x] API接口设计规范
- [x] 系统架构设计
- [x] 测试计划和策略
- [x] 开发环境配置指南
- [x] 4周开发计划制定

### 下一步 🎯
1. **立即开始**: 初始化`Project/`目录结构
2. **数据库初始化**: 创建SQLite数据库和表结构
3. **后端框架**: 搭建Express + TypeScript基础框架
4. **前端框架**: 搭建React + Vite + Ant Design基础框架
5. **用户认证**: 实现注册、登录、JWT认证功能

### 关键提醒 ⚠️
- 所有代码必须放在`Project/`目录下
- 严格遵循TypeScript类型安全
- 遵循已设计的API接口规范
- 每个功能完成后立即编写测试
- 保持代码结构清晰和注释完整

## 📞 支持资源

### 技术文档位置
- 需求分析: `设计文档/需求分析文档.md`
- 系统设计: `设计文档/系统设计文档.md`  
- 数据库设计: `设计文档/数据库设计文档.md`
- API设计: `设计文档/API接口设计文档.md`
- 架构设计: `技术文档/架构设计文档.md`
- 部署说明: `技术文档/部署说明文档.md`
- 开发环境: `技术文档/开发环境配置文档.md`
- 开发计划: `项目管理文档/开发计划文档.md`
- 测试计划: `项目管理文档/测试计划文档.md`

### 开发环境
- macOS 11.7.10
- Node.js 16+
- VS Code
- Git
- SQLite

---

**最后更新**: 2025-09-13  
**文档版本**: v2.0  
**项目阶段**: 准备开始编码实现  
**开发模式**: Claude AI 协助的单机全栈开发