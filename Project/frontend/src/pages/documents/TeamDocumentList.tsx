import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Avatar, message, Typography } from 'antd';

const { Text } = Typography;
import { 
  UserOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  GlobalOutlined, 
  LockOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { documentService } from '../../services/document';
import { DocumentListSkeleton, ErrorState, LoadingWrapper } from '../../components/LoadingStates';
import { ErrorHandler } from '../../utils/errorHandler';
import type { Document, DocumentListResponse } from '../../types';

interface TeamDocumentListProps {
  activeTab: string;
  searchKeyword?: string;
  fileType?: string;
  dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  onSearch?: (params: any) => void;
}

const TeamDocumentList: React.FC<TeamDocumentListProps> = ({
  activeTab,
  searchKeyword = '',
  fileType = '',
  dateRange = [null, null],
  onSearch,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // 获取文档列表
  const fetchDocuments = async (params: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentService.getDocuments({
        page: currentPage,
        pageSize,
        keyword: searchKeyword || undefined,
        mimeType: fileType || undefined,
        isPublic: activeTab === 'public' ? true : activeTab === 'private' ? false : undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        ...params,
      });
      
      setDocuments(response.documents);
      setTotal(response.total);
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message);
      console.error('获取文档列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchDocuments({ page, pageSize: size });
  };

  // 处理页面大小变化
  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(1);
    setPageSize(size);
    fetchDocuments({ page: 1, pageSize: size });
  };

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

  // 获取文件类型标签颜色
  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'orange';
    if (mimeType.includes('pdf')) return 'red';
    if (mimeType.includes('word')) return 'blue';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'green';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'purple';
    if (mimeType.startsWith('text/')) return 'cyan';
    return 'default';
  };

  // 文档列表列定义
  const columns = [
    {
      title: '文档',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: Document) => (
        <Space>
          <span style={{ fontSize: '18px' }}>{getFileTypeIcon(record.mime_type)}</span>
          <div>
            <div>
              <Button 
                type="link" 
                onClick={() => navigate(`/documents/${record.id}`)}
                style={{ padding: 0, height: 'auto' }}
              >
                {record.title}
              </Button>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {decodeURIComponent(record.file_name)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (_: any, record: Document) => (
        <Space size={[4, 4]} wrap>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map(tag => (
              <Tag 
                key={tag.id} 
                color={tag.color || 'default'}
                style={{ margin: 0 }}
              >
                {tag.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'friendly_type',
      key: 'friendly_type',
      render: (friendlyType: string, record: Document) => (
        <Tag color={getFileTypeColor(record.mime_type)}>{friendlyType}</Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'formatted_size',
      key: 'formatted_size',
      width: 100,
    },
    {
      title: '创建者',
      dataIndex: 'creator_name',
      key: 'creator_name',
      render: (creatorName: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{creatorName}</span>
        </Space>
      ),
    },
    {
      title: '权限',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic: number) => (
        <Tag icon={isPublic ? <GlobalOutlined /> : <LockOutlined />} 
            color={isPublic ? 'green' : 'orange'}>
          {isPublic ? '公开' : '私有'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD'),
      sorter: true,
    },
    {
      title: '统计',
      key: 'stats',
      render: (_: any, record: Document) => (
        <Space size="small">
          <span><EyeOutlined /> {record.view_count}</span>
          <span><DownloadOutlined /> {record.download_count}</span>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, searchKeyword, fileType, dateRange]);

  return (
    <LoadingWrapper
      loading={loading}
      error={error}
      empty={!loading && documents.length === 0}
      skeleton={<DocumentListSkeleton />}
      emptyComponent={
        <ErrorState
          title="暂无文档"
          subTitle="还没有上传任何文档，点击上传按钮开始上传文档。"
          onRetry={fetchDocuments}
        />
      }
      onRetry={fetchDocuments}
    >
      <Table
        dataSource={documents}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条文档`,
        }}
        scroll={{ x: 1000 }}
      />
    </LoadingWrapper>
  );
};

export default TeamDocumentList;