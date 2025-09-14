import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { TagDao, CreateTagData, UpdateTagData, TagListQuery } from '../dao/tagDao';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { hasPermission } from '../middleware/permission';

const router = Router();

// 验证schemas
const createTagSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': '标签名称不能为空',
    'string.min': '标签名称至少1个字符',
    'string.max': '标签名称不能超过50个字符',
    'any.required': '标签名称是必需的'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#1890ff').messages({
    'string.pattern.base': '颜色格式无效，请使用十六进制格式如 #1890ff'
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': '描述不能超过500个字符'
  })
});

const updateTagSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional().messages({
    'string.empty': '标签名称不能为空',
    'string.min': '标签名称至少1个字符',
    'string.max': '标签名称不能超过50个字符'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.pattern.base': '颜色格式无效，请使用十六进制格式如 #1890ff'
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': '描述不能超过500个字符'
  })
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(50),
  sortBy: Joi.string().valid('name', 'usage_count', 'created_at').default('name'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC'),
  search: Joi.string().max(100).optional().allow('')
});

// 获取标签列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    const query: TagListQuery = value;
    const result = TagDao.getTags(query);

    return res.status(200).json({
      code: 200,
      message: '获取标签列表成功',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get tags error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取标签列表失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 获取热门标签 - 放在 /:id 路由之前避免冲突
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        code: 400,
        message: '限制数量必须在1-50之间',
        timestamp: new Date().toISOString(),
      });
    }

    const popularTags = TagDao.getPopularTags(limit);

    return res.status(200).json({
      code: 200,
      message: '获取热门标签成功',
      data: {
        tags: popularTags,
        count: popularTags.length
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取热门标签失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 搜索标签
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { keyword, limit } = req.query;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
        timestamp: new Date().toISOString(),
      });
    }

    const searchLimit = parseInt(limit as string) || 20;
    
    if (searchLimit < 1 || searchLimit > 50) {
      return res.status(400).json({
        code: 400,
        message: '限制数量必须在1-50之间',
        timestamp: new Date().toISOString(),
      });
    }

    const tags = TagDao.searchTags(keyword.trim(), searchLimit);

    return res.status(200).json({
      code: 200,
      message: '搜索标签成功',
      data: {
        tags,
        keyword,
        count: tags.length
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search tags error:', error);
    return res.status(500).json({
      code: 500,
      message: '搜索标签失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 创建标签
router.post('/', authenticate, hasPermission(['admin', 'editor']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = createTagSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    const { name, color, description } = value;

    // 检查标签名是否已存在
    if (TagDao.isTagNameExists(name)) {
      return res.status(409).json({
        code: 409,
        message: '标签名称已存在',
        timestamp: new Date().toISOString(),
      });
    }

    const tagData: CreateTagData = {
      name,
      color,
      description
    };
    
    if (req.user?.userId) {
      tagData.created_by = Number(req.user.userId);
    }

    const tag = TagDao.createTag(tagData);

    return res.status(201).json({
      code: 201,
      message: '标签创建成功',
      data: tag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create tag error:', error);
    return res.status(500).json({
      code: 500,
      message: '标签创建失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 获取单个标签详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tagId = parseInt(req.params.id!, 10);
    
    if (isNaN(tagId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的标签ID',
        timestamp: new Date().toISOString(),
      });
    }

    const tag = TagDao.getTagById(tagId);
    
    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        timestamp: new Date().toISOString(),
      });
    }

    // 获取使用次数
    const usageCount = TagDao.getTagUsageCount(tagId);

    return res.status(200).json({
      code: 200,
      message: '获取标签详情成功',
      data: {
        ...tag,
        document_count: usageCount
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get tag error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取标签详情失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 更新标签
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tagId = parseInt(req.params.id!, 10);
    
    if (isNaN(tagId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的标签ID',
        timestamp: new Date().toISOString(),
      });
    }

    const { error, value } = updateTagSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    // 检查标签是否存在
    const existingTag = TagDao.getTagById(tagId);
    if (!existingTag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        timestamp: new Date().toISOString(),
      });
    }

    // 权限检查：只有创建者或管理员可以编辑
    if (existingTag.created_by !== Number(req.user?.userId!) && req.user?.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有标签创建者或管理员可以编辑标签',
        timestamp: new Date().toISOString(),
      });
    }

    // 如果要修改名称，检查新名称是否已存在
    if (value.name && TagDao.isTagNameExists(value.name, tagId)) {
      return res.status(409).json({
        code: 409,
        message: '标签名称已存在',
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: UpdateTagData = value;
    const updatedTag = TagDao.updateTag(tagId, updateData);

    if (!updatedTag) {
      return res.status(500).json({
        code: 500,
        message: '标签更新失败',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      code: 200,
      message: '标签更新成功',
      data: updatedTag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Update tag error:', error);
    return res.status(500).json({
      code: 500,
      message: '标签更新失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 删除标签
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tagId = parseInt(req.params.id!, 10);
    
    if (isNaN(tagId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的标签ID',
        timestamp: new Date().toISOString(),
      });
    }

    // 检查标签是否存在
    const existingTag = TagDao.getTagById(tagId);
    if (!existingTag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在',
        timestamp: new Date().toISOString(),
      });
    }

    // 权限检查：只有创建者或管理员可以删除
    if (existingTag.created_by !== Number(req.user?.userId!) && req.user?.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有标签创建者或管理员可以删除标签',
        timestamp: new Date().toISOString(),
      });
    }

    const { force } = req.query;
    
    let result;
    if (force === 'true' && req.user?.role === 'admin') {
      // 管理员可以强制删除
      result = TagDao.forceDeleteTag(tagId);
    } else {
      // 普通删除，检查关联
      result = TagDao.deleteTag(tagId);
    }

    if (!result.success) {
      const statusCode = result.message.includes('正在被使用') ? 409 : 400;
      return res.status(statusCode).json({
        code: statusCode,
        message: result.message,
        data: 'documentCount' in result ? { documentCount: result.documentCount } : undefined,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      code: 200,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    return res.status(500).json({
      code: 500,
      message: '标签删除失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 获取我创建的标签
router.get('/my/created', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        code: 401,
        message: '用户未登录',
        timestamp: new Date().toISOString(),
      });
    }

    const tags = TagDao.getTagsByCreator(Number(req.user.userId!));

    return res.status(200).json({
      code: 200,
      message: '获取我的标签成功',
      data: {
        tags,
        count: tags.length
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get my tags error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取我的标签失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 批量更新所有标签的使用次数统计
router.post('/sync-usage-counts', authenticate, hasPermission(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    TagDao.updateAllTagUsageCounts();

    return res.status(200).json({
      code: 200,
      message: '标签使用次数统计同步成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync tag usage counts error:', error);
    return res.status(500).json({
      code: 500,
      message: '标签使用次数统计同步失败',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
