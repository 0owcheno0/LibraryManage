# 团队知识库管理工具 - API接口设计文档

## 1. 接口概述

### 1.1 设计原则
- RESTful API设计风格
- 统一的请求/响应格式
- 合理的HTTP状态码使用
- 版本化API支持
- 安全认证机制

### 1.2 基础信息
- **Base URL**: `http://localhost:8000/api/v1`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **认证方式**: JWT Bearer Token

### 1.3 通用响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 1.4 错误响应格式
```json
{
  "code": 400,
  "message": "参数错误",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 1.5 HTTP状态码说明
- `200`: 操作成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权/认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `500`: 服务器内部错误

## 2. 认证授权接口

### 2.1 用户注册
**POST** `/auth/register`

**请求参数**:
```json
{
  "username": "string",      // 用户名，3-20位
  "email": "string",         // 邮箱地址
  "password": "string",      // 密码，6-20位
  "fullName": "string"       // 真实姓名
}
```

**响应**:
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "测试用户",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2.2 用户登录
**POST** `/auth/login`

**请求参数**:
```json
{
  "username": "string",      // 用户名或邮箱
  "password": "string"       // 密码
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "fullName": "测试用户",
      "roles": ["editor"]
    }
  }
}
```

### 2.3 刷新Token
**POST** `/auth/refresh`

**请求Header**:
```
Authorization: Bearer <refresh_token>
```

**响应**:
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200
  }
}
```

### 2.4 用户登出
**POST** `/auth/logout`

