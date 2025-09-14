import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { checkDocumentAccess, checkDocumentEditAccess, PermissionRequest } from '../middleware/permission';
import { DocumentDao } from '../dao/documentDao';
import { PermissionDao } from '../dao/permissionDao';
import { ShareLinkDao } from '../dao/shareLinkDao';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import crypto from 'crypto';

const router = Router();

// 添加用户权限验证schema
const addPermissionSchema = Joi.object({
  userId: Joi.number().positive().required(),
  permission: Joi.string().valid('read', 'write', 'admin').required()
});

// 设置文档公开状态验证schema
const setPublicSchema = Joi.object({
  isPublic: Joi.number().valid(0, 1).required()
});

// 生成分享链接验证schema
const generateShareLinkSchema = Joi.object({
  expiresAt: Joi.string().required(),
  password: Joi.string().optional().allow(''),
  downloadLimit: Joi.number().optional().allow(null)
});

// 添加用户权限
router.post('/:id/permissions', authenticate, checkDocumentEditAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string, 10);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 验证请求数据
    const { error, value } = addPermissionSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0]?.message || '请求数据验证失败', 400);
    }

    const { userId, permission } = value;

    // 检查用户是否存在
    // 这里应该调用用户服务检查用户是否存在
    // 暂时跳过检查

    // 添加权限
    const permissionId = await PermissionDao.addDocumentPermission(documentId, userId, permission, parseInt(String(req.user!.userId), 10));
    
    if (!permissionId) {
      return res.error('添加权限失败', 500);
    }

    res.success('权限添加成功', { permissionId }, 201);
  } catch (error) {
    console.error('添加用户权限失败:', error);
    res.error('添加用户权限失败', 500);
  }
});

// 移除用户权限
router.delete('/:id/permissions/:userId', authenticate, checkDocumentEditAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string, 10);
    const userId = parseInt(req.params.userId as string, 10);
    
    if (isNaN(documentId) || isNaN(userId)) {
      return res.error('无效的文档ID或用户ID', 400);
    }

    // 移除权限
    const success = await PermissionDao.removeDocumentPermission(documentId, userId);
    
    if (!success) {
      return res.error('移除权限失败', 500);
    }

    res.success('权限移除成功');
  } catch (error) {
    console.error('移除用户权限失败:', error);
    res.error('移除用户权限失败', 500);
  }
});

// 获取文档权限列表
router.get('/:id/permissions', authenticate, checkDocumentAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string, 10);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 获取权限列表
    const permissions = await PermissionDao.getDocumentPermissions(documentId);
    
    res.success('获取权限列表成功', { permissions });
  } catch (error) {
    console.error('获取文档权限列表失败:', error);
    res.error('获取文档权限列表失败', 500);
  }
});

// 设置文档公开/私有状态
router.put('/:id/public', authenticate, checkDocumentEditAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string, 10);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 验证请求数据
    const { error, value } = setPublicSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0]?.message || '请求数据验证失败', 400);
    }

    const { isPublic } = value;

    // 更新文档公开状态
    const success = await DocumentDao.updateDocument(documentId, { is_public: isPublic });
    
    if (!success) {
      return res.error('更新文档状态失败', 500);
    }

    res.success('文档状态更新成功', { isPublic });
  } catch (error) {
    console.error('设置文档公开状态失败:', error);
    res.error('设置文档公开状态失败', 500);
  }
});

// 生成分享链接
router.post('/:id/share', authenticate, checkDocumentAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string, 10);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 验证请求数据
    const { error, value } = generateShareLinkSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0]?.message || '请求数据验证失败', 400);
    }

    const { expiresAt, password, downloadLimit } = value;

    // 生成唯一的分享token
    const token = crypto.randomBytes(32).toString('hex');

    // 计算过期时间
    let expiresAtDate: string | null = null;
    if (expiresAt !== 'never') {
      const now = new Date();
      switch (expiresAt) {
        case '1d':
          now.setDate(now.getDate() + 1);
          break;
        case '7d':
          now.setDate(now.getDate() + 7);
          break;
        case '30d':
          now.setDate(now.getDate() + 30);
          break;
        default:
          now.setDate(now.getDate() + 7); // 默认7天
      }
      expiresAtDate = now.toISOString();
    }

    // 如果设置了密码，应该哈希密码
    let passwordHash: string | undefined;
    if (password) {
      // 这里应该使用bcrypt哈希密码
      // 暂时直接使用密码
      passwordHash = password;
    }

    // 创建分享链接
    const shareLinkId = await ShareLinkDao.createShareLink(
      documentId,
      token,
      expiresAtDate || '',
      parseInt(String(req.user!.userId), 10),
      passwordHash,
      downloadLimit || undefined
    );
    
    if (!shareLinkId) {
      return res.error('生成分享链接失败', 500);
    }

    res.success('分享链接生成成功', { 
      shareToken: token,
      shareUrl: `${req.protocol}://${req.get('host')}/api/v1/shared/${token}`
    });
  } catch (error) {
    console.error('生成分享链接失败:', error);
    res.error('生成分享链接失败', 500);
  }
});

export default router;