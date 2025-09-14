import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { SearchService, SearchParams } from '../services/searchService';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { optionalAuth } from '../middleware/permission';

const router = Router();

// 搜索参数验证schema
const searchQuerySchema = Joi.object({
  q: Joi.string().max(200).optional().allow('').messages({
    'string.max': '搜索关键词不能超过200个字符'
  }),
  tags: Joi.alternatives().try(
    Joi.string().pattern(/^\d+(,\d+)*$/).optional(),
    Joi.array().items(Joi.number().integer().positive()).optional()
  ).messages({
    'string.pattern.base': '标签参数格式错误，应为数字或逗号分隔的数字'
  }),
  fileType: Joi.string().valid('image', 'document', 'spreadsheet', 'presentation', 'text').optional(),
  mimeType: Joi.string().max(100).optional(),
  isPublic: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('relevance', 'created_at', 'file_size', 'view_count', 'download_count').default('relevance'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

const suggestionsQuerySchema = Joi.object({
  q: Joi.string().max(100).optional().allow(''),
  limit: Joi.number().integer().min(1).max(20).default(10)
});

// 文档搜索接口
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = searchQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    // 处理tags参数
    let tags: number[] = [];
    if (value.tags) {
      if (typeof value.tags === 'string') {
        tags = value.tags.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
      } else if (Array.isArray(value.tags)) {
        tags = value.tags;
      }
    }

    // 构建搜索参数
    const searchParams: SearchParams = {
      q: value.q,
      tags: tags.length > 0 ? tags : undefined,
      fileType: value.fileType,
      mimeType: value.mimeType,
      isPublic: value.isPublic,
      userId: req.user?.userId ? Number(req.user.userId) : undefined,
      page: value.page,
      pageSize: value.pageSize,
      sortBy: value.sortBy,
      sortOrder: value.sortOrder,
      startDate: value.startDate ? value.startDate.toISOString() : undefined,
      endDate: value.endDate ? value.endDate.toISOString() : undefined
    };

    // 执行搜索
    const result = await SearchService.searchDocuments(searchParams);

    return res.status(200).json({
      code: 200,
      message: '搜索成功',
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      code: 500,
      message: '搜索失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 高级搜索接口（包含facets聚合信息）
router.get('/advanced', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = searchQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    // 处理tags参数
    let tags: number[] = [];
    if (value.tags) {
      if (typeof value.tags === 'string') {
        tags = value.tags.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
      } else if (Array.isArray(value.tags)) {
        tags = value.tags;
      }
    }

    // 构建搜索参数
    const searchParams: SearchParams = {
      q: value.q,
      tags: tags.length > 0 ? tags : undefined,
      fileType: value.fileType,
      mimeType: value.mimeType,
      isPublic: value.isPublic,
      userId: req.user?.userId ? Number(req.user.userId) : undefined,
      page: value.page,
      pageSize: value.pageSize,
      sortBy: value.sortBy,
      sortOrder: value.sortOrder,
      startDate: value.startDate ? value.startDate.toISOString() : undefined,
      endDate: value.endDate ? value.endDate.toISOString() : undefined
    };

    // 并行执行搜索和获取facets
    const [searchResult, facets] = await Promise.all([
      SearchService.searchDocuments(searchParams),
      SearchService.getSearchFacets({
        q: searchParams.q,
        userId: searchParams.userId,
        isPublic: searchParams.isPublic
      } as any)
    ]);

    // 组合结果
    const result = {
      ...searchResult,
      facets
    };

    return res.status(200).json({
      code: 200,
      message: '高级搜索成功',
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return res.status(500).json({
      code: 500,
      message: '高级搜索失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 搜索建议接口
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { error, value } = suggestionsQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0]?.message || '参数验证失败',
        timestamp: new Date().toISOString(),
      });
    }

    const suggestions = await SearchService.getSearchSuggestions(value.q, value.limit);

    return res.status(200).json({
      code: 200,
      message: '获取搜索建议成功',
      data: suggestions,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取搜索建议失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 热门搜索关键词接口
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        code: 400,
        message: '限制数量必须在1-50之间',
        timestamp: new Date().toISOString(),
      });
    }

    const keywords = await SearchService.getPopularSearchKeywords(limit);

    return res.status(200).json({
      code: 200,
      message: '获取热门搜索关键词成功',
      data: {
        keywords,
        count: keywords.length
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get popular keywords error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取热门搜索关键词失败',
      timestamp: new Date().toISOString(),
    });
  }
});

// 搜索统计接口（管理员可用）
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '需要管理员权限',
        timestamp: new Date().toISOString(),
      });
    }

    // 简单的搜索统计，实际项目中可能需要专门的搜索日志表
    const stats = {
      totalDocuments: 0,
      publicDocuments: 0,
      privateDocuments: 0,
      totalTags: 0,
      avgDocumentSize: 0,
      lastIndexUpdate: new Date().toISOString()
    };

    // 这里可以添加具体的统计逻辑

    return res.status(200).json({
      code: 200,
      message: '获取搜索统计成功',
      data: stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get search stats error:', error);
    return res.status(500).json({
      code: 500,
      message: '获取搜索统计失败',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
