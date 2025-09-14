# API文档共享机制接口文档

## 1. 概述

本文档描述了团队知识库管理系统中文档共享机制的API接口，包括文档权限管理和分享链接功能。

## 2. 权限管理接口

### 2.1 添加用户权限

**接口地址**: `POST /api/v1/documents/{id}/permissions`

**请求方法**: POST

**请求头**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求参数**:
- `id` (path): 文档ID

**请求体**:
```json
{
  "userId": 123,
  "permission": "read" // 可选值: read, write, admin
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "权限添加成功",
  "data": {
    "permissionId": 456
  }
}
```

### 2.2 移除用户权限

**接口地址**: `DELETE /api/v1/documents/{id}/permissions/{userId}`

**请求方法**: DELETE

**请求头**:
```
Authorization: Bearer {access_token}
```

**请求参数**:
- `id` (path): 文档ID
- `userId` (path): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "权限移除成功",
  "data": null
}
```

### 2.3 获取文档权限列表

**接口地址**: `GET /api/v1/documents/{id}/permissions`

**请求方法**: GET

**请求头**:
```
Authorization: Bearer {access_token}
```

**请求参数**:
- `id` (path): 文档ID

**响应示例**:
```json
{
  "code": 200,
  "message": "获取权限列表成功",
  "data": {
    "permissions": [
      {
        "id": 1,
        "resource_type": "document",
        "resource_id": 123,
        "user_id": 456,
        "permission_type": "read",
        "granted_by": 789,
        "created_at": "2023-01-01T00:00:00Z",
        "user_name": "张三"
      }
    ]
  }
}
```

### 2.4 设置文档公开/私有状态

**接口地址**: `PUT /api/v1/documents/{id}/public`

**请求方法**: PUT

**请求头**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求参数**:
- `id` (path): 文档ID

**请求体**:
```json
{
  "isPublic": 1 // 1: 公开, 0: 私有
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "文档状态更新成功",
  "data": {
    "isPublic": 1
  }
}
```

## 3. 分享链接接口

### 3.1 生成分享链接

**接口地址**: `POST /api/v1/documents/{id}/share`

**请求方法**: POST

**请求头**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**请求参数**:
- `id` (path): 文档ID

**请求体**:
```json
{
  "expiresAt": "7d", // 过期时间: 1d, 7d, 30d, never
  "password": "optional_password", // 可选
  "downloadLimit": 100 // 可选，下载次数限制
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "分享链接生成成功",
  "data": {
    "shareToken": "abc123def456",
    "shareUrl": "http://localhost:8000/api/v1/shared/abc123def456"
  }
}
```

### 3.2 通过分享链接访问文档

**接口地址**: `GET /api/v1/shared/{shareToken}`

**请求方法**: GET

**请求参数**:
- `shareToken` (path): 分享令牌
- `password` (query): 访问密码（如果设置了密码）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取文档成功",
  "data": {
    "document": {
      "id": 123,
      "title": "示例文档",
      "description": "这是一个示例文档",
      "file_name": "example.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      // ... 其他文档信息
    }
  }
}
```

## 4. 权限说明

### 4.1 文档访问权限

1. **公开文档** (`is_public = 1`): 所有用户都可以查看和下载
2. **私有文档** (`is_public = 0`): 仅创建者和被授权的用户可以访问

### 4.2 用户权限级别

1. **只读** (`read`): 可以查看和下载文档
2. **读写** (`write`): 可以查看、下载和编辑文档
3. **管理** (`admin`): 拥有文档的完全控制权限，包括权限管理

### 4.3 权限继承规则

1. **文档所有者**: 自动拥有所有权限
2. **系统管理员**: 拥有所有文档的管理权限
3. **授权用户**: 根据分配的权限级别拥有相应权限

## 5. 错误响应格式

所有API错误响应遵循统一格式:

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

常见错误码:
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 6. 注意事项

1. 所有需要认证的接口必须在请求头中包含有效的访问令牌
2. 分享链接的有效性会根据过期时间和下载次数限制进行检查
3. 设置密码的分享链接在访问时需要提供密码参数
4. 文档权限仅对私有文档生效，公开文档不受权限限制