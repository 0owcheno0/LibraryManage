import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { DocumentDao } from '../dao/documentDao';
import jwt from 'jsonwebtoken';

/**
 * 扩展Request接口，添加权限验证相关字段
 */
export interface PermissionRequest extends AuthenticatedRequest {
  documentAccess?: {
    hasAccess: boolean;
    isOwner: boolean;
    document: any;
  };
}

/**
 * 要求用户登录的中间件
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.error('用户未认证，请先登录', 401);
    }
    next();
  } catch (error) {
    console.error('认证验证失败:', error);
    res.error('认证验证失败', 500);
  }
};

/**
 * 要求特定角色的中间件
 * @param allowedRoles 允许的角色列表
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.error('用户未认证，请先登录', 401);
      }

      // 检查用户角色是否在允许列表中
      const userRole = req.user.role || 'viewer'; // 默认为 viewer 角色
      if (!allowedRoles.includes(userRole)) {
        return res.error(
          `需要以下角色之一: ${allowedRoles.join(', ')}，当前角色: ${userRole}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('角色验证失败:', error);
      res.error('角色验证失败', 500);
    }
  };
};

/**
 * 检查用户是否为管理员
 */
export const checkAdminRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    // 检查用户角色（假设role字段存在用户信息中）
    if (req.user.role !== 'admin') {
      return res.error('需要管理员权限', 403);
    }

    next();
  } catch (error) {
    console.error('检查管理员权限失败:', error);
    res.error('权限验证失败', 500);
  }
};

/**
 * 检查文档所有者权限
 * 验证用户是否为文档创建者或管理员
 */
export const checkDocumentOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    const userId = Number(req.user.userId);

    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    // 检查是否为文档所有者
    const isOwner = await DocumentDao.checkDocumentOwner(documentId, userId);
    if (!isOwner) {
      return res.error('无权限访问此文档', 403);
    }

    next();
  } catch (error) {
    console.error('检查文档所有者权限失败:', error);
    res.error('权限验证失败', 500);
  }
};

/**
 * 检查文档访问权限
 * 验证用户是否可以访问指定文档（公开文档或私有文档的所有者）
 */
export const checkDocumentAccess = async (req: PermissionRequest, res: Response, next: NextFunction) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    const userId = req.user?.userId ? Number(req.user.userId) : undefined;

    // 检查文档访问权限
    const accessResult = await DocumentDao.checkDocumentAccess(documentId, userId);
    
    if (!accessResult.hasAccess) {
      return res.error('文档不存在或无权限访问', 404);
    }

    // 将访问权限信息附加到请求对象
    req.documentAccess = {
      hasAccess: accessResult.hasAccess,
      isOwner: accessResult.isOwner || false,
      document: accessResult.document
    };

    next();
  } catch (error) {
    console.error('检查文档访问权限失败:', error);
    res.error('权限验证失败', 500);
  }
};

/**
 * 检查文档读取权限（不需要登录也能访问公开文档）
 */
export const checkDocumentReadAccess = async (req: PermissionRequest, res: Response, next: NextFunction) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    const userId = req.user?.userId ? Number(req.user.userId) : undefined;

    // 检查文档访问权限
    const accessResult = await DocumentDao.checkDocumentAccess(documentId, userId);
    
    if (!accessResult.hasAccess) {
      return res.error('文档不存在或无权限访问', 404);
    }

    // 将访问权限信息附加到请求对象
    req.documentAccess = {
      hasAccess: accessResult.hasAccess,
      isOwner: accessResult.isOwner || false,
      document: accessResult.document
    };

    next();
  } catch (error) {
    console.error('检查文档访问权限失败:', error);
    res.error('权限验证失败', 500);
  }
};

/**
 * 检查文档编辑权限
 * 只有文档所有者和管理员可以编辑文档
 */
export const checkDocumentEditAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    const userId = Number(req.user.userId);

    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    // 检查是否为文档所有者
    const isOwner = await DocumentDao.checkDocumentOwner(documentId, userId);
    if (!isOwner) {
      return res.error('只有文档创建者可以编辑文档', 403);
    }

    next();
  } catch (error) {
    console.error('检查文档编辑权限失败:', error);
    res.error('权限验证失败', 500);
  }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则跳过（用于支持匿名访问公开资源）
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有认证信息，继续执行但用户信息为空
    return next();
  }

  // 有认证信息，使用正常的认证中间件逻辑
  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    // token无效，但继续执行（作为匿名用户）
    console.warn('无效的JWT token，作为匿名用户继续:', error);
    next();
  }
};

/**
 * 权限级别检查
 */
export enum PermissionLevel {
  READ = 'read',     // 读取权限
  WRITE = 'write',   // 写入权限
  DELETE = 'delete', // 删除权限
  ADMIN = 'admin'    // 管理员权限
}

/**
 * 通用权限检查中间件
 */
export const checkPermission = (level: PermissionLevel) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const documentId = parseInt(req.params.id as string);
      if (isNaN(documentId)) {
        return res.error('无效的文档ID', 400);
      }

      const userId = req.user?.userId ? Number(req.user.userId) : undefined;

      // 根据权限级别执行不同的检查
      switch (level) {
        case PermissionLevel.READ:
          // 读取权限：公开文档或文档所有者
          const readAccess = await DocumentDao.checkDocumentAccess(documentId, userId);
          if (!readAccess.hasAccess) {
            return res.error('无权限访问此文档', 403);
          }
          break;

        case PermissionLevel.WRITE:
        case PermissionLevel.DELETE:
          // 写入/删除权限：只有文档所有者和管理员
          if (!req.user) {
            return res.error('用户未认证', 401);
          }
          
          if (req.user.role !== 'admin') {
            const isOwner = await DocumentDao.checkDocumentOwner(documentId, Number(req.user.userId));
            if (!isOwner) {
              return res.error('只有文档创建者可以执行此操作', 403);
            }
          }
          break;

        case PermissionLevel.ADMIN:
          // 管理员权限
          if (!req.user || req.user.role !== 'admin') {
            return res.error('需要管理员权限', 403);
          }
          break;
      }

      next();
    } catch (error) {
      console.error('权限检查失败:', error);
      res.error('权限验证失败', 500);
    }
  };
};

/**
 * 基于角色的权限检查中间件
 * @param allowedRoles 允许的角色列表
 */
export const hasPermission = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          code: 401,
          message: '用户未认证，请先登录',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 检查用户角色是否在允许列表中
      const userRole = req.user.role || 'viewer'; // 默认为 viewer 角色
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          code: 403,
          message: `需要以下角色之一: ${allowedRoles.join(', ')}，当前角色: ${userRole}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('角色验证失败:', error);
      res.status(500).json({
        code: 500,
        message: '权限验证失败',
        timestamp: new Date().toISOString(),
      });
    }
  };
};