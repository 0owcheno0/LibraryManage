import { Router, Request, Response } from 'express';
import { DocumentDao } from '../dao/documentDao';
import { ShareLinkDao } from '../dao/shareLinkDao';
import { PermissionDao } from '../dao/permissionDao';
import jwt from 'jsonwebtoken';

const router = Router();

// 通过分享链接访问文档
router.get('/:shareToken', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    
    if (!shareToken) {
      return res.error('无效的分享链接', 400);
    }

    // 查找分享链接
    const shareLink = await ShareLinkDao.findByToken(shareToken);
    if (!shareLink) {
      return res.error('分享链接不存在或已失效', 404);
    }

    // 验证分享链接是否有效
    const isValid = await ShareLinkDao.isShareLinkValid(shareToken);
    if (!isValid) {
      return res.error('分享链接已过期或达到下载限制', 400);
    }

    // 检查文档是否存在
    const document = await DocumentDao.getDocumentById(shareLink.document_id);
    if (!document) {
      return res.error('文档不存在或已被删除', 404);
    }

    // 检查是否需要密码
    if (shareLink.password_hash) {
      const { password } = req.query;
      if (!password) {
        return res.error('此分享链接需要密码访问', 401);
      }
      
      // 这里应该验证密码哈希
      // 暂时跳过验证
    }

    // 返回文档信息
    res.success('获取文档成功', { document });
  } catch (error) {
    console.error('通过分享链接访问文档失败:', error);
    res.error('访问文档失败', 500);
  }
});

export default router;