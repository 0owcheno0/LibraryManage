# 团队知识库管理工具

基于React + Node.js + SQLite的现代化团队知识库管理系统，提供文档上传、搜索、标签化管理和权限控制等完整功能。支持黑白主题切换，颜色配置统一管理，具备完整的响应式设计和现代化用户体验。

## 核心功能

- **文档管理**: 支持多种格式文件上传、下载、在线预览
- **标签系统**: 多级标签分类，便于文档组织和检索
- **全文搜索**: 支持文档内容和元数据的全文搜索
- **权限控制**: 基于角色的访问控制（RBAC），支持文档私有/公开设置
- **文档共享**: 支持文档权限管理和分享链接生成
- **用户管理**: 完整的用户资料管理、角色分配和状态控制
- **用户认证**: JWT Token认证，支持用户注册、登录和会话管理
- **主题切换**: 支持浅色/深色主题切换，提供良好的用户体验
- **响应式设计**: 适配不同屏幕尺寸，支持移动端访问

## 项目结构

```
Project/
├── frontend/                      # 前端React应用
│   ├── src/
│   │   ├── components/            # 可复用UI组件
│   │   │   ├── common/            # 通用组件（如PrivateRoute等）
│   │   │   ├── layout/            # 布局组件（如MainLayout等）
│   │   │   ├── DocumentUpload.tsx # 文档上传组件
│   │   │   ├── DocumentActions.tsx# 文档操作组件
│   │   │   ├── TagSelector.tsx    # 标签选择器组件
│   │   │   ├── ThemeSwitcher.tsx  # 主题切换组件
│   │   │   ├── SearchInput.tsx    # 搜索输入组件
│   │   │   └── ...                # 其他业务组件
│   │   ├── pages/                 # 页面组件
│   │   │   ├── auth/              # 认证相关页面
│   │   │   │   ├── LoginPage.tsx  # 登录页面
│   │   │   │   └── RegisterPage.tsx# 注册页面
│   │   │   ├── documents/         # 文档管理页面
│   │   │   │   ├── DocumentListPage.tsx   # 文档列表页面
│   │   │   │   ├── DocumentDetailPage.tsx # 文档详情页面
│   │   │   │   ├── TeamDocumentsPage.tsx  # 团队文档页面
│   │   │   │   ├── DocumentPermissions.tsx# 文档权限管理页面
│   │   │   │   ├── DocumentList.tsx       # 文档列表组件
│   │   │   │   └── TeamDocumentList.tsx   # 团队文档列表组件
│   │   │   ├── search/            # 搜索页面
│   │   │   │   └── SearchPage.tsx # 搜索页面
│   │   │   ├── settings/          # 设置页面
│   │   │   │   └── SettingsPage.tsx       # 设置页面
│   │   │   ├── tags/              # 标签管理页面
│   │   │   │   └── TagManagementPage.tsx  # 标签管理页面
│   │   │   ├── user/              # 用户相关页面
│   │   │   │   └── ProfilePage.tsx        # 用户资料页面
│   │   │   ├── admin/             # 管理员页面
│   │   │   │   ├── UserManagement.tsx     # 用户管理组件
│   │   │   │   └── UserManagementPage.tsx # 用户管理页面
│   │   │   ├── DashboardPage.tsx  # 仪表板页面
│   │   │   ├── ThemeTestPage.tsx  # 主题测试页面
│   │   │   └── PermissionDemo.tsx # 权限演示页面
│   │   ├── services/              # API服务层
│   │   │   ├── api/               # API客户端配置
│   │   │   │   └── request.ts     # Axios请求封装
│   │   │   ├── auth.ts            # 认证相关服务
│   │   │   ├── document.ts        # 文档相关服务
│   │   │   ├── permission.ts      # 权限相关服务
│   │   │   ├── downloadService.ts # 下载服务
│   │   │   └── search.ts          # 搜索服务
│   │   ├── contexts/              # 状态管理（React Context）
│   │   │   ├── AuthContext.tsx    # 认证状态管理
│   │   │   └── ThemeContext.tsx   # 主题状态管理
│   │   ├── hooks/                 # 自定义Hook
│   │   │   ├── useDebounce.ts     # 防抖Hook
│   │   │   └── usePermission.ts   # 权限检查Hook
│   │   ├── config/                # 配置文件
│   │   │   └── theme.ts           # 主题配置文件
│   │   ├── styles/                # 样式文件
│   │   │   ├── index.css          # 全局样式
│   │   │   ├── theme.css          # 主题样式
│   │   │   └── search.css         # 搜索样式
│   │   ├── types/                 # TypeScript类型定义
│   │   │   ├── document.ts        # 文档相关类型定义
│   │   │   └── index.ts           # 通用类型定义
│   │   ├── utils/                 # 工具函数
│   │   │   ├── errorHandler.ts    # 错误处理工具
│   │   │   └── highlightText.ts   # 文本高亮工具
│   │   ├── App.tsx                # 应用根组件
│   │   └── main.tsx               # 应用入口文件
│   ├── public/                    # 静态资源
│   └── vite.config.ts             # Vite配置文件
├── backend/                       # 后端Node.js应用
│   ├── src/
│   │   ├── routes/                # API路由
│   │   │   ├── auth.ts            # 认证相关路由
│   │   │   ├── documents.ts       # 文档相关路由
│   │   │   ├── permissions.ts     # 权限相关路由
│   │   │   ├── search.ts          # 搜索相关路由
│   │   │   ├── shared.ts          # 分享链接路由
│   │   │   ├── tags.ts            # 标签相关路由
│   │   │   └── users.ts           # 用户相关路由
│   │   ├── services/              # 业务逻辑层
│   │   │   ├── fileService.ts     # 文件处理服务
│   │   │   └── searchService.ts   # 搜索服务
│   │   ├── dao/                   # 数据访问对象
│   │   │   ├── documentDao.ts     # 文档数据访问对象
│   │   │   ├── documentTagDao.ts  # 文档标签数据访问对象
│   │   │   ├── permissionDao.ts   # 权限数据访问对象
│   │   │   ├── shareLinkDao.ts    # 分享链接数据访问对象
│   │   │   ├── tagDao.ts          # 标签数据访问对象
│   │   │   └── userDao.ts         # 用户数据访问对象
│   │   ├── models/                # 数据模型
│   │   │   ├── Document.ts        # 文档模型
│   │   │   ├── Role.ts            # 角色模型
│   │   │   └── User.ts            # 用户模型
│   │   ├── middleware/            # 中间件
│   │   │   ├── auth.ts            # 认证中间件
│   │   │   ├── errorHandler.ts    # 错误处理中间件
│   │   │   ├── notFoundHandler.ts # 404处理中间件
│   │   │   ├── permission.ts      # 权限检查中间件
│   │   │   ├── responseHandler.ts # 响应处理中间件
│   │   │   └── upload.ts          # 文件上传中间件
│   │   ├── database/              # 数据库相关
│   │   │   ├── connection.ts      # 数据库连接
│   │   │   └── schema.sql         # 数据库结构定义
│   │   ├── utils/                 # 工具函数
│   │   │   └── jwt.ts             # JWT工具函数
│   │   ├── validators/            # 数据验证器
│   │   │   └── auth.ts            # 认证数据验证器
│   │   ├── app.ts                 # Express应用配置
│   │   └── index.ts               # 应用入口文件
│   ├── uploads/                   # 上传文件存储目录
│   └── logs/                      # 日志文件目录
├── database/                      # 数据库文件
│   ├── knowledge_base.db          # SQLite数据库文件
│   └── migrations/                # 数据库迁移脚本
├── scripts/                       # 构建和部署脚本
│   ├── smart-dev.sh               # 智能开发启动脚本
│   ├── dev.sh                     # 开发环境启动脚本
│   └── build.sh                   # 生产环境构建脚本
├── docs/                          # 项目文档
│   ├── API用户管理接口文档.md     # 用户管理API文档
│   ├── API文档共享机制接口文档.md # 文档共享机制API文档
│   └── ...                        # 其他文档
└── docker-compose.yml             # Docker部署配置
```

