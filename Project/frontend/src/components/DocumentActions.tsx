import React, { useState } from 'react';
import {
  Button,
  Space,
  Dropdown,
  message,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { useThemeColors } from '../contexts/ThemeContext';
import { documentService } from '../services/document';
import { ErrorHandler } from '../utils/errorHandler';
import { ConfirmDialog } from './ConfirmDialog';
import DownloadButton from './DownloadButton';
import type { Document } from '../types';

interface DocumentActionsProps {
  document: Document;
  onUpdate?: () => void;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'compact';
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  onUpdate,
  size = 'small',
  type = 'default',
}) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { canEditDocument, canDeleteDocument, canViewDocument } = usePermission();
  const [loading, setLoading] = useState<{
    delete: boolean;
  }>({
    delete: false,
  });

  // 使用权限 hook 检查权限
  const canEdit = canEditDocument(document);
  const canDelete = canDeleteDocument(document);
  const canView = canViewDocument(document);

  // 查看文档
  const handleView = async () => {
    try {
      // 增加浏览次数
      await documentService.incrementViewCount(document.id);
      navigate(`/documents/${document.id}`);
    } catch (error) {
      console.error('查看文档失败:', error);
      // 即使增加浏览次数失败，也允许查看文档
      navigate(`/documents/${document.id}`);
    }
  };

  // 编辑文档
  const handleEdit = () => {
    navigate(`/documents/${document.id}/edit`);
  };

  // 下载文档 - 使用新的DownloadButton组件
  const handleDownload = () => {
    // 这个方法现在由DownloadButton组件处理
  };

  // 删除文档
  const handleDelete = () => {
    ConfirmDialog.deleteDocument({
      documentTitle: document.title,
      onConfirm: async () => {
        setLoading(prev => ({ ...prev, delete: true }));
        try {
          await documentService.deleteDocument(document.id);
          ErrorHandler.showSuccess('文档删除成功');
          onUpdate?.();
        } catch (error) {
          console.error('删除失败:', error);
          ErrorHandler.handleAndShowApiError(error, '删除失败，请重试');
        } finally {
          setLoading(prev => ({ ...prev, delete: false }));
        }
      },
    });
  };

  // 紧凑模式（下拉菜单）
  if (type === 'compact') {
    const menuItems: MenuProps['items'] = [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
        onClick: handleView,
      },
      {
        key: 'download',
        label: '下载',
        icon: <DownloadOutlined />,
        onClick: handleDownload,
      },
      ...(canEdit ? [{
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: handleEdit,
      }] : []),
      ...(canDelete ? [
        { type: 'divider' as const },
        {
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined />,
          onClick: handleDelete,
          danger: true,
          disabled: loading.delete,
        },
      ] : []),
    ];

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button size={size} icon={<MoreOutlined />} />
      </Dropdown>
    );
  }

  // 默认模式（按钮组）
  return (
    <Space size="small">
      <Tooltip title="查看详情">
        <Button
          size={size}
          icon={<EyeOutlined />}
          onClick={handleView}
        />
      </Tooltip>

      <Tooltip title="下载文档">
        <DownloadButton
          document={document}
          size={size}
          type="default"
          onDownloadSuccess={() => {
            ErrorHandler.showSuccess('下载成功');
          }}
        />
      </Tooltip>

      {canEdit && (
        <Tooltip title="编辑文档">
          <Button
            size={size}
            icon={<EditOutlined />}
            onClick={handleEdit}
          />
        </Tooltip>
      )}

      {canDelete && (
        <Tooltip title="删除文档">
          <Button
            size={size}
            icon={<DeleteOutlined />}
            danger
            loading={loading.delete}
            onClick={handleDelete}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default DocumentActions;