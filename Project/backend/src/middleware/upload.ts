import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// 支持的文件类型
export const ALLOWED_MIME_TYPES = {
  // PDF文档
  'application/pdf': '.pdf',
  // Word文档
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  // Excel文档
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  // PowerPoint文档
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  // 文本文件
  'text/plain': '.txt',
  'text/markdown': '.md',
  // 图片文件
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  // 其他常见格式
  'application/rtf': '.rtf',
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
};

// 文件大小限制 (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 104857600 bytes

// 确保上传目录存在
import fs from 'fs';
const uploadDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件存储配置
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // 生成唯一文件名: 时间戳 + 随机数 + 原文件名
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '_');
    const uniqueFilename = `${timestamp}-${randomString}-${sanitizedOriginalName}`;
    
    cb(null, uniqueFilename);
  }
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 检查MIME类型
  if (ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES]) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}。支持的格式: PDF, Word, Excel, PowerPoint, 文本文件, 图片文件`));
  }
};

// 创建multer实例
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 100MB
    files: 1, // 一次只能上传一个文件
  },
});

// 单文件上传中间件
export const uploadSingleDocument = uploadMiddleware.single('file');

// 获取文件扩展名
export const getFileExtension = (mimetype: string): string => {
  return ALLOWED_MIME_TYPES[mimetype as keyof typeof ALLOWED_MIME_TYPES] || '';
};

// 验证文件完整性
export const validateUploadedFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: '请选择要上传的文件' };
  }

  if (file.size === 0) {
    return { isValid: false, error: '文件不能为空' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `文件大小不能超过 ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB` };
  }

  if (!ALLOWED_MIME_TYPES[file.mimetype as keyof typeof ALLOWED_MIME_TYPES]) {
    return { isValid: false, error: '不支持的文件类型' };
  }

  return { isValid: true };
};

// 获取友好的文件类型名称
export const getFriendlyFileType = (mimetype: string): string => {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF文档',
    'application/msword': 'Word文档',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
    'application/vnd.ms-excel': 'Excel表格',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
    'application/vnd.ms-powerpoint': 'PowerPoint演示文稿',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示文稿',
    'text/plain': '文本文档',
    'text/markdown': 'Markdown文档',
    'image/jpeg': 'JPEG图片',
    'image/png': 'PNG图片',
    'image/gif': 'GIF图片',
    'image/webp': 'WebP图片',
    'application/rtf': 'RTF文档',
    'application/zip': 'ZIP压缩包',
    'application/x-rar-compressed': 'RAR压缩包',
  };

  return typeMap[mimetype] || '未知文件类型';
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};