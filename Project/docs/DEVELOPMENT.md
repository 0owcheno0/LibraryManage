# 开发指南

## 项目结构说明

```
Project/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务层
│   │   ├── hooks/           # 自定义React Hooks
│   │   ├── contexts/        # React Context
│   │   ├── types/           # TypeScript类型定义
│   │   └── utils/           # 工具函数
│   └── public/              # 静态资源
├── backend/                  # Node.js后端API
│   ├── src/
│   │   ├── controllers/     # 路由控制器
│   │   ├── services/        # 业务逻辑层
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # Express中间件
│   │   ├── database/        # 数据库配置
│   │   └── utils/           # 工具函数
│   ├── uploads/             # 文件上传目录
│   └── logs/                # 日志文件
├── database/                 # SQLite数据库文件
├── tests/                    # 测试文件
└── scripts/                  # 构建和部署脚本
```

## 开发环境设置

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd backend && npm install
```

### 2. 环境变量配置

复制 `.env.example` 为 `.env` 并配置相应的环境变量。

### 3. 数据库初始化

```bash
# 初始化数据库结构
npm run db:init

# 插入测试数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
# 方式1: 使用脚本启动
./scripts/dev.sh

# 方式2: 手动启动
npm run dev
```

## 开发规范

### 代码风格

- 使用TypeScript进行开发
- 遵循ESLint和Prettier配置
- 使用有意义的变量和函数命名
- 添加适当的代码注释

### 提交规范

使用约定式提交规范：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 测试要求

- 新功能必须包含单元测试
- 关键业务逻辑需要集成测试
- 重要功能需要E2E测试

## 调试指南

### 前端调试

- 使用Chrome DevTools
- React Developer Tools扩展
- Redux DevTools (如果使用)

### 后端调试

- 使用VS Code调试配置
- 查看日志文件: `backend/logs/`
- 使用Postman测试API

## 常见问题

### 1. 端口冲突

如果遇到端口冲突，可以修改以下配置：
- 前端: `frontend/vite.config.ts`
- 后端: `.env` 文件中的 `PORT` 变量

### 2. 数据库连接问题

检查SQLite数据库文件权限和路径配置。

### 3. 文件上传问题

确保 `backend/uploads` 目录有写入权限。