import { message } from 'antd';
import type { AxiosError } from 'axios';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',           // 网络错误
  PERMISSION = 'PERMISSION',     // 权限错误
  VALIDATION = 'VALIDATION',     // 验证错误
  SERVER = 'SERVER',            // 服务器错误
  NOT_FOUND = 'NOT_FOUND',      // 资源不存在
  TIMEOUT = 'TIMEOUT',          // 请求超时
  UNKNOWN = 'UNKNOWN',          // 未知错误
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string | number;
  details?: any;
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  /**
   * 处理API错误
   */
  static handleApiError(error: AxiosError | any): ErrorInfo {
    let errorInfo: ErrorInfo;

    if (error.response) {
      // 服务器响应错误
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorInfo = {
            type: ErrorType.VALIDATION,
            message: data?.message || '请求参数错误',
            code: status,
            originalError: error,
            details: data,
          };
          break;
        case 401:
          errorInfo = {
            type: ErrorType.PERMISSION,
            message: '登录已过期，请重新登录',
            code: status,
            originalError: error,
          };
          break;
        case 403:
          errorInfo = {
            type: ErrorType.PERMISSION,
            message: data?.message || '您没有权限执行此操作',
            code: status,
            originalError: error,
          };
          break;
        case 404:
          errorInfo = {
            type: ErrorType.NOT_FOUND,
            message: data?.message || '请求的资源不存在',
            code: status,
            originalError: error,
          };
          break;
        case 408:
          errorInfo = {
            type: ErrorType.TIMEOUT,
            message: '请求超时，请稍后重试',
            code: status,
            originalError: error,
          };
          break;
        case 413:
          errorInfo = {
            type: ErrorType.VALIDATION,
            message: '文件大小超出限制',
            code: status,
            originalError: error,
          };
          break;
        case 422:
          errorInfo = {
            type: ErrorType.VALIDATION,
            message: data?.message || '数据验证失败',
            code: status,
            originalError: error,
            details: data?.errors || data?.details,
          };
          break;
        case 429:
          errorInfo = {
            type: ErrorType.SERVER,
            message: '请求过于频繁，请稍后重试',
            code: status,
            originalError: error,
          };
          break;
        case 500:
          errorInfo = {
            type: ErrorType.SERVER,
            message: '服务器内部错误，请稍后重试',
            code: status,
            originalError: error,
          };
          break;
        case 502:
        case 503:
        case 504:
          errorInfo = {
            type: ErrorType.SERVER,
            message: '服务暂时不可用，请稍后重试',
            code: status,
            originalError: error,
          };
          break;
        default:
          errorInfo = {
            type: ErrorType.SERVER,
            message: data?.message || `服务器错误 (${status})`,
            code: status,
            originalError: error,
          };
      }
    } else if (error.request) {
      // 网络错误
      errorInfo = {
        type: ErrorType.NETWORK,
        message: '网络连接失败，请检查网络设置',
        originalError: error,
      };
    } else {
      // 其他错误
      errorInfo = {
        type: ErrorType.UNKNOWN,
        message: error.message || '发生未知错误',
        originalError: error,
      };
    }

    return errorInfo;
  }

  /**
   * 显示错误消息
   */
  static showError(errorInfo: ErrorInfo | string, duration = 4) {
    if (typeof errorInfo === 'string') {
      message.error(errorInfo, duration);
      return;
    }

    const { type, message: errorMessage } = errorInfo;

    // 根据错误类型设置不同的图标和样式
    switch (type) {
      case ErrorType.NETWORK:
        message.error({
          content: `🌐 ${errorMessage}`,
          duration,
        });
        break;
      case ErrorType.PERMISSION:
        message.error({
          content: `🔒 ${errorMessage}`,
          duration,
        });
        break;
      case ErrorType.VALIDATION:
        message.error({
          content: `⚠️ ${errorMessage}`,
          duration,
        });
        break;
      case ErrorType.NOT_FOUND:
        message.error({
          content: `🔍 ${errorMessage}`,
          duration,
        });
        break;
      case ErrorType.TIMEOUT:
        message.error({
          content: `⏰ ${errorMessage}`,
          duration,
        });
        break;
      case ErrorType.SERVER:
        message.error({
          content: `🚨 ${errorMessage}`,
          duration,
        });
        break;
      default:
        message.error(errorMessage, duration);
    }
  }

  /**
   * 处理并显示API错误
   */
  static handleAndShowApiError(error: any, customMessage?: string) {
    const errorInfo = this.handleApiError(error);
    
    if (customMessage) {
      this.showError(customMessage);
    } else {
      this.showError(errorInfo);
    }
    
    // 记录错误到控制台（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorInfo);
    }
    
    return errorInfo;
  }

  /**
   * 处理文件上传错误
   */
  static handleUploadError(error: any): ErrorInfo {
    const errorInfo = this.handleApiError(error);
    
    // 为上传错误提供更友好的提示
    if (errorInfo.type === ErrorType.VALIDATION) {
      if (errorInfo.code === 413) {
        errorInfo.message = '文件大小超出限制，请选择较小的文件';
      } else if (errorInfo.message.includes('type')) {
        errorInfo.message = '文件类型不支持，请选择其他格式';
      }
    } else if (errorInfo.type === ErrorType.NETWORK) {
      errorInfo.message = '文件上传失败，请检查网络连接';
    }
    
    return errorInfo;
  }

  /**
   * 处理下载错误
   */
  static handleDownloadError(error: any): ErrorInfo {
    const errorInfo = this.handleApiError(error);
    
    // 为下载错误提供更友好的提示
    if (errorInfo.type === ErrorType.NOT_FOUND) {
      errorInfo.message = '文件不存在或已被删除';
    } else if (errorInfo.type === ErrorType.PERMISSION) {
      errorInfo.message = '您没有权限下载此文件';
    } else if (errorInfo.type === ErrorType.NETWORK) {
      errorInfo.message = '文件下载失败，请检查网络连接';
    }
    
    return errorInfo;
  }

  /**
   * 显示成功消息
   */
  static showSuccess(msg: string, duration = 3) {
    message.success(msg, duration);
  }

  /**
   * 显示警告消息
   */
  static showWarning(msg: string, duration = 4) {
    message.warning(msg, duration);
  }

  /**
   * 显示信息消息
   */
  static showInfo(msg: string, duration = 3) {
    message.info(msg, duration);
  }

  /**
   * 显示加载消息
   */
  static showLoading(content = '处理中...', duration = 0) {
    return message.loading(content, duration);
  }

  /**
   * 处理权限错误（可能需要重定向到登录页）
   */
  static handlePermissionError(error: any, redirectToLogin?: () => void) {
    const errorInfo = this.handleApiError(error);
    
    if (errorInfo.code === 401 && redirectToLogin) {
      // Token过期，重定向到登录页
      setTimeout(() => {
        redirectToLogin();
      }, 1500);
    }
    
    this.showError(errorInfo);
    return errorInfo;
  }

  /**
   * 批量处理错误（用于批量操作）
   */
  static handleBatchErrors(errors: any[], successCount: number, totalCount: number) {
    const errorCount = errors.length;
    
    if (errorCount === 0) {
      this.showSuccess(`操作成功，共处理 ${successCount} 项，总计 ${totalCount} 项`);
    } else if (successCount > 0) {
      this.showWarning(`部分操作成功：成功 ${successCount} 项，失败 ${errorCount} 项，总计 ${totalCount} 项`);
    } else {
      this.showError(`操作失败，共 ${errorCount} 项失败，总计 ${totalCount} 项`);
    }
    
    // 显示具体错误信息
    errors.forEach((error, index) => {
      const errorInfo = this.handleApiError(error);
      console.error(`批量操作错误 ${index + 1}:`, errorInfo);
    });
  }
}

// 导出常用方法的简化版本
export const showError = ErrorHandler.showError.bind(ErrorHandler);
export const showSuccess = ErrorHandler.showSuccess.bind(ErrorHandler);
export const showWarning = ErrorHandler.showWarning.bind(ErrorHandler);
export const showInfo = ErrorHandler.showInfo.bind(ErrorHandler);
export const showLoading = ErrorHandler.showLoading.bind(ErrorHandler);
export const handleApiError = ErrorHandler.handleAndShowApiError.bind(ErrorHandler);

export default ErrorHandler;