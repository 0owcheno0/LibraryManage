# API用户管理接口文档

## 概述

本文档详细说明了团队知识库管理系统中的用户管理相关API接口，包括个人资料管理、密码修改、头像上传以及管理员用户管理功能。

## 认证方式

所有用户管理API都需要通过JWT Token进行认证，请求头中需要包含：
```
Authorization: Bearer <access_token>
```

## 个人资料管理API

### 1. 获取当前用户信息

**接口地址**: `GET /api/v1/users/me`

**请求方式**: GET

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "用户姓名",
    "avatar_url": "/uploads/avatars/avatar-123456789.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "role": "admin"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 2. 更新个人信息

**接口地址**: `PUT /api/v1/users/me`

**请求方式**: PUT

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| full_name | string | 否 | 真实姓名 |
| email | string | 否 | 邮箱地址 |

**请求示例**:
```json
{
  "full_name": "新姓名",
  "email": "newemail@example.com"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新用户信息成功",
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "username": "username",
    "full_name": "新姓名",
    "avatar_url": "/uploads/avatars/avatar-123456789.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "role": "admin"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3. 修改密码

**接口地址**: `PUT /api/v1/users/me/password`

**请求方式**: PUT

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码 |

**请求示例**:
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "密码修改成功",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 4. 上传头像

**接口地址**: `POST /api/v1/users/me/avatar`

**请求方式**: POST

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| avatar | file | 是 | 头像文件 |

**响应示例**:
```json
{
  "code": 200,
  "message": "头像上传成功",
  "data": {
    "avatar_url": "/uploads/avatars/avatar-123456789.jpg"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 管理员用户管理API

### 1. 获取用户列表

**接口地址**: `GET /api/v1/admin/users`

**请求方式**: GET

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认为1 |
| pageSize | integer | 否 | 每页数量，默认为20 |
| keyword | string | 否 | 搜索关键词 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "系统管理员",
        "avatar_url": null,
        "role_id": 1,
        "role_name": "admin",
        "status": 1,
        "created_at": "2023-01-01T00:00:00.000Z",
        "last_login_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 2. 用户角色分配

**接口地址**: `POST /api/v1/admin/users/{id}/roles`

**请求方式**: POST

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |
| role_id | integer | 是 | 角色ID |

**请求示例**:
```json
{
  "role_id": 2
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "用户角色分配成功",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3. 用户状态管理

**接口地址**: `PUT /api/v1/admin/users/{id}/status`

**请求方式**: PUT

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |
| status | integer | 是 | 状态(0:禁用, 1:启用) |

**请求示例**:
```json
{
  "status": 0
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "用户状态更新成功",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 4. 删除用户

**接口地址**: `DELETE /api/v1/admin/users/{id}`

**请求方式**: DELETE

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 用户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "用户删除成功",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 角色权限说明

系统预设三种角色：

1. **管理员 (admin)**: 拥有所有权限，可以管理用户、文档、标签等所有资源
2. **编辑者 (editor)**: 可以上传、编辑、删除自己的文档，可以管理标签
3. **查看者 (viewer)**: 只能查看公开文档和自己创建的私有文档

## 错误响应格式

所有API接口在出错时都会返回以下格式的错误信息：

```json
{
  "code": 400,
  "message": "错误描述",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |