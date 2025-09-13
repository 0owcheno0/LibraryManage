# 团队知识库管理工具

<div align="center">

![知识库管理工具](https://img.shields.io/badge/Knowledge-Base-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=flat-square&logo=sqlite)

一个简洁高效的团队知识库管理平台，支持文档上传、搜索、标签化管理和权限控制。

[在线演示](https://demo.example.com) | [文档](./docs) | [更新日志](./CHANGELOG.md) | [问题反馈](https://github.com/your-repo/issues)

</div>

## ✨ 特性

- 📁 **文档管理** - 支持多种文件格式上传、预览和下载
- 🔍 **智能搜索** - 全文搜索和高级筛选功能
- 🏷️ **标签系统** - 灵活的标签分类和管理
- 👥 **团队协作** - 文档共享、评论和权限控制
- 🔐 **权限管理** - 基于角色的访问控制(RBAC)
- 📱 **响应式设计** - 支持桌面端和移动端访问
- 🚀 **高性能** - 基于现代技术栈构建，响应迅速
- 🔧 **易部署** - 支持Docker容器化部署和传统部署

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Ant Design** - 企业级UI组件库
- **Vite** - 现代前端构建工具
- **React Router** - 前端路由管理

### 后端技术栈
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **TypeScript** - 服务端类型安全
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证机制

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

- Node.js 16.x 或以上版本
- npm 8.x 或以上版本
- 4GB+ 内存
- 10GB+ 可用磁盘空间

### 一键启动

```bash
# 进入项目目录
cd Project

# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 开始使用。

默认管理员账号：
- 用户名：`admin`
- 密码：`admin123`

### Docker 部署

```bash
# 构建镜像
docker build -t knowledge-base .

# 运行容器
docker run -d \
  --name knowledge-base \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  knowledge-base
```

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

详细的开发环境配置请参考 [开发环境配置文档](./技术文档/开发环境配置文档.md)。

```bash
# 进入项目目录
cd Project

# 安装所有依赖
npm install

# 初始化数据库
npm run db:init

# 启动开发服务器（前后端同时启动）
npm run dev
```

### 项目结构

```
testClass/                    # 团队知识库管理工具项目根目录
├── Project/                  # 主要开发代码目录
│   ├── frontend/            # 前端React应用
│   │   ├── src/
│   │   │   ├── components/  # 通用组件
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── contexts/    # React上下文
│   │   │   ├── hooks/       # 自定义Hook
│   │   │   ├── services/    # API服务
│   │   │   ├── types/       # TypeScript类型定义
│   │   │   └── utils/       # 工具函数
│   │   ├── public/          # 静态资源
│   │   ├── package.json     # 前端依赖配置
│   │   └── vite.config.ts   # Vite构建配置
│   ├── backend/             # 后端Node.js服务
│   │   ├── src/
│   │   │   ├── controllers/ # 控制器
│   │   │   ├── services/    # 业务逻辑
│   │   │   ├── models/      # 数据模型
│   │   │   ├── routes/      # 路由定义
│   │   │   ├── middleware/  # 中间件
│   │   │   ├── database/    # 数据库配置
│   │   │   └── utils/       # 工具函数
│   │   ├── uploads/         # 文件上传目录
│   │   └── package.json     # 后端依赖配置
│   ├── scripts/             # 构建和部署脚本
│   │   ├── build.sh         # 构建脚本
│   │   └── dev.sh           # 开发启动脚本
│   ├── docs/                # 项目内部文档
│   │   └── DEVELOPMENT.md   # 开发指南
│   ├── package.json         # 工作空间配置
│   └── docker-compose.yml   # Docker编排配置
├── 设计文档/                 # 项目设计文档
│   ├── 需求分析文档.md
│   ├── 系统设计文档.md
│   ├── 数据库设计文档.md
│   ├── API接口设计文档.md
│   └── 自动化测试计划.md
├── 技术文档/                 # 技术实现文档
│   ├── 架构设计文档.md
│   ├── 开发环境配置文档.md
│   ├── 部署说明文档.md
│   └── 性能优化指南.md
├── 项目管理文档/             # 项目管理相关
│   ├── 开发计划文档.md
│   ├── 测试计划文档.md
│   └── 项目进度跟踪.md
├── 简化项目开发计划.md       # 精简版开发计划
├── 项目题目.md               # 项目需求和目标
├── README.md                 # 项目说明文档
└── CLAUDE.md                 # AI助手交互记录
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

```bash
# 运行所有测试
npm test

# 运行前端测试
cd frontend && npm test

# 运行后端测试
cd backend && npm test

# 生成测试覆盖率报告
npm run test:coverage
```

## 🚢 部署指南

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

```nginx
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

- ✅ 支持 PDF、Word、Excel、PowerPoint 等多种文件格式
- ✅ 自动生成文档缩略图
- ✅ 全文搜索和标签筛选
- ✅ 用户权限和角色管理
- ✅ 文档版本控制
- ✅ 评论和协作功能
- ✅ 响应式移动端支持
- ✅ 国际化支持（中文/英文）

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

### v1.0.0 (当前版本)
- ✅ 基础文档管理功能
- ✅ 用户认证和权限系统
- ✅ 搜索和标签功能
- ✅ 响应式界面设计

### v1.1.0 (计划中)
- 🔄 文档版本控制
- 🔄 高级搜索算法
- 🔄 文档协作编辑
- 🔄 移动端 App

### v1.2.0 (未来版本)
- ⏳ AI 智能推荐
- ⏳ 文档自动分类
- ⏳ 集成第三方存储
- ⏳ 微服务架构重构

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

- 📧 邮箱：support@example.com
- 💬 QQ群：123456789
- 📱 微信群：扫描二维码加入
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-repo/issues)
- 📖 文档网站：[https://docs.example.com](https://docs.example.com)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/knowledge-base-management&type=Date)](https://star-history.com/#your-username/knowledge-base-management&Date)

---

<div align="center">

**如果这个项目对你有帮助，请给它一个 ⭐ Star！**

Made with ❤️ by [Your Team Name](https://github.com/your-username)

</div>