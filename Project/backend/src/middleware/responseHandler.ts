import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
}

// 扩展Response类型以添加自定义方法
declare global {
  namespace Express {
    interface Response {
      success<T>(message: string, data?: T, statusCode?: number): void;
      error<T>(message: string, code?: number, data?: T): void;
    }
  }
}

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // 成功响应
  res.success = function <T>(message: string, data?: T, statusCode: number = 200) {
    const response: ApiResponse<T> = {
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
      ...(data !== undefined && { data }),
    };
    this.status(statusCode).json(response);
  };

  // 错误响应
  res.error = function <T>(message: string, code: number = 400, data?: T) {
    const response: ApiResponse<T> = {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(data !== undefined && { data }),
    };
    this.status(code).json(response);
  };

  next();
};
