# 团队知识库管理工具

<div align="center">

![知识库管理工具](https://img.shields.io/badge/Knowledge-Base-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=flat-square&logo=sqlite)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.9-0170FE?style=flat-square&logo=antdesign)

一个现代化的团队知识库管理平台，支持文档上传、智能搜索、标签化管理和权限控制。
基于最新技术栈构建，提供流畅的开发体验和卓越的用户体验。

[快速开始](#-快速开始) | [开发指南](#-开发指南) | [技术架构](#-技术架构) | [部署指南](#-部署指南)

</div>

## ✨ 特性

- 📁 **文档管理** - 支持多种文件格式上传、预览和下载
- 🔍 **智能搜索** - 基于SQLite全文搜索和高级筛选功能
- 🏷️ **标签系统** - 灵活的标签分类和管理，支持标签云显示
- 👥 **团队协作** - 文档共享、评论和权限控制
- 🔐 **权限管理** - 基于角色的访问控制(RBAC)，支持管理员、编辑者、查看者角色
- 📱 **响应式设计** - 完全支持桌面端和移动端访问
- 🚀 **高性能** - 基于现代技术栈构建，支持热重载和快速响应
- 🔧 **易部署** - 支持Docker容器化部署和传统部署，内置智能开发脚本
- 🚀 **智能开发** - 自动端口检测、一键启动、自动打开浏览器
- ⚙️ **代码规范** - 集成ESLint、Prettier、Husky，保证代码质量

## 🏗️ 技术架构

### 前端技术栈
- **React 18.2** - 现代化用户界面框架，支持并发渲染
- **TypeScript 5.3+** - 类型安全的JavaScript超集
- **Ant Design 5.9** - 企业级UI组件库，提供丰富的组件
- **Vite 5.4** - 新一代前端构建工具，极速热重载
- **React Router 6** - 前端路由管理，支持程序式导航
- **Axios** - HTTP请求库，集成拦截器和错误处理

### 后端技术栈
- **Node.js 18+** - 服务端 JavaScript 运行环境
- **Express 4.18** - 简洁灵活的Web应用框架
- **TypeScript 5.3+** - 服务端类型安全开发
- **Better-SQLite3** - 高性能SQLite数据库驱动
- **JWT** - JSON Web Token 身份认证机制
- **Bcrypt** - 密码加密和哈希处理
- **Multer** - 文件上传中间件
- **Winston** - 日志管理和记录

### 架构设计
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

## 🚀 快速开始

### 系统要求

- **Node.js** 18.x 或以上版本
- **npm** 8.x 或以上版本
- **内存** 4GB+ 
- **磁盘空间** 2GB+ 可用空间
- **操作系统** macOS 11.0+ / Windows 10+ / Ubuntu 18.04+

### 智能一键启动（推荐）

使用内置的智能开发脚本，提供最佳的开发体验：

```bash
# 1. 进入项目目录
cd Project

# 2. 一键启动智能开发环境
./start.sh

# 或者使用 npm 命令
npm run dev:smart
```

智能脚本会自动：
- ✅ 检查并安装依赖
- ✅ 检测可用端口（默认 3000/8000）
- ✅ 初始化SQLite数据库
- ✅ 启动前后端服务
- ✅ 等待服务健康检查
- ✅ 自动打开浏览器调试页面

启动成功后会自动打开：
- 🌐 **前端应用**: http://localhost:3000
- ⚡ **后端 API**: http://localhost:8000
- 💚 **健康棄查**: http://localhost:8000/api/v1/health

### 手动安装步骤

如果你喜欢手动控制每个步骤：

```bash
# 1. 克隆项目
# git clone <repository-url>
cd Project

# 2. 安装所有依赖
npm run install:all

# 3. 初始化数据库
npm run db:init

# 4. 启动开发服务器
npm run dev
```

### 默认管理员账号

数据库初始化后，会自动创建管理员账号：

- **用户名**: `admin@example.com`
- **密码**: `admin123`
- **角色**: 管理员

### Docker 一键部署

使用Docker Compose快速部署整个应用栈：

```bash
# 使用Docker Compose启动
cd Project
docker-compose up -d

# 或者手动构建镜像
docker build -t knowledge-base .
docker run -d \
  --name knowledge-base \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/uploads:/app/uploads \
  knowledge-base
```

服务启动后访问 http://localhost:3000

## 📖 使用指南

### 基本功能

#### 📁 文档上传
1. 点击"上传文档"按钮
2. 选择文件并填写标题、描述
3. 添加相关标签
4. 设置访问权限
5. 点击上传完成

#### 🔍 搜索文档
- **快速搜索**：在顶部搜索框输入关键词
- **高级搜索**：使用筛选条件精确查找
- **标签搜索**：点击标签快速定位相关文档

#### 👥 权限管理
- **个人文档**：仅创建者可访问
- **团队共享**：团队成员可查看
- **公开文档**：所有用户可访问

### 高级功能

#### 🏷️ 标签管理
```
技术文档
├── API文档
├── 架构设计
└── 代码规范

产品文档
├── 需求文档
├── 原型设计
└── 用户手册
```

#### 💬 协作功能
- 文档评论和讨论
- 版本历史记录
- 收藏和分享
- 下载统计

## 🛠️ 开发指南

### 开发环境配置

详细的开发环境配置请参考 [QUICK_START.md](./Project/QUICK_START.md) 和 [开发环境配置文档](./技术文档/开发环境配置文档.md)。

#### 智能开发模式

使用内置的智能开发脚本，享受最佳开发体验：

```bash
# 进入项目目录
cd Project

# 使用智能启动脚本
./start.sh

# 支持的参数
./start.sh --no-browser  # 禁用自动打开浏览器
./start.sh --debug       # 启用详细调试信息
./start.sh --help        # 显示帮助信息
```

智能脚本功能：
- ✨ 自动检测并选择可用端口
- ✨ 服务健康检查，确保服务正常启动
- ✨ 自动打开浏览器调试页面
- ✨ 彩色终端输出和进度提示
- ✨ 跨平台支持（macOS/Linux/Windows）

#### 传统开发模式

```bash
# 安装所有依赖
npm run install:all

# 初始化数据库
npm run db:init

# 启动前后端服务（同时启动）
npm run dev

# 或者分别启动
npm run dev:frontend  # 仅启动前端（端口 3000）
npm run dev:backend   # 仅启动后端（端口 8000）
```

### 项目结构

```
testClass/                    # 团队知识库管理工具项目根目录
├── Project/                  # 主要开发代码目录
│   ├── frontend/            # 前端 React + TypeScript + Vite 应用
│   │   ├── src/
│   │   │   ├── components/  # 通用组件和业务组件
│   │   │   ├── pages/       # 页面组件（登录、文档管理等）
│   │   │   ├── contexts/    # React 上下文（身份认证等）
│   │   │   ├── hooks/       # 自定义 Hook
│   │   │   ├── services/    # API 服务封装
│   │   │   ├── types/       # TypeScript 类型定义
│   │   │   └── utils/       # 工具函数
│   │   ├── public/          # 静态资源
│   │   ├── package.json     # 前端依赖配置
│   │   └── vite.config.ts   # Vite 构建配置
│   ├── backend/             # 后端 Node.js + Express + TypeScript 服务
│   │   ├── src/
│   │   │   ├── controllers/ # API 控制器
│   │   │   ├── services/    # 业务逻辑服务
│   │   │   ├── models/      # 数据模型和数据库操作
│   │   │   ├── routes/      # 路由定义
│   │   │   ├── middleware/  # 中间件（认证、日志等）
│   │   │   ├── database/    # 数据库连接和配置
│   │   │   └── utils/       # 工具函数
│   │   ├── uploads/         # 文件上传目录
│   │   └── package.json     # 后端依赖配置
│   ├── scripts/             # 构建和部署脚本
│   │   ├── smart-dev.sh     # 智能开发启动脚本
│   │   └── dev.sh           # 传统开发脚本
│   ├── database/            # SQLite 数据库文件目录
│   ├── start.sh             # 快速启动入口脚本
│   ├── QUICK_START.md       # 快速开始指南
│   ├── package.json         # 工作空间配置
│   └── docker-compose.yml   # Docker 编排配置
├── 设计文档/                 # 项目设计文档
│   ├── 需求分析文档.md
│   ├── 系统设计文档.md
│   ├── 数据库设计文档.md
│   └── API接口设计文档.md
├── 技术文档/                 # 技术实现文档
│   ├── 架构设计文档.md
│   ├── 开发环境配置文档.md
│   └── 部署说明文档.md
├── 项目管理文档/             # 项目管理相关
│   ├── 开发计划文档.md
│   └── 测试计划文档.md
├── .eslintrc.cjs            # ESLint 代码质量规范
├── .prettierrc.cjs          # Prettier 代码格式化规范
├── .editorconfig            # 编辑器配置
└── README.md                # 项目说明文档
```

### 代码规范和工具链

项目使用了完整的代码质量保证工具链：

```bash
# 代码质量检查
npm run code:check    # 运行 ESLint 和 Prettier 检查
npm run lint          # 仅运行 ESLint 检查
npm run format:check  # 仅检查代码格式

# 自动修复
npm run code:fix     # 自动修复 ESLint 和 Prettier 问题
npm run lint:fix     # 自动修复 ESLint 问题
npm run format       # 自动格式化代码

# Git Hooks 自动检查
# 提交时自动运行 lint-staged
# 推送时自动运行代码检查
```

### API 接口

主要API接口：

```typescript
// 用户认证
POST /api/v1/auth/login      // 用户登录
POST /api/v1/auth/register   // 用户注册
POST /api/v1/auth/logout     // 用户登出

// 文档管理
GET    /api/v1/documents     // 获取文档列表
POST   /api/v1/documents     // 上传文档
GET    /api/v1/documents/:id // 获取文档详情
PUT    /api/v1/documents/:id // 更新文档
DELETE /api/v1/documents/:id // 删除文档

// 搜索功能
GET    /api/v1/search        // 搜索文档
POST   /api/v1/search/advanced // 高级搜索

// 标签管理
GET    /api/v1/tags          // 获取标签列表
POST   /api/v1/tags          // 创建标签
PUT    /api/v1/tags/:id      // 更新标签
DELETE /api/v1/tags/:id      // 删除标签
```

完整的API文档请参考 [API接口设计文档](./设计文档/API接口设计文档.md)。

### 测试

``bash
# 运行所有测试
npm test

# 运行前端测试
cd frontend && npm test

# 运行后端测试
cd backend && npm test

# 生成测试覆盖率报告
npm run test:coverage
```

### 测试

项目配置了完整的测试环境：

```bash
# 运行所有测试
npm test

# 分别运行前后端测试
npm run test:frontend    # 前端 Vitest 测试
npm run test:backend     # 后端 Jest 测试

# 生成测试覆盖率报告
npm run test:coverage
npm run test:coverage:frontend
npm run test:coverage:backend

# 交互式测试界面（前端）
cd frontend && npm run test:ui
```

**测试框架**：
- **前端**: Vitest + @testing-library/react + jsdom
- **后端**: Jest + Supertest + @types/jest
- **覆盖率目标**: 单元测试 > 80%，集成测试 > 70%

## 🚢 部署指南

### 快速部署（推荐）

使用 Docker Compose 实现一键部署：

```bash
# 克隆项目
# git clone <repository-url>
cd Project

# 一键部署生产环境
docker-compose -f docker-compose.prod.yml up -d

# 或者使用开发环境
docker-compose up -d
```

服务将在以下地址可用：
- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8000  
- **数据库**: SQLite 文件存储在 `./database/` 目录

### 生产环境部署

详细的部署指南请参考 [部署说明文档](./技术文档/部署说明文档.md)。

#### 传统部署

```bash
# 构建项目
npm run build

# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js --env production
```

#### Docker 部署

```bash
# 构建镜像
docker build -t knowledge-base:latest .

# 运行容器
docker run -d \
  --name knowledge-base \
  -p 80:3000 \
  -v /opt/knowledge-base/data:/app/data \
  -v /opt/knowledge-base/uploads:/app/uploads \
  knowledge-base:latest
```

#### Nginx 配置

``nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /uploads/ {
        alias /opt/knowledge-base/uploads/;
    }
}
```

## 📊 功能演示

### 主要界面截图

<details>
<summary>点击查看截图</summary>

#### 登录界面
![登录界面](./docs/images/login.png)

#### 文档列表
![文档列表](./docs/images/documents.png)

#### 文档详情
![文档详情](./docs/images/document-detail.png)

#### 搜索功能
![搜索功能](./docs/images/search.png)

</details>

### 功能特色

✅ **已实现功能**：
- 支持 PDF、Word、Excel、PowerPoint 等多种文件格式上传
- 基于 SQLite 的全文搜索和标签筛选
- 基于 JWT 的用户身份认证和会话管理
- 基于角色的访问控制（管理员、编辑者、查看者）
- 完全响应式设计，支持桌面端和移动端
- 类型安全的前后端 TypeScript 开发
- 完整的代码规范和 Git Hooks 集成
- 智能开发脚本，支持一键启动和自动浏览器打开

🛑 **规划中功能**：
- 文档版本控制和历史记录
- 文档评论和协作功能
- 文档缩略图自动生成
- 国际化支持（中文/英文）
- 高级搜索算法优化
- AI 智能推荐和文档自动分类

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 规范
- 编写单元测试
- 提交信息遵循 [Conventional Commits](https://conventionalcommits.org/) 规范

## 📋 路线图

### v1.0.0 (当前版本 - 2025年Q3)
- ✅ 基础文档管理功能（上传、下载、列表）
- ✅ 用户认证和权限系统（JWT + RBAC）
- ✅ 搜索和标签功能（SQLite 全文搜索）
- ✅ 响应式界面设计（Ant Design + React 18）
- ✅ 智能开发工具链（一键启动、代码规范）
- ✅ Docker 容器化部署支持

### v1.1.0 (计划中 - 2025年Q4)
- 🔄 文档版本控制和历史记录
- 🔄 高级搜索算法（分词、权重计算）
- 🔄 文档协作编辑和实时评论
- 🔄 文档缩略图自动生成
- 🔄 移动端 PWA 应用

### v1.2.0 (未来版本 - 2026年Q1)
- ⏳ AI 智能推荐和文档分类
- ⏳ 国际化支持（i18n）
- ⏳ 集成第三方存储（阿里云 OSS、AWS S3）
- ⏳ 微服务架构重构
- ⏳ 高级数据分析和报表功能

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目为本项目提供的支持：

- [React](https://reactjs.org/) - 用户界面框架
- [Ant Design](https://ant.design/) - 企业级UI组件库
- [Express](https://expressjs.com/) - Web应用框架
- [SQLite](https://sqlite.org/) - 轻量级数据库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集

## 📞 支持与联系

如果你在使用过程中遇到问题或有改进建议，欢迎通过以下方式联系我们：

### 📨 问题反馈
- 🐛 **Bug 报告**: [创建 Issue](https://github.com/your-repo/issues/new?template=bug_report.md)
- ✨ **功能请求**: [提交需求](https://github.com/your-repo/issues/new?template=feature_request.md)
- 📚 **文档问题**: [文档反馈](https://github.com/your-repo/issues/new?template=documentation.md)

### 🚑 快速帮助
- 📚 **快速开始**: [QUICK_START.md](./Project/QUICK_START.md)
- 🔧 **开发指南**: [开发环境配置文档](./技术文档/开发环境配置文档.md)
- 🚢 **部署指南**: [部署说明文档](./技术文档/部署说明文档.md)
- 📊 **API 文档**: [API接口设计文档](./设计文档/API接口设计文档.md)

### 💬 社区交流
- 💬 **讨论区**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 👥 **贡献指南**: [如何贡献](./CONTRIBUTING.md)
- 🎆 **变更日志**: [CHANGELOG.md](./CHANGELOG.md)

### 🔍 故障排除
如果遇到问题，请按以下步骤排查：

1. **检查日志**: 查看终端和浏览器控制台的错误信息
2. **重启服务**: `Ctrl+C` 停止后重新运行 `./start.sh`
3. **清理环境**: `npm run clean && npm run setup`
4. **调试模式**: 使用 `./start.sh --debug` 启动
5. **查看文档**: 参考上方的帮助文档
6. **提交 Issue**: 如果问题仍然存在，请创建 Issue

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/knowledge-base-management&type=Date)](https://star-history.com/#your-username/knowledge-base-management&Date)

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐ Star！**

Made with ❤️ by [Your Team Name](https://github.com/your-username)

</div>