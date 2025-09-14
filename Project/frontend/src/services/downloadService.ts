import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { message } from 'antd';
import { createAuthenticatedAxios } from './api/config';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  estimatedTime?: number; // seconds remaining
}

export interface DownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
  onStart?: () => void;
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

class DownloadService {
  private downloadTasks: Map<number, CancelTokenSource> = new Map();
  
  /**
   * 下载文档
   * @param documentId 文档ID
   * @param options 下载选项
   */
  async downloadDocument(documentId: number, options: DownloadOptions = {}): Promise<void> {
    const {
      onProgress,
      onStart,
      onSuccess,
      onError,
      timeout = 30000 // 30秒超时
    } = options;

    // 检查是否已经在下载
    if (this.downloadTasks.has(documentId)) {
      message.warning('该文档正在下载中，请稍候');
      return;
    }

    // 创建取消令牌
    const cancelTokenSource = axios.CancelToken.source();
    this.downloadTasks.set(documentId, cancelTokenSource);

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    try {
      onStart?.();

      // 使用带认证的axios实例
      const api = createAuthenticatedAxios();
      
      // 修改baseURL以匹配后端API
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      
      const response = await api.get(
        `${baseURL}/documents/${documentId}/download`,
        {
          responseType: 'blob',
          timeout,
          cancelToken: cancelTokenSource.token,
          // Axios responseType: 'blob'
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            const { loaded, total } = progressEvent;
            if (total && onProgress) {
              const currentTime = Date.now();
              const timeElapsed = (currentTime - lastTime) / 1000;
              const bytesLoaded = loaded - lastLoaded;
              
              // 计算下载速度 (bytes per second)
              const speed = timeElapsed > 0 ? bytesLoaded / timeElapsed : 0;
              
              // 估算剩余时间 (seconds)
              const remaining = total - loaded;
              const estimatedTime = speed > 0 ? remaining / speed : 0;
              
              const progress: DownloadProgress = {
                loaded,
                total,
                percentage: Math.round((loaded / total) * 100),
                speed: Math.round(speed),
                estimatedTime: Math.round(estimatedTime),
              };

              onProgress(progress);
              
              lastLoaded = loaded;
              lastTime = currentTime;
            }
          },
        }
      );

      // 从响应头获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document_${documentId}`;

      if (contentDisposition) {
        // 优先解析 filename*=UTF-8''格式
        const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
        if (utf8FilenameMatch) {
          filename = decodeURIComponent(utf8FilenameMatch[1]);
        } else {
          // 回退到普通 filename= 格式
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
            // 如果是URL编码，尝试解码
            try {
              filename = decodeURIComponent(filename);
            } catch (e) {
              // 解码失败，使用原始文件名
            }
          }
        }
      }

      // 文件保存: URL.createObjectURL()
      this.saveFile(response.data, filename);
      
      onSuccess?.(filename);
      message.success(`文件 "${filename}" 下载成功`);

    } catch (error) {
      if (axios.isCancel(error)) {
        message.info('下载已取消');
      } else {
        console.error('下载失败:', error);
        const errorMessage = this.getErrorMessage(error);
        message.error(errorMessage);
        onError?.(error as Error);
      }
    } finally {
      // 清理下载任务
      this.downloadTasks.delete(documentId);
    }
  }

  /**
   * 保存文件到本地
   */
  private saveFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 取消下载
   */
  cancelDownload(documentId: number): void {
    const cancelTokenSource = this.downloadTasks.get(documentId);
    if (cancelTokenSource) {
      cancelTokenSource.cancel('用户取消下载');
      this.downloadTasks.delete(documentId);
    }
  }

  /**
   * 检查是否正在下载
   */
  isDownloading(documentId: number): boolean {
    return this.downloadTasks.has(documentId);
  }

  /**
   * 获取所有正在下载的文档ID
   */
  getDownloadingDocuments(): number[] {
    return Array.from(this.downloadTasks.keys());
  }

  /**
   * 重试下载 - 错误处理和重试机制
   */
  async retryDownload(
    documentId: number, 
    options: DownloadOptions = {}, 
    maxRetries: number = 3
  ): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        await this.downloadDocument(documentId, {
          ...options,
          onError: (error) => {
            lastError = error;
            options.onError?.(error);
          }
        });
        return; // 成功，退出重试循环
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt < maxRetries) {
          message.warning(`下载失败，正在重试 (${attempt}/${maxRetries})`);
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // 所有重试都失败
    const errorMessage = `下载失败，已重试 ${maxRetries} 次：${this.getErrorMessage(lastError)}`;
    message.error(errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * 批量下载
   */
  async downloadMultiple(
    documentIds: number[], 
    options: DownloadOptions & { 
      onBatchProgress?: (completed: number, total: number) => void;
      concurrency?: number; 
    } = {}
  ): Promise<void> {
    const { onBatchProgress, concurrency = 2 } = options;
    let completed = 0;
    const total = documentIds.length;

    // 分批下载，控制并发数
    for (let i = 0; i < documentIds.length; i += concurrency) {
      const batch = documentIds.slice(i, i + concurrency);
      
      await Promise.allSettled(
        batch.map(async (documentId) => {
          try {
            await this.downloadDocument(documentId, {
              ...options,
              onStart: () => {
                message.info(`开始下载文档 ${documentId}`);
              },
              onSuccess: (filename) => {
                completed++;
                onBatchProgress?.(completed, total);
                message.success(`文档 "${filename}" 下载完成 (${completed}/${total})`);
              },
            });
          } catch (error) {
            completed++;
            onBatchProgress?.(completed, total);
            message.error(`文档 ${documentId} 下载失败`);
          }
        })
      );
    }

    message.success(`批量下载完成！成功下载 ${completed} 个文档`);
  }

  /**
   * 获取错误信息
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return '下载超时，请检查网络连接';
      }
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return '未授权，请重新登录';
          case 403:
            return '无权限下载此文档';
          case 404:
            return '文档不存在或已被删除';
          case 500:
            return '服务器错误，请稍后重试';
          default:
            return error.response.data?.message || '下载失败';
        }
      }
      return '网络错误，请检查网络连接';
    }
    return error?.message || '未知错误';
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 格式化下载速度
   */
  static formatSpeed(bytesPerSecond: number): string {
    return this.formatFileSize(bytesPerSecond) + '/s';
  }

  /**
   * 格式化剩余时间
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  }
}

export const downloadService = new DownloadService();
export default DownloadService;