**请求Header**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "message": "登出成功"
}
```

## 3. 用户管理接口

### 3.1 获取当前用户信息
**GET** `/users/me`

**请求Header**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "测试用户",
    "avatarPath": "/uploads/avatars/user1.jpg",
    "roles": ["editor"],
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 更新用户信息
**PUT** `/users/me`

**请求参数**:
```json
{
  "fullName": "string",      // 真实姓名
  "email": "string"          // 邮箱地址
}
```

### 3.3 修改密码
**PUT** `/users/me/password`

**请求参数**:
```json
{
  "oldPassword": "string",   // 原密码
  "newPassword": "string"    // 新密码
}
```

### 3.4 上传头像
**POST** `/users/me/avatar`

**请求**: `multipart/form-data`
```
avatar: File               // 头像文件
```

### 3.5 获取用户列表（管理员）
**GET** `/users`

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `search`: 搜索关键词
- `role`: 角色筛选

## 4. 文档管理接口

### 4.1 上传文档
**POST** `/documents`

**请求**: `multipart/form-data`
```
file: File                 // 文档文件
title: string              // 文档标题
description: string        // 文档描述（可选）
tags: string[]             // 标签数组（可选）
isPublic: boolean          // 是否公开（可选）
```

**响应**:
```json
{
  "code": 201,
  "message": "上传成功",
  "data": {
    "id": 1,
    "title": "项目需求文档",
    "fileName": "requirements.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "thumbnailPath": "/uploads/thumbnails/doc1.jpg",
    "isPublic": false,
    "createdBy": {
      "id": 1,
      "username": "testuser",
      "fullName": "测试用户"
    },
    "tags": [
      {"id": 1, "name": "需求", "color": "#1890ff"}
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 获取文档列表
**GET** `/documents`

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `search`: 搜索关键词
- `tags`: 标签ID数组
- `mimeType`: 文件类型
- `createdBy`: 创建者ID
- `orderBy`: 排序字段（createdAt, title, fileSize）
- `order`: 排序方向（asc, desc）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "项目需求文档",
        "fileName": "requirements.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "thumbnailPath": "/uploads/thumbnails/doc1.jpg",
        "downloadCount": 5,
        "viewCount": 23,
        "isPublic": false,
        "createdBy": {
          "id": 1,
          "username": "testuser",
          "fullName": "测试用户"
        },
        "tags": [
          {"id": 1, "name": "需求", "color": "#1890ff"}
        ],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 4.3 获取文档详情
**GET** `/documents/{id}`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "项目需求文档",
    "description": "详细的项目需求说明",
    "fileName": "requirements.pdf",
    "filePath": "/uploads/documents/requirements.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "fileHash": "md5hash...",
    "thumbnailPath": "/uploads/thumbnails/doc1.jpg",
    "downloadCount": 5,
    "viewCount": 23,
    "isPublic": false,
    "status": "active",
    "createdBy": {
      "id": 1,
      "username": "testuser",
      "fullName": "测试用户"
    },
    "tags": [
      {"id": 1, "name": "需求", "color": "#1890ff"}
    ],
    "permissions": ["read", "write", "delete"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.4 更新文档信息
**PUT** `/documents/{id}`

**请求参数**:
```json
{
  "title": "string",         // 文档标题
  "description": "string",   // 文档描述
  "isPublic": "boolean"      // 是否公开
}
```

### 4.5 删除文档
**DELETE** `/documents/{id}`

### 4.6 下载文档
**GET** `/documents/{id}/download`

**响应**: 文件流

### 4.7 获取文档缩略图
**GET** `/documents/{id}/thumbnail`

**响应**: 图片文件流

## 5. 标签管理接口

### 5.1 创建标签
**POST** `/tags`

**请求参数**:
```json
{
  "name": "string",          // 标签名称
  "color": "string",         // 颜色（十六进制）
  "description": "string",   // 描述（可选）
  "parentId": "number"       // 父标签ID（可选）
}
```

### 5.2 获取标签列表
**GET** `/tags`

**查询参数**:
- `search`: 搜索关键词
- `parentId`: 父标签ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "技术文档",
      "color": "#1890ff",
      "description": "技术相关文档",
      "parentId": null,
      "usageCount": 15,
      "children": [
        {
          "id": 2,
          "name": "API文档",
          "color": "#52c41a",
          "parentId": 1,
          "usageCount": 8
        }
      ],
      "createdBy": {
        "id": 1,
        "username": "testuser"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5.3 更新标签
**PUT** `/tags/{id}`

### 5.4 删除标签
**DELETE** `/tags/{id}`

### 5.5 为文档添加标签
**POST** `/documents/{documentId}/tags`

**请求参数**:
```json
{
  "tagIds": [1, 2, 3]        // 标签ID数组
}
```

### 5.6 移除文档标签
**DELETE** `/documents/{documentId}/tags/{tagId}`

## 6. 搜索接口

### 6.1 全文搜索
**GET** `/search`

**查询参数**:
- `q`: 搜索关键词
- `type`: 搜索类型（all, documents, tags）
- `page`: 页码
- `limit`: 每页数量
- `filters`: 筛选条件

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "documents": {
      "items": [...],
      "total": 50
    },
    "tags": {
      "items": [...],
      "total": 5
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 55
    }
  }
}
```

### 6.2 高级搜索
**POST** `/search/advanced`

**请求参数**:
```json
{
  "keywords": "string",      // 关键词
  "tags": [1, 2],           // 标签ID数组
  "mimeTypes": ["pdf"],     // 文件类型
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "createdBy": [1, 2],      // 创建者ID数组
  "fileSize": {
    "min": 0,
    "max": 10485760
  }
}
```

## 7. 权限管理接口

### 7.1 获取文档权限
**GET** `/documents/{id}/permissions`

### 7.2 设置文档权限
**POST** `/documents/{id}/permissions`

**请求参数**:
```json
{
  "userId": 2,               // 用户ID
  "permissionType": "read",  // 权限类型
  "expiresAt": "2024-12-31T23:59:59Z"  // 过期时间（可选）
}
```

### 7.3 移除文档权限
**DELETE** `/documents/{documentId}/permissions/{userId}`

### 7.4 获取用户角色
**GET** `/users/{id}/roles`

### 7.5 分配用户角色（管理员）
**POST** `/users/{id}/roles`

**请求参数**:
```json
{
  "roleIds": [1, 2]          // 角色ID数组
}
```

## 8. 评论接口

### 8.1 获取文档评论
**GET** `/documents/{id}/comments`

### 8.2 添加评论
**POST** `/documents/{id}/comments`

**请求参数**:
```json
{
  "content": "string",       // 评论内容
  "parentId": "number"       // 父评论ID（可选，用于回复）
}
```

### 8.3 删除评论
**DELETE** `/comments/{id}`

## 9. 系统接口

### 9.1 获取系统配置
**GET** `/system/configs`

### 9.2 更新系统配置（管理员）
**PUT** `/system/configs`

### 9.3 获取系统统计
**GET** `/system/stats`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 100,
    "totalDocuments": 500,
    "totalStorage": 1073741824,
    "todayUploads": 10,
    "todayDownloads": 50
  }
}
```

## 10. 文件服务接口

### 10.1 上传文件
**POST** `/files/upload`

### 10.2 获取文件
**GET** `/files/{filename}`

### 10.3 删除文件
**DELETE** `/files/{filename}`

## 11. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 40001 | 参数缺失 |
| 40002 | 参数格式错误 |
| 40101 | 未登录 |
| 40102 | Token过期 |
| 40103 | Token无效 |
| 40301 | 权限不足 |
| 40401 | 资源不存在 |
| 40901 | 资源已存在 |
| 50001 | 服务器内部错误 |
| 50002 | 数据库错误 |
| 50003 | 文件上传失败 |

## 12. 接口测试示例

### 12.1 Postman集合
提供完整的Postman测试集合，包含所有接口的测试用例。

### 12.2 curl示例
```bash
# 用户登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 上传文档
curl -X POST http://localhost:8000/api/v1/documents \
  -H "Authorization: Bearer your_token_here" \
  -F "file=@/path/to/document.pdf" \
  -F "title=测试文档" \
  -F "description=这是一个测试文档"

# 搜索文档
curl -X GET "http://localhost:8000/api/v1/search?q=测试&type=documents" \
  -H "Authorization: Bearer your_token_here"
```