## 快速开始

### 智能启动（推荐）

```bash
# 自动检测端口、健康检查、自动打开浏览器
npm run dev:smart
```

### 手动启动

```bash
# 启动后端服务
cd backend
npm install
npm run dev

# 启动前端应用
cd frontend
npm install
npm run dev
```

### 数据库初始化

```bash
# 初始化数据库
npm run db:init

# 重置数据库（慎用）
npm run db:reset
```

### 构建生产版本

```bash
# 构建前后端
npm run build

# 构建前端
npm run build:frontend

# 构建后端
npm run build:backend
```

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: Ant Design 5.x
- **状态管理**: React Context + useReducer
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **测试**: Vitest + React Testing Library

### 后端
- **框架**: Node.js + Express + TypeScript
- **数据库**: SQLite 3.x (Better-SQLite3)
- **ORM**: 原生SQL + 自定义DAO
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **日志**: Winston
- **安全**: Helmet, CORS, Compression
- **测试**: Jest + Supertest

### 开发工具
- **代码质量**: ESLint + Prettier + Husky
- **类型检查**: TypeScript
- **部署**: Docker Compose
- **监控**: 内置健康检查和日志

## 核心特性详解

### 1. 主题系统
- 支持浅色/深色主题切换
- 颜色配置统一管理（[frontend/src/config/theme.ts](frontend/src/config/theme.ts)）
- 主题状态持久化存储
- Ant Design组件主题适配
- CSS变量动态切换

