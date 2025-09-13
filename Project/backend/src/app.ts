import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { responseHandler } from './middleware/responseHandler';

// 导入路由
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import tagRoutes from './routes/tags';
import userRoutes from './routes/users';
import searchRoutes from './routes/search';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// 基础中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(compression()); // 响应压缩
app.use(morgan('combined')); // 请求日志
app.use(express.json({ limit: '50mb' })); // JSON解析
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL编码解析

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 响应格式化中间件
app.use(responseHandler);

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/search', searchRoutes);

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.success('API服务运行正常', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

export { app, PORT };