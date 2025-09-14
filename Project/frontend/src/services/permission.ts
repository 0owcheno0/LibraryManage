import { createAuthenticatedAxios } from './api/config';
import { ApiResponse } from '../types';

class PermissionService {
  private readonly api = createAuthenticatedAxios();

  // 添加用户权限
  async addPermission(documentId: number, userId: number, permission: string): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>(`/documents/${documentId}/permissions`, {
      userId,
      permission,
    });
    return response.data.data;
  }

  // 移除用户权限
  async removePermission(documentId: number, userId: number): Promise<void> {
    await this.api.delete(`/documents/${documentId}/permissions/${userId}`);
  }

  // 获取文档权限列表
  async getDocumentPermissions(documentId: number): Promise<any[]> {
    const response = await this.api.get<ApiResponse<any>>(`/documents/${documentId}/permissions`);
    return response.data.data.permissions;
  }

  // 设置文档公开/私有状态
  async setDocumentPublic(documentId: number, isPublic: boolean): Promise<void> {
    await this.api.put(`/documents/${documentId}/public`, {
      isPublic: isPublic ? 1 : 0,
    });
  }

  // 生成分享链接
  async generateShareLink(
    documentId: number,
    expiresAt: string,
    password?: string,
    downloadLimit?: number,
  ): Promise<{ shareToken: string; shareUrl: string }> {
    const response = await this.api.post<ApiResponse<{ shareToken: string; shareUrl: string }>>(
      `/documents/${documentId}/share`,
      {
        expiresAt,
        password,
        downloadLimit,
      },
    );
    return response.data.data;
  }
}

export const permissionService = new PermissionService();
export default PermissionService;