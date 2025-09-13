# 团队知识库管理工具

基于React + Node.js + SQLite的团队知识库管理系统

## 项目结构

```
Project/
├── frontend/                 # 前端React应用
├── backend/                  # 后端Node.js应用  
├── database/                 # 数据库相关文件
├── tests/                    # 测试文件
├── scripts/                  # 构建和部署脚本
└── docs/                     # 项目内部文档
```

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm run dev
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

### 数据库初始化
```bash
npm run db:init
npm run db:seed
```

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite 3.x
- **认证**: JWT
- **测试**: Jest + Vitest + Playwright

## 开发规范

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier代码规范
- 编写单元测试和集成测试
- 使用Git进行版本控制

## 环境要求

- Node.js 16+
- npm 8+
- macOS 11.7.10