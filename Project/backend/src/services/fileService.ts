import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getFriendlyFileType, formatFileSize } from '../middleware/upload';

export interface FileMetadata {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  md5Hash: string;
  friendlyType: string;
  formattedSize: string;
}

export interface UploadedFileInfo {
  file: Express.Multer.File;
  metadata: FileMetadata;
  isDuplicate: boolean;
  existingDocumentId?: number | undefined;
}

export class FileService {
  
  /**
   * 计算文件的MD5哈希值
   */
  static calculateMD5Hash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 验证文件是否存在且可读
   */
  static validateFileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取文件的详细信息和安全检查
   */
  static async analyzeUploadedFile(file: Express.Multer.File): Promise<FileMetadata> {
    if (!this.validateFileExists(file.path)) {
      throw new Error('上传的文件不存在或无法访问');
    }

    // 计算MD5哈希
    const md5Hash = await this.calculateMD5Hash(file.path);

    // 获取实际文件大小（防止客户端伪造）
    const actualFileSize = fs.statSync(file.path).size;

    // 验证文件大小一致性
    if (actualFileSize !== file.size) {
      console.warn(`文件大小不一致: 报告 ${file.size} bytes, 实际 ${actualFileSize} bytes`);
    }

    const metadata: FileMetadata = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: actualFileSize,
      mimetype: file.mimetype,
      md5Hash,
      friendlyType: getFriendlyFileType(file.mimetype),
      formattedSize: formatFileSize(actualFileSize),
    };

    return metadata;
  }

  /**
   * 检查文件是否已存在（通过MD5哈希）
   */
  static async checkDuplicateFile(md5Hash: string): Promise<{ isDuplicate: boolean; existingDocumentId?: number }> {
    try {
      const { DocumentModel } = await import('../models/Document');
      const existingDocument = await DocumentModel.findByFileHash(md5Hash);
      
      if (existingDocument) {
        return {
          isDuplicate: true,
          existingDocumentId: existingDocument.id
        };
      }
      
      return { isDuplicate: false };
    } catch (error) {
      console.error('检查重复文件失败:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * 处理上传的文件
   */
  static async processUploadedFile(file: Express.Multer.File): Promise<UploadedFileInfo> {
    try {
      // 分析文件元数据
      const metadata = await this.analyzeUploadedFile(file);
      
      // 检查重复文件
      const { isDuplicate, existingDocumentId } = await this.checkDuplicateFile(metadata.md5Hash);

      return {
        file,
        metadata,
        isDuplicate,
        existingDocumentId,
      };
    } catch (error) {
      console.error('处理上传文件时出错:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (this.validateFileExists(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 移动文件到新位置
   */
  static async moveFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      // 确保目标目录存在
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.renameSync(sourcePath, targetPath);
      return true;
    } catch (error) {
      console.error('移动文件失败:', error);
      return false;
    }
  }

  /**
   * 获取文件信息（不读取内容）
   */
  static getFileInfo(filePath: string): { exists: boolean; size?: number; mtime?: Date } {
    try {
      if (!fs.existsSync(filePath)) {
        return { exists: false };
      }

      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * 生成安全的文件下载路径
   */
  static generateSafeDownloadPath(filename: string): string {
    // 移除或替换不安全的字符
    const safeFilename = filename.replace(/[<>:"|?*]/g, '_').replace(/\.\./g, '_');
    return safeFilename;
  }

  /**
   * 验证文件类型是否与扩展名匹配
   */
  static validateFileTypeConsistency(file: Express.Multer.File): { isValid: boolean; message?: string } {
    const expectedExtension = path.extname(file.originalname).toLowerCase();
    
    // 基本的MIME类型与扩展名对应关系检查
    const mimeToExtension: Record<string, string[]> = {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    };

    const allowedExtensions = mimeToExtension[file.mimetype];
    if (allowedExtensions && !allowedExtensions.includes(expectedExtension)) {
      return {
        isValid: false,
        message: `文件扩展名 ${expectedExtension} 与文件类型 ${file.mimetype} 不匹配`
      };
    }

    return { isValid: true };
  }

  /**
   * 清理临时文件
   */
  static async cleanupTempFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        if (this.validateFileExists(filePath)) {
          await this.deleteFile(filePath);
        }
      } catch (error) {
        console.error(`清理临时文件 ${filePath} 失败:`, error);
      }
    }
  }

  /**
   * 获取上传目录的磁盘使用情况
   */
  static getStorageInfo(uploadPath: string): { totalSize: number; fileCount: number } {
    try {
      const files = fs.readdirSync(uploadPath, { withFileTypes: true });
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(uploadPath, file.name);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fileCount++;
        }
      }

      return { totalSize, fileCount };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { totalSize: 0, fileCount: 0 };
    }
  }
}