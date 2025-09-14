import React, { useState } from 'react';
import {
  Upload,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Progress,
  Space,
  Card,
  Image,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Alert,
  App,
} from 'antd';
import {
  InboxOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { documentService } from '../services/document';
import { ErrorHandler } from '../utils/errorHandler';
import { useThemeColors } from '../contexts/ThemeContext';
import TagSelector from './TagSelector';
import type { DocumentCreateRequest } from '../types';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Text } = Typography;

interface DocumentUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface DocumentFormData {
  title: string;
  description?: string;
  tags: number[];
  isPublic: boolean;
}

// 重试配置
interface RetryConfig {
  maxRetries: number;
  currentRetry: number;
  intervals: number[]; // 重试间隔（秒）
}

// 上传状态
interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  retryConfig: RetryConfig;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess, onCancel }) => {
  const { message: messageApi } = App.useApp();
  const [form] = Form.useForm<DocumentFormData>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  
  // 上传状态管理
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    retryConfig: {
      maxRetries: 2,
      currentRetry: 0,
      intervals: [2, 5], // 2秒, 5秒
    },
  });

  // 支持的文件类型
  const supportedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
  ];

  // 获取文件类型图标
  const getFileTypeIcon = (file: UploadFile) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📋';
    if (type.startsWith('text/')) return '📃';
    return '📁';
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 检查文件类型
  const beforeUpload = (file: File) => {
    const isValidType = supportedFileTypes.includes(file.type);
    if (!isValidType) {
      ErrorHandler.showError('不支持该文件类型！');
      return false;
    }

    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      ErrorHandler.showError('文件大小不能超过 100MB！');
      return false;
    }

    // 重置上传状态
    setUploadState(prev => ({
      ...prev,
      error: null,
      retryConfig: {
        ...prev.retryConfig,
        currentRetry: 0,
      },
    }));

    return false; // 阻止自动上传，手动控制上传流程
  };

  // 文件变化处理
  const handleFileChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);

    // 如果是图片文件，自动填充标题
    if (fileList.length > 0 && !form.getFieldValue('title')) {
      const file = fileList[0];
      const fileName = file.name?.split('.').slice(0, -1).join('.') || '';
      form.setFieldValue('title', fileName);
    }
  };

  // 预览图片
  const handlePreview = (file: UploadFile) => {
    if (file.type?.startsWith('image/') && file.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setPreviewVisible(true);
      };
      reader.readAsDataURL(file.originFileObj);
    }
  };

  // 移除文件
  const handleRemove = (file: UploadFile) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
    form.resetFields();
    // 重置上传状态
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      retryConfig: {
        maxRetries: 2,
        currentRetry: 0,
        intervals: [2, 5],
      },
    });
  };

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 执行上传的核心函数
  const performUpload = async (uploadData: DocumentCreateRequest, isRetry: boolean = false): Promise<void> => {
    try {
      await documentService.uploadDocument(uploadData);
      
      setUploadState(prev => ({ ...prev, progress: 100 }));
      await delay(500); // 给用户看到100%的时间
      
      // 使用App组件提供的message API
      messageApi.success('文档上传成功！');
      form.resetFields();
      setFileList([]);
      setUploadState({
        uploading: false,
        progress: 0,
        error: null,
        retryConfig: {
          maxRetries: 2,
          currentRetry: 0,
          intervals: [2, 5],
        },
      });
      
      // 只有在非重试情况下才调用onSuccess回调，避免重复调用
      if (!isRetry) {
        onSuccess?.();
      }
    } catch (error: any) {
      // 使用App组件提供的message API
      messageApi.error('文档上传失败，请稍后重试');
      const errorInfo = ErrorHandler.handleUploadError(error);
      throw errorInfo;
    }
  };

  // 重试上传
  const retryUpload = async (uploadData: DocumentCreateRequest) => {
    const { retryConfig } = uploadState;
    const { currentRetry, maxRetries, intervals } = retryConfig;
    
    if (currentRetry >= maxRetries) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: `上传失败，已重试 ${maxRetries} 次，请稍后再试。`,
      }));
      return;
    }

    const retryDelay = intervals[currentRetry] * 1000;
    setUploadState(prev => ({
      ...prev,
      error: `上传失败，${retryDelay / 1000}秒后进行第 ${currentRetry + 1} 次重试...`,
      retryConfig: {
        ...prev.retryConfig,
        currentRetry: currentRetry + 1,
      },
    }));

    await delay(retryDelay);

    setUploadState(prev => ({
      ...prev,
      error: `正在进行第 ${currentRetry + 1} 次重试...`,
      progress: 10, // 重置进度
    }));

    try {
      await performUpload(uploadData, true); // 标记为重试调用
    } catch (error) {
      // 继续重试
      await retryUpload(uploadData);
    }
  };

  // 手动重试
  const handleManualRetry = async () => {
    if (fileList.length === 0) {
      messageApi.error('请选择要上传的文件');
      return;
    }

    const values = form.getFieldsValue();
    if (!values.title) {
      messageApi.error('请输入文档标题');
      return;
    }

    const file = fileList[0].originFileObj as File;
    const uploadData: DocumentCreateRequest = {
      file,
      title: values.title,
      description: values.description,
      tags: values.tags || [],
      isPublic: values.isPublic || false,
    };

    // 重置重试计数器
    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
      retryConfig: {
        ...prev.retryConfig,
        currentRetry: 0,
      },
    }));

    try {
      await performUpload(uploadData, true); // 标记为重试调用
    } catch (error) {
      await retryUpload(uploadData);
    }
  };

  // 提交上传
  const handleSubmit = async (values: DocumentFormData) => {
    if (fileList.length === 0) {
      messageApi.error('请选择要上传的文件');
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const file = fileList[0].originFileObj as File;
      const uploadData: DocumentCreateRequest = {
        file,
        title: values.title,
        description: values.description,
        tags: values.tags || [], // 确保传递正确的标签数组
        isPublic: values.isPublic,
      };

      await performUpload(uploadData);
    } catch (error) {
      // 开始重试流程
      const uploadData: DocumentCreateRequest = {
        file: fileList[0].originFileObj as File,
        title: values.title,
        description: values.description,
        tags: values.tags || [], // 确保传递正确的标签数组
        isPublic: values.isPublic,
      };
      await retryUpload(uploadData);
    }
  };

  return (
    <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isPublic: false,
          tags: [],
        }}
      >
        {/* 文件上传区域 */}
        <Form.Item
          label="选择文件"
          required
        >
          <Dragger
            name="file"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            onPreview={handlePreview}
            onRemove={handleRemove}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.bmp"
            maxCount={1}
            style={{
              backgroundColor: fileList.length > 0 ? '#f6ffed' : '#fafafa',
              border: fileList.length > 0 ? '2px dashed #52c41a' : '2px dashed #d9d9d9',
            }}
          >
            <p className="ant-upload-drag-icon">
              {fileList.length > 0 ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '48px' }} />
              ) : (
                <InboxOutlined style={{ fontSize: '48px' }} />
              )}
            </p>
            <p className="ant-upload-text">
              {fileList.length > 0 ? '文件已选择' : '点击或拖拽文件到此区域上传'}
            </p>
            <p className="ant-upload-hint">
              支持单个文件上传，文件大小不超过 100MB
              <br />
              支持格式：PDF、Word、Excel、PowerPoint、文本、图片
            </p>
          </Dragger>
        </Form.Item>

        {/* 文件信息展示 */}
        {fileList.length > 0 && (
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row align="middle" gutter={16}>
              <Col>
                <span style={{ fontSize: '24px' }}>{getFileTypeIcon(fileList[0])}</span>
              </Col>
              <Col flex={1}>
                <div>
                  <Text strong>{fileList[0].name}</Text>
                  <br />
                  <Text type="secondary">
                    {formatFileSize(fileList[0].size || 0)}
                  </Text>
                </div>
              </Col>
              {fileList[0].type?.startsWith('image/') && (
                <Col>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handlePreview(fileList[0])}
                  >
                    预览
                  </Button>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* 上传进度和状态 */}
        {uploadState.uploading && (
          <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>正在上传...</Text>
                {uploadState.retryConfig.currentRetry > 0 && (
                  <Tag color="orange" style={{ marginLeft: '8px' }}>
                    第 {uploadState.retryConfig.currentRetry} 次重试
                  </Tag>
                )}
              </div>
              <Progress
                percent={uploadState.progress}
                status={uploadState.error ? 'exception' : 'active'}
                strokeColor={{
                  from: '#108ee9',
                  to: '#87d068',
                }}
              />
              {uploadState.error && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {uploadState.error}
                </Text>
              )}
            </Space>
          </Card>
        )}

        {/* 上传失败后的错误显示和重试按钮 */}
        {!uploadState.uploading && uploadState.error && (
          <Alert
            message="上传失败"
            description={uploadState.error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Space>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleManualRetry}
                  disabled={fileList.length === 0}
                >
                  重新上传
                </Button>
              </Space>
            }
          />
        )}

        <Divider />

        {/* 文档信息表单 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="文档标题"
              rules={[{ required: true, message: '请输入文档标题' }]}
            >
              <Input
                placeholder="请输入文档标题"
                showCount
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="文档描述"
            >
              <TextArea
                placeholder="请输入文档描述（可选）"
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="标签"
            >
              <TagSelector
                value={form.getFieldValue('tags') || []}
                onChange={(tagIds) => form.setFieldValue('tags', tagIds)}
                placeholder="添加标签（可选）"
                maxTagCount={5}
                mode="multiple"
                allowCreate={true}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isPublic"
              label="访问权限"
              valuePropName="checked"
            >
              <Space align="center">
                <Switch
                  checkedChildren="公开"
                  unCheckedChildren="私有"
                />
                <Text type="secondary">
                  {form.getFieldValue('isPublic') ? '所有用户可访问' : '仅创建者可访问'}
                </Text>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={onCancel} disabled={uploadState.uploading}>
              取消
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploadState.uploading}
              disabled={fileList.length === 0}
            >
              {uploadState.uploading ? '上传中...' : '上传文档'}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* 图片预览 */}
      <Image
        width={0}
        height={0}
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </div>
  );
};

export default DocumentUpload;