import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from './responseHandler';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // 数据库错误
  if (error.message.includes('SQLITE') || error.message.includes('database')) {
    const response: ApiResponse = {
      code: 500,
      message: '数据库操作失败',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
    return;
  }

  // JWT错误
  if (error.message.includes('jwt') || error.message.includes('token')) {
    const response: ApiResponse = {
      code: 401,
      message: '认证失败，请重新登录',
      timestamp: new Date().toISOString(),
    };
    res.status(401).json(response);
    return;
  }

  // 文件上传错误
  if (error.message.includes('Multipart') || error.message.includes('file')) {
    const response: ApiResponse = {
      code: 400,
      message: '文件上传失败',
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(response);
    return;
  }

  // 通用错误处理
  const statusCode = error.status || 500;
  const message = error.message || '服务器内部错误';

  const response: ApiResponse = {
    code: statusCode,
    message: process.env.NODE_ENV === 'development' ? message : '服务器内部错误',
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};
