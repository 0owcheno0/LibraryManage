import { Request, Response, NextFunction } from 'express';
import { jwtUtils, TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    const decoded = jwtUtils.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: '认证失败，请重新登录',
      timestamp: new Date().toISOString()
    });
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      code: 401,
      message: '需要认证才能访问此资源',
      timestamp: new Date().toISOString()
    });
    return;
  }
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = jwtUtils.extractTokenFromHeader(authHeader);
      const decoded = jwtUtils.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};