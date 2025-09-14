import React from 'react';
import { Card, Space, Tag, Alert, Descriptions } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import type { Document } from '../types';

// 示例文档数据
const exampleDocument: Document = {
  id: 1,
  title: '示例文档',
  description: '这是一个示例文档',
  file_name: 'example.pdf',
  file_path: '/uploads/example.pdf',
  file_size: 1024000,
  mime_type: 'application/pdf',
  file_extension: 'pdf',
  friendly_type: 'PDF文档',
  formatted_size: '1.0 MB',
  is_public: 0, // 私有文档
  created_by: 1,
  creator_name: '张三',
  creator_username: 'zhangsan',
  view_count: 10,
  download_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tag_count: 0
};

/**
 * 权限系统演示页面
 * 展示如何使用权限 hook 进行权限控制
 */
const PermissionDemo: React.FC = () => {
  const { state: authState } = useAuth();
  const {
    hasRole,
    isAdmin,
    isEditor,
    canEditDocument,
    canDeleteDocument,
    canUploadDocument,
    canManageDocuments,
    getDocumentPermissions,
    currentUser,
    isAuthenticated,
  } = usePermission();

  const permissions = getDocumentPermissions(exampleDocument);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="当前用户信息">
          {isAuthenticated ? (
            <Descriptions column={2} size="small">
              <Descriptions.Item label="用户名">
                {currentUser?.username}
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                <Tag color={isAdmin() ? 'red' : isEditor() ? 'blue' : 'green'}>
                  {currentUser?.role || 'viewer'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {currentUser?.email}
              </Descriptions.Item>
              <Descriptions.Item label="姓名">
                {currentUser?.full_name}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Alert
              message="未登录"
              description="请先登录以查看权限信息"
              type="warning"
              showIcon
            />
          )}
        </Card>

        <Card title="角色权限检查">
          <Space wrap>
            <Tag color={hasRole('admin') ? 'success' : 'default'}>
              管理员: {hasRole('admin') ? '是' : '否'}
            </Tag>
            <Tag color={hasRole('editor') ? 'success' : 'default'}>
              编辑者: {hasRole('editor') ? '是' : '否'}
            </Tag>
            <Tag color={hasRole('viewer') ? 'success' : 'default'}>
              查看者: {hasRole('viewer') ? '是' : '否'}
            </Tag>
          </Space>
        </Card>

        <Card title="基础功能权限">
          <Space wrap>
            <Tag color={canUploadDocument() ? 'success' : 'default'}>
              文档上传: {canUploadDocument() ? '允许' : '禁止'}
            </Tag>
            <Tag color={canManageDocuments() ? 'success' : 'default'}>
              文档管理: {canManageDocuments() ? '允许' : '禁止'}
            </Tag>
          </Space>
        </Card>

        <Card 
          title={
            <Space>
              <span>示例文档权限检查</span>
              <Tag color={exampleDocument.is_public ? 'green' : 'orange'}>
                {exampleDocument.is_public ? '公开' : '私有'}
              </Tag>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="文档标题">
                {exampleDocument.title}
              </Descriptions.Item>
              <Descriptions.Item label="创建者ID">
                {exampleDocument.created_by}
              </Descriptions.Item>
              <Descriptions.Item label="是否公开">
                {exampleDocument.is_public ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="当前用户ID">
                {currentUser?.id || '未登录'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4>权限检查结果：</h4>
              <Space wrap>
                <Tag color={permissions.canEdit ? 'success' : 'error'}>
                  编辑: {permissions.canEdit ? '允许' : '禁止'}
                </Tag>
                <Tag color={permissions.canDelete ? 'success' : 'error'}>
                  删除: {permissions.canDelete ? '允许' : '禁止'}
                </Tag>
              </Space>
            </div>

            <div>
              <h4>权限信息：</h4>
              <Space wrap>
                <Tag color={permissions.isOwner ? 'purple' : 'default'}>
                  文档所有者: {permissions.isOwner ? '是' : '否'}
                </Tag>
              </Space>
            </div>
          </Space>
        </Card>

        <Card title="权限系统说明">
          <Space direction="vertical">
            <Alert
              message="权限规则说明"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                  <li><strong>公开文档 (is_public=1):</strong> 任何用户都可以查看和下载</li>
                  <li><strong>私有文档 (is_public=0):</strong> 只有创建者和管理员可以访问</li>
                  <li><strong>文档编辑:</strong> 只有创建者和管理员可以编辑</li>
                  <li><strong>文档删除:</strong> 只有创建者和管理员可以删除</li>
                  <li><strong>管理员角色:</strong> 拥有所有文档的完全权限</li>
                  <li><strong>文档上传:</strong> 需要登录才能上传</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default PermissionDemo;
