# CLAUDE.md - 团队知识库管理工具项目指导

本文件为未来的Claude实例提供完整的项目指导，确保能够高效地协助继续开发此团队知识库管理工具。

## 🎯 项目概述

### 项目基本信息
- **项目名称**: 团队知识库管理工具 (Team Knowledge Base Management Tool)
- **项目类型**: 全栈Web应用
- **开发环境**: macOS 11.7.10 单机开发
- **开发模式**: Claude AI 协助的单人全栈开发
- **项目位置**: `/Users/weichen/Documents/testClass`
- **项目状态**: 基础架构已完成，正在进行功能模块实现

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
├── Project/                      # 🎯 项目代码根目录 ✅ 已创建
│   ├── frontend/                 # 前端React应用 ✅ 已完成
│   │   ├── src/
│   │   │   ├── components/       # 通用组件 ✅
│   │   │   ├── pages/           # 页面组件 ✅
│   │   │   ├── services/        # API服务 ✅
│   │   │   ├── hooks/           # 自定义Hook ✅
│   │   │   ├── contexts/        # React Context ✅
│   │   │   ├── types/           # TypeScript类型定义 ✅
│   │   │   └── utils/           # 工具函数 ✅
│   │   ├── public/              # 静态资源 ✅
│   │   ├── package.json         # ✅ 已配置完整依赖
│   │   ├── vite.config.ts       # ✅ 开发服务器配置
│   │   └── tsconfig.json        # ✅ TypeScript配置
│   ├── backend/                  # 后端Node.js应用 ✅ 已完成
│   │   ├── src/
│   │   │   ├── controllers/     # 控制器 🔧 部分完成
│   │   │   ├── services/        # 业务逻辑服务 🔧 部分完成
│   │   │   ├── models/          # 数据模型 🔧 部分完成
│   │   │   ├── routes/          # 路由定义 🔧 部分完成
│   │   │   ├── middleware/      # 中间件 ✅ 基础中间件完成
│   │   │   ├── database/        # 数据库配置 ✅ 已完成
│   │   │   └── utils/           # 工具函数 ✅ 基础工具完成
│   │   ├── uploads/             # 文件上传目录 ✅
│   │   ├── logs/                # 日志文件 ✅
│   │   ├── .env.development     # ✅ 开发环境配置
│   │   ├── package.json         # ✅ 完整后端依赖
│   │   └── tsconfig.json        # ✅ TypeScript配置
│   ├── database/                 # 数据库文件 ✅ 已完成
│   │   ├── knowledge_base.db    # ✅ SQLite数据库 (119KB)
│   │   ├── migrations/          # 数据库迁移脚本 ✅
│   │   └── seeds/               # 初始数据脚本 ✅
│   ├── tests/                    # 测试文件 ✅ 结构已建立
│   │   ├── unit/                # 单元测试 📝 待补充
│   │   ├── integration/         # 集成测试 📝 待补充
│   │   ├── e2e/                 # 端到端测试 📝 待补充
│   │   └── fixtures/            # 测试数据 📝 待补充
│   ├── scripts/                  # 构建和部署脚本 ✅
│   │   ├── smart-dev.sh         # ✅ 智能开发启动脚本
│   │   └── dev.sh               # ✅ 基础开发脚本
│   ├── docs/                     # 项目内部文档 ✅
│   ├── .env.example             # ✅ 环境变量示例
│   ├── docker-compose.yml       # ✅ Docker配置
│   ├── package.json             # ✅ 工作空间配置 (Monorepo)
│   ├── start.sh                 # ✅ 快速启动脚本
│   ├── CODE_STYLE.md           # ✅ 代码规范文档
│   ├── CODE_SETUP_REPORT.md    # ✅ 代码配置报告
│   ├── QUICK_START.md          # ✅ 快速启动指南
│   └── README.md                # ✅ 项目说明
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

## 📅 开发计划与进度 (2025.09.13 开始)

### 🏗️ 阶段1: 基础架构搭建 ✅ 已完成 (2025.09.13)
**目标**: 完成项目基础架构和开发环境配置
- [x] macOS开发环境配置 ✅
- [x] 技术文档生成完成 ✅ 
- [x] 项目目录结构初始化 ✅
- [x] 数据库架构和初始化脚本 ✅
- [x] 后端基础框架 (Express + TypeScript) ✅
- [x] 前端基础框架 (React + Vite + Ant Design) ✅
- [x] 开发工具配置 (ESLint + Prettier + Husky) ✅
- [x] 工作空间配置和智能启动脚本 ✅

### 🔐 阶段2: 用户认证系统 🔧 部分完成 (当前阶段)
**目标**: 实现完整的用户认证和权限管理
- [x] JWT认证工具类 ✅
- [x] 认证中间件基础结构 ✅
- [ ] 用户注册API ⏳ 进行中
- [ ] 用户登录API ⏳ 进行中
- [ ] 前端认证页面 ⏳ 进行中
- [ ] 权限控制中间件 📝 待完成

