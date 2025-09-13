import React, { useState, useCallback } from 'react';
import {
  Button,
  Progress,
  Modal,
  Space,
  Typography,
  Tooltip,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { downloadService, DownloadProgress } from '../services/downloadService';
import DownloadService from '../services/downloadService';
import type { Document } from '../types';

const { Text } = Typography;

interface DownloadButtonProps {
  document: Document;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'text' | 'link';
  block?: boolean;
  disabled?: boolean;
  showProgress?: boolean;
  onDownloadStart?: () => void;
  onDownloadSuccess?: (filename: string) => void;
  onDownloadError?: (error: Error) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  document,
  size = 'middle',
  type = 'default',
  block = false,
  disabled = false,
  showProgress = true,
  onDownloadStart,
  onDownloadSuccess,
  onDownloadError,
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // 开始下载
  const handleDownload = useCallback(async () => {
    if (downloading) {
      return;
    }

    setDownloading(true);
    setProgress(null);
    setError(null);

    try {
      await downloadService.downloadDocument(document.id, {
        onStart: () => {
          onDownloadStart?.();
          if (showProgress) {
            setModalVisible(true);
          }
        },
        onProgress: (progressData) => {
          setProgress(progressData);
        },
        onSuccess: (filename) => {
          setModalVisible(false);
          onDownloadSuccess?.(filename);
          message.success(`文件 "${filename}" 下载成功`);
        },
        onError: (downloadError) => {
          setError(downloadError);
          onDownloadError?.(downloadError);
        },
        timeout: 60000, // 60秒超时
      });
    } catch (downloadError) {
      setError(downloadError as Error);
    } finally {
      setDownloading(false);
      setProgress(null);
    }
  }, [document.id, downloading, showProgress, onDownloadStart, onDownloadSuccess, onDownloadError]);

  // 取消下载
  const handleCancel = useCallback(() => {
    downloadService.cancelDownload(document.id);
    setDownloading(false);
    setProgress(null);
    setModalVisible(false);
    message.info('下载已取消');
  }, [document.id]);

  // 重试下载 - 下载失败提示和重试按钮
  const handleRetry = useCallback(async () => {
    setError(null);
    setModalVisible(true);
    
    try {
      await downloadService.retryDownload(document.id, {
        onStart: () => {
          setDownloading(true);
          setProgress(null);
        },
        onProgress: (progressData) => {
          setProgress(progressData);
        },
        onSuccess: (filename) => {
          setDownloading(false);
          setModalVisible(false);
          onDownloadSuccess?.(filename);
        },
        onError: (downloadError) => {
          setDownloading(false);
          setError(downloadError);
        },
      }, 3); // 最多重试3次
    } catch (retryError) {
      setDownloading(false);
      setError(retryError as Error);
    }
  }, [document.id, onDownloadSuccess]);

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    return DownloadService.formatFileSize(bytes);
  };

  // 格式化速度
  const formatSpeed = (bytesPerSecond: number): string => {
    return DownloadService.formatSpeed(bytesPerSecond);
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    return DownloadService.formatTime(seconds);
  };

  return (
    <>
      {/* Loading状态显示 */}
      <Tooltip title={downloading ? '正在下载...' : '下载文档'}>
        <Button
          type={type}
          size={size}
          block={block}
          disabled={disabled || downloading}
          loading={downloading && !showProgress}
          icon={downloading ? undefined : <DownloadOutlined />}
          onClick={handleDownload}
        >
          {downloading && !showProgress ? '下载中...' : '下载'}
        </Button>
      </Tooltip>

      {/* 下载进度条模态框 */}
      <Modal
        title={
          <Space>
            <DownloadOutlined />
            下载进度
          </Space>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={!downloading}>
            <StopOutlined />
            取消下载
          </Button>,
          ...(error ? [
            <Button key="retry" type="primary" onClick={handleRetry}>
              <ReloadOutlined />
              重试下载
            </Button>
          ] : []),
        ]}
        closable={!downloading}
        maskClosable={false}
        width={480}
      >
        <div style={{ padding: '16px 0' }}>
          {/* 文档信息 */}
          <div style={{ marginBottom: '16px' }}>
            <Text strong>{document.title}</Text>
            <br />
            <Text type="secondary">{document.file_name}</Text>
            <br />
            <Text type="secondary">
              文件大小: {document.formatted_size}
            </Text>
          </div>

          {/* 进度信息 */}
          {progress && (
            <div style={{ marginBottom: '16px' }}>
              <Progress
                percent={progress.percentage}
                status={downloading ? 'active' : 'success'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                <div>
                  进度: {formatSize(progress.loaded)} / {formatSize(progress.total)} 
                  ({progress.percentage}%)
                </div>
                {progress.speed && progress.speed > 0 && (
                  <div>
                    下载速度: {formatSpeed(progress.speed)}
                  </div>
                )}
                {progress.estimatedTime && progress.estimatedTime > 0 && (
                  <div>
                    预计剩余时间: {formatTime(progress.estimatedTime)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#fff2f0', 
              border: '1px solid #ffccc7',
              borderRadius: '4px'
            }}>
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text type="danger">下载失败: {error.message}</Text>
              </Space>
            </div>
          )}

          {/* 下载完成 */}
          {!downloading && !error && progress?.percentage === 100 && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <Text type="success">
                ✅ 下载完成！文件已保存到下载文件夹
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DownloadButton;