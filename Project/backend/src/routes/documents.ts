import { Router, Request, Response } from 'express';
import path from 'path';
import { uploadSingleDocument, validateUploadedFile, getFileExtension } from '../middleware/upload';
import { FileService } from '../services/fileService';
import { DocumentModel, CreateDocumentData } from '../models/Document';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { 
  checkDocumentAccess, 
  checkDocumentEditAccess, 
  optionalAuth,
  PermissionRequest 
} from '../middleware/permission';
import { DocumentDao } from '../dao/documentDao';
import Joi from 'joi';

const router = Router();

// 上传文档验证schema
const uploadDocumentSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': '文档标题不能为空',
    'string.max': '文档标题不能超过255个字符',
    'any.required': '请输入文档标题'
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': '文档描述不能超过1000个字符'
  }),
  is_public: Joi.number().valid(0, 1).optional().default(0),
  tag_ids: Joi.array().items(Joi.number().positive()).optional()
});

// 更新文档验证schema
const updateDocumentSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional().messages({
    'string.empty': '文档标题不能为空',
    'string.max': '文档标题不能超过255个字符'
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': '文档描述不能超过1000个字符'
  }),
  is_public: Joi.number().valid(0, 1).optional()
});

// 获取文档列表 - 支持高级查询
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId ? Number(req.user.userId) : undefined;
    const {
      page = '1',
      pageSize = '20',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      isPublic,
      mimeType,
      createdBy,
      keyword,
      tagIds
    } = req.query;

    const queryParams: any = {
      page: Math.max(1, parseInt(page as string)),
      pageSize: Math.min(100, Math.max(1, parseInt(pageSize as string))),
      sortBy: (sortBy as string) as any,
      sortOrder: (sortOrder as string).toUpperCase() as 'ASC' | 'DESC',
    };

    // Only add defined values to avoid type issues
    if (userId !== undefined) queryParams.userId = userId;
    if (isPublic !== undefined) queryParams.isPublic = isPublic === '1' || isPublic === 'true';
    if (mimeType) queryParams.mimeType = mimeType as string;
    if (createdBy) queryParams.createdBy = parseInt(createdBy as string);
    if (keyword) queryParams.keyword = keyword as string;
    if (tagIds) queryParams.tagIds = (tagIds as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    const result = await DocumentDao.getDocuments(queryParams);
    const stats = await DocumentDao.getDocumentStats(userId);

    res.success('获取文档列表成功', {
      ...result,
      stats
    });
  } catch (error) {
    console.error('获取文档列表失败:', error);
    res.error('获取文档列表失败', 500);
  }
});

// 上传文档
router.post('/', authenticate, uploadSingleDocument, async (req: AuthenticatedRequest, res: Response) => {
  let uploadedFilePath: string | undefined;
  
  try {
    // 验证用户认证
    if (!req.user) {
      return res.error('用户未认证', 401);
    }

    // 验证文件上传
    const fileValidation = validateUploadedFile(req.file as Express.Multer.File);
    if (!fileValidation.isValid) {
      return res.error(fileValidation.error || '文件上传失败', 400);
    }

    const uploadedFile = req.file as Express.Multer.File;
    uploadedFilePath = uploadedFile.path;

    // 验证请求数据
    const { error, value } = uploadDocumentSchema.validate(req.body);
    if (error) {
      if (uploadedFilePath) {
        await FileService.deleteFile(uploadedFilePath);
      }
      return res.error(error.details[0]?.message || '请求数据验证失败', 400);
    }

    const { title, description, is_public = 0, tag_ids } = value;

    // 处理上传的文件
    const fileInfo = await FileService.processUploadedFile(uploadedFile);

    // 检查文件重复
    if (fileInfo.isDuplicate && fileInfo.existingDocumentId) {
      if (uploadedFilePath) {
        await FileService.deleteFile(uploadedFilePath);
      }
      
      const existingDoc = await DocumentModel.findById(fileInfo.existingDocumentId);
      return res.error('文件已存在', 409, {
        existingDocument: {
          id: fileInfo.existingDocumentId,
          title: existingDoc?.title,
          created_at: existingDoc?.created_at
        }
      });
    }

    // 额外的文件类型一致性检查
    const typeCheck = FileService.validateFileTypeConsistency(uploadedFile);
    if (!typeCheck.isValid) {
      if (uploadedFilePath) {
        await FileService.deleteFile(uploadedFilePath);
      }
      return res.error(typeCheck.message || '文件类型验证失败', 400);
    }

    // 准备文档数据
    const documentData: CreateDocumentData = {
      title,
      description: description || null,
      file_name: uploadedFile.filename,
      file_path: uploadedFile.path,
      file_size: fileInfo.metadata.size,
      mime_type: fileInfo.metadata.mimetype,
      file_hash: fileInfo.metadata.md5Hash,
      file_extension: getFileExtension(fileInfo.metadata.mimetype),
      friendly_type: fileInfo.metadata.friendlyType,
      formatted_size: fileInfo.metadata.formattedSize,
      is_public,
      upload_user_id: Number(req.user.userId),
      tag_ids
    };

    // 创建文档记录
    const document = await DocumentModel.create(documentData);

    res.success('文档上传成功', {
      documentId: document.id,
      title: document.title,
      fileName: document.file_name,
      fileSize: document.file_size,
      formattedSize: document.formatted_size,
      friendlyType: document.friendly_type,
      createdAt: document.created_at
    }, 201);

  } catch (error) {
    console.error('文档上传失败:', error);
    
    // 清理上传的文件
    if (uploadedFilePath) {
      await FileService.deleteFile(uploadedFilePath);
    }

    if (error instanceof Error) {
      if (error.message.includes('不支持的文件类型')) {
        return res.error(error.message, 400);
      }
      if (error.message.includes('文件大小')) {
        return res.error(error.message, 413);
      }
    }

    res.error('文档上传失败，请稍后重试', 500);
  }
});

