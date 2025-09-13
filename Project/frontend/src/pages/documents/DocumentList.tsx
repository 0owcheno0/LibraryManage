import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  FileOutlined,
  UploadOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentActions from '../../components/DocumentActions';
import { 
  DocumentListSkeleton, 
  EmptyDocuments, 
  EmptySearch, 
  LoadingWrapper 
} from '../../components/LoadingStates';
import { documentService } from '../../services/document';
import { ErrorHandler } from '../../utils/errorHandler';
import type { Document, DocumentListResponse, DocumentListParams } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const DocumentList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [listData, setListData] = useState<DocumentListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);

  // 筛选条件
  const [filters, setFilters] = useState<DocumentListParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // 获取文档列表
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments({
        ...filters,
        page: currentPage,
        pageSize,
      });

      setListData(data);
      setDocuments(data.documents);
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message);
      console.error('获取文档列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, pageSize, filters]);

  // 文件类型映射
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📋';
    if (mimeType.startsWith('text/')) return '📃';
    return '📁';
  };

  // 表格列定义
  const columns: TableColumnsType<Document> = [
    {
      title: '文档信息',
      key: 'info',
      width: 300,
      render: (_, record) => (
        <div>
          <Space>
            <span style={{ fontSize: '18px' }}>{getFileTypeIcon(record.mime_type)}</span>
            <div>
              <Link
                to={`/documents/${record.id}`}
                style={{
                  fontWeight: 'bold',
                  color: '#1890ff',
                  textDecoration: 'none',
                }}
              >
                {record.title}
              </Link>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.file_name}
              </div>
              {record.description && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </div>
              )}
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'friendly_type',
      key: 'friendly_type',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'formatted_size',
      key: 'formatted_size',
      width: 80,
      sorter: true,
    },
    {
      title: '创建者',
      dataIndex: 'creator_name',
      key: 'creator_name',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      sorter: true,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '统计',
      key: 'stats',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            👁️ {record.view_count}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            ⬇️ {record.download_count}
          </span>
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.is_public ? 'green' : 'orange'}>
          {record.is_public ? '公开' : '私有'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <DocumentActions
          document={record}
          onUpdate={fetchDocuments}
        />
      ),
    },
  ];

  // 处理表格变化
  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const newFilters = { ...filters };

    if (sorter.field) {
      newFilters.sortBy = sorter.field;
      newFilters.sortOrder = sorter.order === 'ascend' ? 'ASC' : 'DESC';
    }

    if (pagination.current !== currentPage) {
      setCurrentPage(pagination.current);
    }

    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }

    setFilters(newFilters);
  };

  // 重置筛选
  const resetFilters = () => {
    const newFilters: DocumentListParams = {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // 更新筛选条件
  const updateFilter = (key: keyof DocumentListParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      {listData?.stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="总文档数"
                value={listData.stats.total}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="公开文档"
                value={listData.stats.public}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="私有文档"
                value={listData.stats.private}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="总大小"
                value={`${(listData.stats.totalSize / (1024 * 1024)).toFixed(1)} MB`}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="总浏览量"
                value={listData.stats.totalViews}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="总下载量"
                value={listData.stats.totalDownloads}
                prefix={<DownloadOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>文档管理</Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
              >
                上传文档
              </Button>
            </Col>
          </Row>
        </div>

        {/* 筛选区域 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Search
              placeholder="搜索文档标题或描述"
              value={filters.keyword || ''}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              onSearch={fetchDocuments}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="文件类型"
              value={filters.mimeType}
              onChange={(value) => updateFilter('mimeType', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="application/pdf">PDF</Option>
              <Option value="application/msword">Word文档</Option>
              <Option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word文档</Option>
              <Option value="application/vnd.ms-excel">Excel表格</Option>
              <Option value="text/plain">文本文件</Option>
              <Option value="image/jpeg">JPEG图片</Option>
              <Option value="image/png">PNG图片</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="访问权限"
              value={filters.isPublic}
              onChange={(value) => updateFilter('isPublic', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={true}>公开</Option>
              <Option value={false}>私有</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={resetFilters}
            >
              重置筛选
            </Button>
          </Col>
        </Row>

        <LoadingWrapper
          loading={loading}
          error={error}
          empty={!loading && documents.length === 0}
          skeleton={<DocumentListSkeleton rows={pageSize} />}
          emptyComponent={
            filters.keyword ? (
              <EmptySearch 
                keyword={filters.keyword}
                onClearSearch={() => {
                  setFilters(prev => ({ ...prev, keyword: undefined }));
                }}
              />
            ) : (
              <EmptyDocuments 
                onAddDocument={() => setUploadModalVisible(true)}
              />
            )
          }
          onRetry={fetchDocuments}
        >
          <Table
            columns={columns}
            dataSource={documents}
            loading={false} // LoadingWrapper 已经处理了 loading 状态
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize,
              total: listData?.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 20);
              },
            }}
            onChange={handleTableChange}
            size="middle"
          />
        </LoadingWrapper>
      </Card>

      {/* 上传模态框 */}
      <Modal
        title="上传文档"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={800}
      >
        <DocumentUpload
          onSuccess={() => {
            setUploadModalVisible(false);
            fetchDocuments();
            ErrorHandler.showSuccess('文档上传成功');
          }}
          onCancel={() => setUploadModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default DocumentList;
