import { Request, Response } from 'express';
import { ApiResponse } from './responseHandler';

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    code: 404,
    message: `接口 ${req.method} ${req.url} 未找到`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
};