// 获取文档详情 - 自动增加浏览次数
router.get('/:id', optionalAuth, checkDocumentAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 从中间件中获取文档信息
    const document = req.documentAccess?.document;
    if (!document) {
      return res.error('文档不存在', 404);
    }

    // 增加浏览次数
    await DocumentDao.incrementViewCount(documentId);

    // 返回文档详情（浏览次数已更新）
    res.success('获取文档详情成功', {
      ...document,
      view_count: document.view_count + 1,
      isOwner: req.documentAccess?.isOwner || false
    });
  } catch (error) {
    console.error('获取文档详情失败:', error);
    res.error('获取文档详情失败', 500);
  }
});

// 更新文档信息 - 仅创建者和管理员
router.put('/:id', authenticate, checkDocumentEditAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 验证请求数据
    const { error, value } = updateDocumentSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0]?.message || '请求数据验证失败', 400);
    }

    const { title, description, is_public } = value;

    // 检查是否有更新内容
    if (title === undefined && description === undefined && is_public === undefined) {
      return res.error('没有提供需要更新的字段', 400);
    }

    // 更新文档
    const updateData = {
      title,
      description,
      is_public
    };

    const success = await DocumentDao.updateDocument(documentId, updateData);
    if (!success) {
      return res.error('文档不存在或更新失败', 404);
    }

    // 获取更新后的文档信息
    const updatedDocument = await DocumentDao.getDocumentById(documentId);
    if (!updatedDocument) {
      return res.error('获取更新后的文档信息失败', 500);
    }

    res.success('文档更新成功', {
      id: updatedDocument.id,
      title: updatedDocument.title,
      description: updatedDocument.description,
      is_public: updatedDocument.is_public,
      updated_at: updatedDocument.updated_at
    });
  } catch (error) {
    console.error('更新文档失败:', error);
    res.error('更新文档失败', 500);
  }
});

// 删除文档 - 软删除，仅创建者和管理员
router.delete('/:id', authenticate, checkDocumentEditAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 获取文档信息用于返回（删除前）
    const document = await DocumentDao.getDocumentById(documentId);
    if (!document) {
      return res.error('文档不存在', 404);
    }

    // 执行软删除
    const success = await DocumentDao.deleteDocument(documentId);
    if (!success) {
      return res.error('删除文档失败', 500);
    }

    res.success('文档删除成功', {
      id: document.id,
      title: document.title,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    res.error('删除文档失败', 500);
  }
});

// 下载文档 - 权限验证并增加下载次数
router.get('/:id/download', optionalAuth, checkDocumentAccess, async (req: PermissionRequest, res: Response) => {
  try {
    const documentId = parseInt(req.params.id as string);
    if (isNaN(documentId)) {
      return res.error('无效的文档ID', 400);
    }

    // 从中间件中获取文档信息
    const document = req.documentAccess?.document;
    if (!document) {
      return res.error('文档不存在', 404);
    }

    // 权限验证：文档是否公开或用户有权访问
    const userId = req.user?.userId ? Number(req.user.userId) : null;
    if (!document.is_public && (!userId || document.upload_user_id !== userId)) {
      return res.error('无权限访问此文档', 403);
    }

    // 检查文件是否存在
    const fileExists = FileService.validateFileExists(document.file_path);
    if (!fileExists) {
      return res.error('文件不存在或已损坏', 404);
    }

    // 增加下载次数
    await DocumentDao.incrementDownloadCount(documentId);

    // 生成安全的下载文件名
    const safeFileName = FileService.generateSafeDownloadPath(document.file_name);
    
    // 设置响应头 - Content-Disposition设置原始文件名
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}`);
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Length', document.file_size.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Accept-Ranges', 'bytes');

    // 文件流传输: res.download()方法
    res.download(document.file_path, safeFileName, (error) => {
      if (error) {
        console.error('文件下载失败:', error);
        if (!res.headersSent) {
          res.error('文件下载失败', 500);
        }
      }
    });
  } catch (error) {
    console.error('文档下载失败:', error);
    res.error('文档下载失败', 500);
  }
});

export default router;
