import React from 'react';
import { Modal, Typography, Space } from 'antd';
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface ConfirmDialogOptions {
  title: string;
  content: string;
  type?: 'delete' | 'warning' | 'info';
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onOk?: () => Promise<void> | void;
  onCancel?: () => void;
}

/**
 * 操作确认对话框工具类
 */
export class ConfirmDialog {
  /**
   * 显示删除确认对话框
   */
  static delete(options: {
    title: string;
    content: string;
    itemName?: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { title, content, itemName, onConfirm, onCancel } = options;
    
    Modal.confirm({
      title: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          {title}
        </Space>
      ),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>{content}</p>
          {itemName && (
            <Text strong style={{ color: '#ff4d4f' }}>
              "{itemName}"
            </Text>
          )}
          <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>
            此操作不可撤销，删除后将无法恢复。
          </p>
        </div>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: onConfirm,
      onCancel,
    });
  }

  /**
   * 显示文档删除确认对话框
   */
  static deleteDocument(options: {
    documentTitle: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { documentTitle, onConfirm, onCancel } = options;
    
    this.delete({
      title: '删除文档',
      content: '确定要删除此文档吗？',
      itemName: documentTitle,
      onConfirm,
      onCancel,
    });
  }

  /**
   * 显示批量删除确认对话框
   */
  static batchDelete(options: {
    count: number;
    itemType: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { count, itemType, onConfirm, onCancel } = options;
    
    Modal.confirm({
      title: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          批量删除{itemType}
        </Space>
      ),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要删除选中的 <Text strong style={{ color: '#ff4d4f' }}>{count}</Text> 个{itemType}吗？</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>
            此操作不可撤销，删除后将无法恢复。
          </p>
        </div>
      ),
      okText: `确认删除 ${count} 个${itemType}`,
      okType: 'danger',
      cancelText: '取消',
      centered: true,
      onOk: onConfirm,
      onCancel,
    });
  }

  /**
   * 显示警告确认对话框
   */
  static warning(options: {
    title: string;
    content: string;
    okText?: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { title, content, okText = '确认', onConfirm, onCancel } = options;
    
    Modal.confirm({
      title: (
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          {title}
        </Space>
      ),
      icon: <ExclamationCircleOutlined />,
      content,
      okText,
      okType: 'primary',
      cancelText: '取消',
      centered: true,
      onOk: onConfirm,
      onCancel,
    });
  }

  /**
   * 显示信息确认对话框
   */
  static info(options: {
    title: string;
    content: string;
    okText?: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { title, content, okText = '确认', onConfirm, onCancel } = options;
    
    Modal.confirm({
      title: (
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          {title}
        </Space>
      ),
      icon: <InfoCircleOutlined />,
      content,
      okText,
      okType: 'primary',
      cancelText: '取消',
      centered: true,
      onOk: onConfirm,
      onCancel,
    });
  }

  /**
   * 显示文档权限修改确认对话框
   */
  static changeDocumentPermission(options: {
    documentTitle: string;
    fromPublic: boolean;
    toPublic: boolean;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { documentTitle, fromPublic, toPublic, onConfirm, onCancel } = options;
    
    const action = toPublic ? '公开' : '私有';
    const description = toPublic 
      ? '公开后，所有用户都可以查看和下载此文档。'
      : '设为私有后，只有您和管理员可以访问此文档。';
    
    this.warning({
      title: `${action}文档`,
      content: (
        <div>
          <p>确定要将文档 <Text strong>"{documentTitle}"</Text> 设为{action}吗？</p>
          <p style={{ color: '#666', fontSize: '12px' }}>{description}</p>
        </div>
      ) as any,
      okText: `确认${action}`,
      onConfirm,
      onCancel,
    });
  }

  /**
   * 显示文件覆盖确认对话框
   */
  static overwriteFile(options: {
    fileName: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { fileName, onConfirm, onCancel } = options;
    
    this.warning({
      title: '文件已存在',
      content: (
        <div>
          <p>文件 <Text strong>"{fileName}"</Text> 已存在，是否要覆盖？</p>
          <p style={{ color: '#666', fontSize: '12px' }}>
            覆盖后，原文件将被替换且无法恢复。
          </p>
        </div>
      ) as any,
      okText: '覆盖文件',
      onConfirm,
      onCancel,
    });
  }

  /**
   * 显示离开页面确认对话框
   */
  static beforeLeave(options: {
    message?: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
  }) {
    const { message = '您有未保存的更改，确定要离开此页面吗？', onConfirm, onCancel } = options;
    
    this.warning({
      title: '离开页面',
      content: (
        <div>
          <p>{message}</p>
          <p style={{ color: '#666', fontSize: '12px' }}>
            离开后，未保存的更改将丢失。
          </p>
        </div>
      ) as any,
      okText: '确认离开',
      onConfirm,
      onCancel,
    });
  }
}

export default ConfirmDialog;