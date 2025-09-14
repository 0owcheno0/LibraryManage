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

  // 检查用户是否为文档所有者
  const isDocumentOwner = (document: Document): boolean => {
    return isAuthenticated && user && document.created_by === user.id;
  };

  // 检查用户是否可以编辑文档
  const canEditDocument = (document: Document): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // 管理员可以编辑所有文档
    if (user.role === 'admin') return true;
    
    // 文档所有者可以编辑
    return document.created_by === user.id;
  };

  // 检查用户是否可以删除文档
  const canDeleteDocument = (document: Document): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // 管理员可以删除所有文档
    if (user.role === 'admin') return true;
    
    // 文档所有者可以删除
    return document.created_by === user.id;
  };

  // 获取文档权限信息
  const getDocumentPermissions = (document: Document) => {
    return {
      isOwner: isAuthenticated && user && document.created_by === user.id,
      canEdit: canEditDocument(document),
      canDelete: canDeleteDocument(document),
      canShare: isAuthenticated && (user.role === 'admin' || document.created_by === user.id),
    };
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

  return {
    // 角色检查
    hasRole,
    isAdmin,
    isEditor,
    
    // 文档权限检查
    canEditDocument,
    canDeleteDocument,
    canUploadDocument,
    canManageDocuments,
    
    // 综合权限获取
    getDocumentPermissions,
    
    // 当前用户信息
    currentUser: user,
    isAuthenticated,
  };
};

export default usePermission;