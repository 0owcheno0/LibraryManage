import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  Descriptions,
  Avatar,
  Image,
  Divider,
  Alert,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  TagOutlined,
  ShareAltOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { useThemeColors } from '../../contexts/ThemeContext';
import { documentService } from '../../services/document';
import { DocumentDetailSkeleton, ErrorState, LoadingWrapper } from '../../components/LoadingStates';
import { ErrorHandler } from '../../utils/errorHandler';
import DocumentActions from '../../components/DocumentActions';
import DownloadButton from '../../components/DownloadButton';
import type { Document, DocumentDetailResponse } from '../../types';

const { Title, Paragraph, Text } = Typography;

export default function DocumentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state: authState } = useAuth();
  const { canEditDocument, canViewDocument, getDocumentPermissions } = usePermission();
  const colors = useThemeColors();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [detailData, setDetailData] = useState<DocumentDetailResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 获取文档详情
  const fetchDocument = async () => {
    if (!id || isNaN(Number(id))) {
      ErrorHandler.showError('无效的文档ID');
      navigate('/documents');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocument(Number(id));
      setDocument(data.document);
      setDetailData(data);

      // 如果是图片，获取预览
      if (data.document.mime_type.startsWith('image/')) {
        setImagePreview(documentService.getPreviewUrl(data.document.id));
      }
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message);
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // 获取文件类型图标
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
    if (mimeType.startsWith('text/')) return '📃';
    return '📁';
  };

  // 使用权限 hook 检查权限
  const permissions = document ? getDocumentPermissions(document) : null;
  const canView = document ? canViewDocument(document) : false;
  const canEdit = document ? canEditDocument(document) : false;

  // 如果用户没有查看权限，显示错误
  if (document && !canView) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="无权限访问"
          description="您没有权限访问此文档，请联系文档创建者或管理员。"
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/documents')}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <LoadingWrapper
      loading={loading}
      error={error}
      empty={!loading && !document}
      skeleton={<DocumentDetailSkeleton />}
      emptyComponent={
        <ErrorState
          title="文档不存在"
          subTitle="请检查文档ID是否正确，或者您可能没有访问权限。"
          onRetry={() => navigate('/documents')}
        />
      }
      onRetry={fetchDocument}
    >
      {document && (
        <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/documents')}
              >
                返回列表
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                文档详情
              </Title>
            </Space>
          </Col>
          <Col>
            <DocumentActions
              document={document}
              onUpdate={() => {
                fetchDocument();
                ErrorHandler.showSuccess('操作成功');
              }}
              size="middle"
            />
          </Col>
        </Row>
      </div>

      <Row gutter={24}>
        {/* 左侧：文档信息 */}
        <Col xs={24} lg={16}>
          <Card title={
            <Space>
              <span style={{ fontSize: '24px' }}>{getFileTypeIcon(document.mime_type)}</span>
              <span>{document.title}</span>
              <Tag color={document.is_public ? 'green' : 'orange'}>
                {document.is_public ? '公开' : '私有'}
              </Tag>
            </Space>
          }>
            {/* 文档描述 */}
            {document.description && (
              <div style={{ marginBottom: '16px' }}>
                <Paragraph>{document.description}</Paragraph>
              </div>
            )}

            {/* 文档基本信息 */}
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="文件名">
                <Tooltip title={document.file_name}>
                  <Text copyable>{document.file_name}</Text>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="文件大小">
                {document.formatted_size}
              </Descriptions.Item>
              <Descriptions.Item label="文件类型">
                <Tag color="blue">{document.friendly_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="MIME类型">
                <Text code>{document.mime_type}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="创建者">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {document.creator_name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                <Space>
                  <ClockCircleOutlined />
                  {dayjs(document.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {/* 标签 */}
            {document.tags && document.tags.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Divider orientation="left" orientationMargin={0}>
                  <Space>
                    <TagOutlined />
                    标签
                  </Space>
                </Divider>
                <Space wrap>
                  {document.tags.map(tag => (
                    <Tag key={tag.id} color={tag.color || 'blue'}>
                      {tag.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 图片预览 */}
            {imagePreview && (
              <div style={{ marginTop: '16px' }}>
                <Divider orientation="left" orientationMargin={0}>
                  预览
                </Divider>
                <Image
                  src={imagePreview}
                  alt={document.title}
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  placeholder={
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: colors.backgroundSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Spin />
                    </div>
                  }
                />
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：统计信息和操作 */}
        <Col xs={24} lg={8}>
          {/* 统计信息 */}
          <Card title="统计信息" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="浏览次数"
                  value={document.view_count}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="下载次数"
                  value={document.download_count}
                  prefix={<DownloadOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          {/* 快速操作 */}
          <Card title="快速操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <DownloadButton
                document={document}
                type="primary"
                size="middle"
                block
                showProgress
                onDownloadSuccess={(filename) => {
                  message.success(`文件 "${filename}" 下载成功`);
                  // 刷新统计信息
                  fetchDocument();
                }}
              />

              {canEdit && (
                <Button
                  icon={<EditOutlined />}
                  block
                  onClick={() => navigate(`/documents/${document.id}/edit`)}
                >
                  编辑文档
                </Button>
              )}

              <Button
                icon={<ShareAltOutlined />}
                block
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  message.success('链接已复制到剪贴板');
                }}
              >
                分享链接
              </Button>
            </Space>
          </Card>

          {/* 文档信息概览 */}
          <Card title="文档信息" style={{ marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">文档ID</Text>
                <br />
                <Text copyable>{document.id}</Text>
              </div>
              <div>
                <Text type="secondary">更新时间</Text>
                <br />
                <Text>{dayjs(document.updated_at).format('YYYY-MM-DD HH:mm')}</Text>
              </div>
              <div>
                <Text type="secondary">访问权限</Text>
                <br />
                <Tag color={document.is_public ? 'green' : 'orange'}>
                  {document.is_public ? '所有用户可访问' : '仅创建者可访问'}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
        </div>
      )}
    </LoadingWrapper>
  );
}