### 📁 阶段3: 文档管理核心 📝 计划中
**目标**: 实现文档上传、存储、查看和管理功能
- [ ] 文件上传API和中间件 📝 待开发
- [ ] 文档CRUD操作API 📝 待开发
- [ ] 文档列表和详情页面 📝 待开发
- [ ] 文件下载和预览功能 📝 待开发
- [ ] 文档权限控制 📝 待开发

### 🔍 阶段4: 搜索和标签系统 📝 计划中
**目标**: 实现智能搜索和标签管理功能
- [ ] 全文搜索API 📝 待开发
- [ ] 高级搜索和过滤 📝 待开发
- [ ] 标签CRUD操作 📝 待开发
- [ ] 标签分类和管理 📝 待开发
- [ ] 搜索结果优化 📝 待开发

### 🎨 阶段5: 用户界面优化 📝 计划中
**目标**: 完善用户体验和界面设计
- [ ] 响应式界面设计 📝 待开发
- [ ] 用户友好的交互体验 📝 待开发
- [ ] 错误处理和状态提示 📝 待开发
- [ ] 性能优化和懒加载 📝 待开发
- [ ] 国际化支持 📝 可选

### 🧪 阶段6: 测试和部署 📝 计划中
**目标**: 完整测试、性能优化和生产部署
- [ ] 单元测试编写 📝 待开发
- [ ] 集成测试和E2E测试 📝 待开发
- [ ] 性能测试和优化 📝 待开发
- [ ] 生产环境部署配置 📝 待开发
- [ ] 文档完善和用户手册 📝 待开发

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

## 📝 当前开发状态 (2025-09-13)

### 已完成 ✅
- [x] 完整的技术文档体系和项目规划
- [x] 项目架构搭建和目录结构建立
- [x] 数据库设计、建立和数据初始化 (SQLite 119KB)
- [x] 前后端基础框架搭建 (React + Express + TypeScript)
- [x] 开发工具链配置 (ESLint, Prettier, Husky)
- [x] 智能开发脚本和快速启动配置
- [x] API接口设计规范和基础中间件
- [x] 工作空间配置和Monorepo管理

### 部分完成 🔧
- [x] 用户认证基础架构 (JWT工具、中间件基础)
- [x] 数据模型定义 (User模型已实现)
- [ ] 认证API完整实现 (注册、登录、登出)
- [ ] 前端认证页面和状态管理
- [ ] 权限控制系统完善

### 下一步优先级 🎯
1. **完成用户认证系统** - 用户注册、登录、JWT认证完整实现
2. **实现文档上传功能** - 文件上传API、存储管理、前端组件
3. **构建文档管理界面** - 文档列表、详情页、CRUD操作
4. **添加搜索和标签功能** - 全文搜索、标签管理、筛选功能
5. **完善权限和安全** - 角色权限、访问控制、安全验证

### 技术栈状态 📊
- **前端**: React 18 + TypeScript + Ant Design + Vite ✅
- **后端**: Node.js + Express + TypeScript ✅  
- **数据库**: SQLite 3.x + better-sqlite3 ✅
- **认证**: JWT + bcryptjs ✅
- **构建工具**: 完整工作空间配置 ✅
- **代码质量**: ESLint + Prettier + Git Hooks ✅

### 快速启动 🚀
```bash
cd Project
./start.sh  # 智能启动脚本，自动处理依赖和服务启动
```

### 关键提醒 ⚠️
- 项目已搭建完整基础架构，可直接进行业务功能开发
- 数据库已初始化，包含完整表结构和测试数据
- 开发环境配置完善，支持热重载和代码自动格式化
- 所有新功能开发应遵循已建立的代码规范和架构模式
- 重要功能完成后需补充相应的单元测试

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
**文档版本**: v3.0  
**项目阶段**: 基础架构完成，正在进行功能模块开发  
**开发模式**: Claude AI 协助的单机全栈开发

## 🔄 版本更新说明

### v3.0 (2025-09-13) - 架构完成版
- ✅ 更新项目实际完成状态，反映真实开发进度
- ✅ 调整开发计划为阶段式推进，更符合实际情况
- ✅ 补充完整的技术栈实现状态和配置信息
- ✅ 添加智能开发脚本和工具链配置说明
- ✅ 明确当前阶段任务和下一步优先级

### v2.0 (2025-09-13) - 规划完成版
- 完整的项目设计文档和技术架构规划
- 详细的4周开发计划和里程碑设置
- 全面的技术栈选型和接口设计

### v1.0 (项目初期) - 需求分析版
- 项目基础需求分析和目标确定
- 初步的技术方案调研和选型