### 2. 权限系统
- 基于角色的访问控制（RBAC）
- 三种预设角色：管理员、编辑者、查看者
- 文档级别的权限控制（私有/公开）
- 细粒度的权限检查Hook（[frontend/src/hooks/usePermission.ts](frontend/src/hooks/usePermission.ts)）
- 后端权限中间件验证

### 3. 文档管理
- 多格式文件支持（PDF、Word、Excel、PPT、图片等）
- 文件重复检测（基于MD5哈希）
- 文件元数据提取和存储
- 文档标签分类管理
- 文档浏览和下载统计

### 4. 文档共享机制
- **文档权限管理**: 基于`permissions表`实现细粒度权限控制
  - 文档可见性设置: is_public字段(0=私有,1=公开)
  - 文档所有者: created_by字段，拥有全部权限
  - 公开文档: 任何用户可查看和下载
  - 私有文档: 仅所有者和特定的授权用户可访问
- **权限管理API**:
  - `POST /api/v1/documents/{id}/permissions` - 添加用户权限
  - `DELETE /api/v1/documents/{id}/permissions/{userId}` - 移除用户权限
  - `GET /api/v1/documents/{id}/permissions` - 获取文档权限列表
  - `PUT /api/v1/documents/{id}/public` - 设置文档公开/私有状态
- **分享链接功能**:
  - 分享链接生成: 基于JWT的时效性分享链接
  - `POST /api/v1/documents/{id}/share` - 生成分享链接
  - `GET /api/v1/shared/{shareToken}` - 通过分享链接访问文档
  - 分享设置: 有效期、访问密码、下载次数限制
- **权限管理界面**: `src/pages/documents/DocumentPermissions.tsx`
  - 用户选择器: 搜索用户名或邮箱
  - 权限设置: 只读/读写/管理权限
  - 权限列表: 显示已授权用户和权限级别
  - 分享链接: 生成、复制、管理分享链接
- **团队文档展示**: 
  - 我的文档: 用户创建的文档
  - 共享给我的: 其他用户分享的文档
  - 公开文档: 所有公开可访问的文档

### 5. 搜索功能
- 全文搜索支持
- 多条件筛选（按标签、文件类型、创建者等）
- 搜索结果高亮显示
- 搜索历史记录

### 6. 标签系统
- 多彩标签分类
- 标签使用统计
- 文档标签关联管理
- 标签批量操作

### 7. 用户管理系统
- 个人资料管理（姓名、邮箱、头像）
- 密码修改（验证旧密码）
- 头像上传（支持图片格式）
- 管理员用户管理（仅admin角色）
- 用户列表查看和搜索
- 用户角色分配（admin/editor/viewer）
- 用户状态管理（启用/禁用）
- 用户删除（软删除）

## 开发规范

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier代码规范
- 编写单元测试和集成测试
- 使用Git进行版本控制
- 遵循约定式提交（Conventional Commits）
- 使用Husky进行Git钩子检查

## 环境要求

- Node.js 18+
- npm 8+
- macOS 11.7.10 或 Linux/Windows

## 部署

### Docker部署

```bash
# 使用Docker Compose一键部署
docker-compose up -d
```

### 生产环境构建

```bash
# 使用构建脚本
./scripts/build.sh
```

## 项目文档

- [架构设计文档](../技术文档/架构设计文档.md)
- [数据库设计文档](../设计文档/数据库设计文档.md)
- [API接口文档](../设计文档/API接口设计文档.md)
- [用户管理API文档](docs/API用户管理接口文档.md)
- [文档共享机制API文档](docs/API文档共享机制接口文档.md)
- [开发规范](CODE_STYLE.md)
- [权限系统实现说明](docs/权限系统实现说明.md)