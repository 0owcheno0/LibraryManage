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
      success<T>(message: string, data?: T): void;
      error(message: string, code?: number): void;
    }
  }
}

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // 成功响应
  res.success = function <T>(message: string, data?: T) {
    const response: ApiResponse<T> = {
      code: 200,
      message,
      timestamp: new Date().toISOString(),
      ...(data !== undefined && { data }),
    };
    this.status(200).json(response);
  };

  // 错误响应
  res.error = function (message: string, code: number = 400) {
    const response: ApiResponse = {
      code,
      message,
      timestamp: new Date().toISOString(),
    };
    this.status(code).json(response);
  };

  next();
};
