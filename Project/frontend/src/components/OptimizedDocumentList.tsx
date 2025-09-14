import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Tooltip,
  List,
  Avatar,
  Typography,
  Row,
  Col,
  Skeleton,
  Empty
} from 'antd';
import {
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { VirtualList, InfiniteScrollList } from './VirtualList';
import { LazyImage } from './LazyImage';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { documentService } from '../services/document';
import { ErrorHandler } from '../utils/errorHandler';
import type { Document, DocumentListParams } from '../types';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface OptimizedDocumentListProps {
  mode?: 'virtual' | 'infinite' | 'normal';
  pageSize?: number;
  itemHeight?: number;
  height?: number;
}

/**
 * 优化版文档列表组件
 * 支持虚拟滚动、无限滚动和懒加载
 */
export const OptimizedDocumentList: React.FC<OptimizedDocumentListProps> = ({
  mode = 'infinite',
  pageSize = 20,
  itemHeight = 120,
  height = 600
}) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<DocumentListParams>({
    page: 1,
    pageSize,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // 获取文档列表
  const fetchDocuments = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = reset ? { ...filters, page: 1 } : filters;
      const data = await documentService.getDocuments(params);
      
      if (reset) {
        setDocuments(data.documents);
      } else {
        setDocuments(prev => [...prev, ...data.documents]);
      }
      
      setHasMore(data.hasNext);
      setFilters(prev => ({ ...prev, page: params.page }));
    } catch (error: any) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const nextPage = filters.page + 1;
    setFilters(prev => ({ ...prev, page: nextPage }));
    await fetchDocuments(false);
  }, [loading, hasMore, filters.page, fetchDocuments]);

  // 初始加载
  useEffect(() => {
    fetchDocuments(true);
  }, [filters.search, filters.sortBy, filters.sortOrder]);

  // 搜索处理
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, []);

  // 排序处理
  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as any, 
      sortOrder: sortOrder as 'ASC' | 'DESC',
      page: 1 
    }));
  }, []);

  // 文档项目渲染
  const renderDocumentItem = useCallback((document: Document, index: number) => (
    <DocumentListItem key={document.id} document={document} />
  ), []);

  // 过滤器渲染
  const renderFilters = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={8}>
        <Search
          placeholder="搜索文档标题或内容"
          allowClear
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          size="large"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Select
          placeholder="排序方式"
          onChange={handleSortChange}
          defaultValue="created_at-DESC"
          size="large"
          style={{ width: '100%' }}
        >
          <Option value="created_at-DESC">最新创建</Option>
          <Option value="created_at-ASC">最早创建</Option>
          <Option value="title-ASC">标题 A-Z</Option>
          <Option value="title-DESC">标题 Z-A</Option>
          <Option value="file_size-DESC">文件大小</Option>
          <Option value="view_count-DESC">查看次数</Option>
        </Select>
      </Col>
    </Row>
  );

  if (documents.length === 0 && !loading) {
    return (
      <div>
        {renderFilters()}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无文档"
          style={{ margin: '40px 0' }}
        />
      </div>
    );
  }

  return (
    <div>
      {renderFilters()}
      
      {mode === 'virtual' && (
        <VirtualList
          items={documents}
          itemHeight={itemHeight}
          height={height}
          renderItem={renderDocumentItem}
        />
      )}
      
      {mode === 'infinite' && (
        <InfiniteScrollList
          items={documents}
          renderItem={renderDocumentItem}
          loadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          style={{ height: height }}
        />
      )}
      
      {mode === 'normal' && (
        <List
          dataSource={documents}
          loading={loading}
          renderItem={(document, index) => (
            <List.Item key={document.id}>
              <DocumentListItem document={document} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

/**
 * 文档列表项组件 - 支持懒加载
 */
const DocumentListItem: React.FC<{ document: Document }> = ({ document }) => {
  const { observe, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  // 文件类型图标
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📋';
    return '📁';
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card
      ref={observe}
      size="small"
      style={{ marginBottom: 8 }}
      bodyStyle={{ padding: '12px 16px' }}
      hoverable
    >
      {isVisible ? (
        <Row gutter={16} align="middle">
          <Col flex="none">
            {document.thumbnail_path ? (
              <LazyImage
                src={document.thumbnail_path}
                alt={document.title}
                width={60}
                height={60}
                style={{ borderRadius: 8 }}
              />
            ) : (
              <Avatar
                size={60}
                style={{
                  backgroundColor: '#f6f6f6',
                  color: '#999',
                  fontSize: 24
                }}
              >
                {getFileTypeIcon(document.mime_type)}
              </Avatar>
            )}
          </Col>
          
          <Col flex="auto">
            <div>
              <Link 
                to={`/documents/${document.id}`}
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                {document.title}
              </Link>
              
              {document.description && (
                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                  {document.description}
                </Text>
              )}
              
              <Space size="middle" style={{ marginTop: 8 }}>
                <span>
                  <CalendarOutlined /> {dayjs(document.created_at).format('YYYY-MM-DD')}
                </span>
                <span>
                  <UserOutlined /> {document.upload_user_id}
                </span>
                <span>
                  <FileOutlined /> {formatFileSize(document.file_size)}
                </span>
                <span>
                  <EyeOutlined /> {document.view_count || 0}
                </span>
              </Space>
            </div>
          </Col>
          
          <Col flex="none">
            <Space>
              <Tooltip title="预览">
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  href={`/documents/${document.id}`}
                />
              </Tooltip>
              <Tooltip title="下载">
                <Button
                  icon={<DownloadOutlined />}
                  size="small"
                  href={`/api/v1/documents/${document.id}/download`}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      ) : (
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      )}
    </Card>
  );
};

export default OptimizedDocumentList;