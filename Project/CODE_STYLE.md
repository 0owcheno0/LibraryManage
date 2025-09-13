# 代码规范指南

## 📋 概述

本文档定义了团队知识库管理工具项目的代码风格和规范，确保代码的一致性、可读性和可维护性。

## 🛠️ 工具配置

### 已配置的工具

- **ESLint**: 代码质量和风格检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 管理
- **lint-staged**: 提交前代码检查
- **EditorConfig**: 编辑器配置统一

### 使用方法

```bash
# 检查代码风格和质量
npm run code:check

# 自动修复代码问题
npm run code:fix

# 仅运行 ESLint
npm run lint

# 仅运行 Prettier
npm run format

# 检查格式而不修复
npm run format:check
```

## 📝 代码风格规范

### 基础规范

- **缩进**: 使用 2 个空格
- **引号**: 使用单引号 `'`
- **分号**: 语句末尾必须加分号 `;`
- **行长度**: 最大 100 字符
- **换行符**: 使用 LF (`\n`)
- **文件结尾**: 必须有空行

### TypeScript 规范

```typescript
// ✅ 推荐写法
interface User {
  id: number;
  name: string;
  email: string;
}

const getUserInfo = async (userId: number): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// ❌ 不推荐写法
interface user {
  id: any;
  name: any;
}

function getUserInfo(userId) {
  return fetch('/api/users/' + userId).then(response => response.json());
}
```

### React 组件规范

```tsx
// ✅ 推荐写法
import React from 'react';
import { Button } from 'antd';
import type { FC } from 'react';

interface Props {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const MyComponent: FC<Props> = ({ title, onClick, disabled = false }) => {
  return (
    <div className="my-component">
      <h1>{title}</h1>
      <Button onClick={onClick} disabled={disabled}>
        点击我
      </Button>
    </div>
  );
};

export default MyComponent;
```

### Node.js 后端规范

```typescript
// ✅ 推荐写法
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 认证逻辑
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

## 📁 文件和目录命名

### 文件命名规范

- **React 组件**: PascalCase (`UserProfile.tsx`)
- **Hook**: camelCase with `use` prefix (`useAuth.ts`)
- **工具函数**: camelCase (`formatDate.ts`)
- **常量**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **类型定义**: PascalCase (`User.ts`, `ApiResponse.ts`)

### 目录结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   └── layout/         # 布局组件
├── pages/              # 页面组件
├── hooks/              # 自定义 Hook
├── services/           # API 服务
├── contexts/           # React Context
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── constants/          # 常量定义
```

## 🔧 导入规范

### 导入顺序

```typescript
// 1. React 相关
import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

// 2. 第三方库
import { Button, Form, Input } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

// 3. 项目内部模块 (绝对路径)
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import type { User } from '@/types/User';

// 4. 相对路径导入
import './LoginForm.css';
import { validateEmail } from '../utils/validation';
```

### 路径别名

项目配置了以下路径别名：

```typescript
// 前端
'@/*': ['src/*']
'@/components/*': ['src/components/*']
'@/pages/*': ['src/pages/*']
'@/services/*': ['src/services/*']

// 后端
'@/*': ['src/*']
'@/controllers/*': ['src/controllers/*']
'@/services/*': ['src/services/*']
'@/models/*': ['src/models/*']
```

## 🧪 注释规范

### 函数注释

```typescript
/**
 * 用户登录函数
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns Promise<LoginResponse> 登录结果
 * @throws {AuthError} 当认证失败时抛出错误
 */
const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // 实现逻辑
};
```

### 组件注释

````tsx
/**
 * 文档上传组件
 *
 * 支持拖拽上传，多文件选择，进度显示
 *
 * @example
 * ```tsx
 * <DocumentUpload
 *   onUpload={handleUpload}
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   accept={['.pdf', '.doc', '.docx']}
 * />
 * ```
 */
const DocumentUpload: FC<Props> = ({ onUpload, maxSize, accept }) => {
  // 组件实现
};
````

## 🔒 错误处理规范

### 前端错误处理

```typescript
// ✅ 推荐写法
const fetchUserData = async (userId: number): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    message.error('获取用户信息失败，请重试');
    return null;
  }
};
```

### 后端错误处理

```typescript
// ✅ 推荐写法
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.findById(Number(id));

    if (!user) {
      res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.json({
      code: 200,
      message: 'success',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get user by ID failed:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      timestamp: new Date().toISOString(),
    });
  }
};
```

## 🚀 性能优化规范

### React 性能优化

```tsx
// ✅ 使用 memo 优化组件
const UserCard = React.memo<Props>(({ user, onEdit }) => {
  // 组件实现
});

// ✅ 使用 useCallback 优化函数
const handleEdit = useCallback((userId: number) => {
  // 编辑逻辑
}, []);

// ✅ 使用 useMemo 优化计算
const filteredUsers = useMemo(() => {
  return users.filter(user => user.active);
}, [users]);
```

## 📋 提交规范

### Git 提交信息格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建配置等

### 示例

```bash
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(api): resolve user data fetching issue"
git commit -m "docs: update API documentation"
```

## 🔍 代码检查

### 自动检查

项目已配置 Git hooks，在以下时机自动检查：

- **pre-commit**: 提交前检查暂存文件
- **pre-push**: 推送前检查整个项目

### 手动检查

```bash
# 检查所有文件
npm run code:check

# 修复可自动修复的问题
npm run code:fix

# 仅检查 lint
npm run lint

# 仅格式化代码
npm run format
```

## 🛡️ 最佳实践

### 1. 类型安全

- 避免使用 `any` 类型
- 为所有函数定义明确的返回类型
- 使用严格的 TypeScript 配置

### 2. 组件设计

- 保持组件单一职责
- 使用 TypeScript 接口定义 Props
- 合理使用 React Hooks

### 3. 状态管理

- 使用 React Context 管理全局状态
- 避免过度嵌套的状态结构
- 使用 useReducer 管理复杂状态

### 4. API 设计

- 统一的响应格式
- 合理的 HTTP 状态码
- 完整的错误处理

### 5. 安全考虑

- 输入验证和清理
- SQL 注入防护
- XSS 攻击防护
- 合理的权限控制

## 📞 问题反馈

如果对代码规范有疑问或建议，请：

1. 在项目中创建 Issue
2. 与团队成员讨论
3. 提出改进建议

---

**最后更新**: 2025-09-13  
**文档版本**: v1.0  
**维护者**: 团队知识库项目组
