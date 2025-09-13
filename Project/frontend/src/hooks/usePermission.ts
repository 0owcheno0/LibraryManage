import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types/document';

/**
 * 权限管理 Hook
 * 提供各种权限检查功能
 */
export const usePermission = () => {
  const { state: authState } = useAuth();
  const { user, isAuthenticated } = authState;

  /**
   * 检查用户是否拥有指定角色
   * @param role 角色名称
   * @returns 是否拥有该角色
   */
  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return user.role === role;
  };

  /**
   * 检查是否为管理员
   * @returns 是否为管理员
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * 检查是否为编辑者
   * @returns 是否为编辑者
   */
  const isEditor = (): boolean => {
    return hasRole('editor');
  };

  /**
   * 检查用户是否可以编辑文档
   * 权限规则：
   * 1. 管理员可以编辑所有文档
   * 2. 文档创建者可以编辑自己的文档
   * @param document 文档对象
   * @returns 是否可以编辑
   */
  const canEditDocument = (document: Document): boolean => {
    if (!isAuthenticated || !user || !document) {
      return false;
    }

    // 管理员拥有所有权限
    if (isAdmin()) {
      return true;
    }

    // 检查是否为文档创建者
    return document.upload_user_id === user.id;
  };

  /**
   * 检查用户是否可以删除文档
   * 权限规则与编辑相同：
   * 1. 管理员可以删除所有文档
   * 2. 文档创建者可以删除自己的文档
   * @param document 文档对象
   * @returns 是否可以删除
   */
  const canDeleteDocument = (document: Document): boolean => {
    if (!isAuthenticated || !user || !document) {
      return false;
    }

    // 管理员拥有所有权限
    if (isAdmin()) {
      return true;
    }

    // 检查是否为文档创建者
    return document.upload_user_id === user.id;
  };

  /**
   * 检查用户是否可以查看文档
   * 权限规则：
   * 1. 公开文档（is_public=1）任何人都可以查看
   * 2. 私有文档（is_public=0）只有创建者和管理员可以查看
   * @param document 文档对象
   * @returns 是否可以查看
   */
  const canViewDocument = (document: Document): boolean => {
    if (!document) {
      return false;
    }

    // 公开文档任何人都可以查看
    if (document.is_public === 1) {
      return true;
    }

    // 私有文档需要登录验证
    if (!isAuthenticated || !user) {
      return false;
    }

    // 管理员可以查看所有文档
    if (isAdmin()) {
      return true;
    }

    // 文档创建者可以查看自己的文档
    return document.upload_user_id === user.id;
  };

  /**
   * 检查用户是否可以下载文档
   * 权限规则与查看相同：
   * 1. 公开文档任何人都可以下载
   * 2. 私有文档只有创建者和管理员可以下载
   * @param document 文档对象
   * @returns 是否可以下载
   */
  const canDownloadDocument = (document: Document): boolean => {
    return canViewDocument(document);
  };

  /**
   * 检查用户是否可以上传文档
   * 权限规则：
   * 1. 需要登录
   * @returns 是否可以上传
   */
  const canUploadDocument = (): boolean => {
    return isAuthenticated;
  };

  /**
   * 检查用户是否可以管理文档
   * 权限规则：
   * 1. 只有管理员可以管理所有文档
   * @returns 是否可以管理
   */
  const canManageDocuments = (): boolean => {
    return isAdmin();
  };

  /**
   * 检查用户是否可以修改文档权限（公开/私有状态）
   * 权限规则：
   * 1. 管理员可以修改所有文档的权限
   * 2. 文档创建者可以修改自己文档的权限
   * @param document 文档对象
   * @returns 是否可以修改权限
   */
  const canChangeDocumentPermission = (document: Document): boolean => {
    return canEditDocument(document);
  };

  /**
   * 获取用户对文档的权限摘要
   * @param document 文档对象
   * @returns 权限摘要对象
   */
  const getDocumentPermissions = (document: Document) => {
    return {
      canView: canViewDocument(document),
      canEdit: canEditDocument(document),
      canDelete: canDeleteDocument(document),
      canDownload: canDownloadDocument(document),
      canChangePermission: canChangeDocumentPermission(document),
      isOwner: isAuthenticated && user && document.upload_user_id === user.id,
      isAdmin: isAdmin(),
    };
  };

  return {
    // 角色检查
    hasRole,
    isAdmin,
    isEditor,
    
    // 文档权限检查
    canViewDocument,
    canEditDocument,
    canDeleteDocument,
    canDownloadDocument,
    canUploadDocument,
    canManageDocuments,
    canChangeDocumentPermission,
    
    // 综合权限获取
    getDocumentPermissions,
    
    // 当前用户信息
    currentUser: user,
    isAuthenticated,
  };
};

export default usePermission;