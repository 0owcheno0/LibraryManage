import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Button,
  Card,
  Row,
  Col,
  List,
  Typography,
  Tag,
  Space,
  Collapse,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Divider,
  Empty,
  Spin,
  Pagination,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { searchService } from '../../services/search';
import { documentService } from '../../services/document';
import SearchInput from '../../components/SearchInput';
import QuickTagFilter from '../../components/QuickTagFilter';
import { ErrorHandler } from '../../utils/errorHandler';
import type { Document, DocumentListResponse } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

interface SearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  tags?: string;
  mimeType?: string;
  isPublic?: boolean;
}

export default function SearchPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [keyword, setKeyword] = useState<string>('');
  const [filters, setFilters] = useState<any>({});
  const [quickFilters, setQuickFilters] = useState<any>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<DocumentListResponse | null>(null);
  const [advancedVisible, setAdvancedVisible] = useState<boolean>(false);

  useEffect(() => {
    const q = searchParams.get('q');
    const tags = searchParams.get('tags');
    const fileType = searchParams.get('fileType');
    const page = searchParams.get('page');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const initialFilters = {
      q: q || '',
      tags: tags ? tags.split(',').map(id => parseInt(id)) : undefined,
      fileType: fileType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: page ? parseInt(page) : 1,
      pageSize: 10,
      sortBy: 'relevance',
      sortOrder: 'DESC',
    };

    setFilters(initialFilters);
    setSearchKeyword(q || '');

    if (q) {
      performSearch(initialFilters);
    }

    setSearchHistory(searchHistoryManager.getHistory());
  }, []);

  const performSearch = async (params: SearchParams) => {
    setLoading(true);
    try {
      const result = await searchService.advancedSearch(params);
      setDocuments(result.documents);
      setTotal(result.total);

      if (params.q) {
        searchHistoryManager.addSearch(params.q);
        setSearchHistory(searchHistoryManager.getHistory());
      }

      updateURL(params);
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message);
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (params: SearchParams) => {
    const newSearchParams = new URLSearchParams();

    if (params.q) newSearchParams.set('q', params.q);
    if (params.tags && params.tags.length > 0) {
      newSearchParams.set('tags', params.tags.join(','));
    }
    if (params.fileType) newSearchParams.set('fileType', params.fileType);
    if (params.startDate) newSearchParams.set('startDate', params.startDate);
    if (params.endDate) newSearchParams.set('endDate', params.endDate);
    if (params.page && params.page > 1) {
      newSearchParams.set('page', params.page.toString());
    }

    setSearchParams(newSearchParams);
  };

  const handleSearch = (value: string) => {
    const newFilters = {
      ...filters,
      q: value,
      page: 1,
    };

    setFilters(newFilters);
    performSearch(newFilters);
  };

  const handleKeywordChange = async (value: string) => {
    setSearchKeyword(value);

    if (value.length > 1) {
      try {
        const suggestions = await searchService.getSearchSuggestions(value, 5);
        const options = [
          ...suggestions.suggestions.map(s => ({ value: s })),
          ...searchHistory.filter(h => h.toLowerCase().includes(value.toLowerCase())).slice(0, 3).map(h => ({ value: h }))
        ];
        setAutoCompleteOptions(options);
      } catch (error) {
        // 忽略建议错误
      }
    } else {
      setAutoCompleteOptions([]);
    }
  };

  const handleFilterChange = (key: keyof SearchParams, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1,
    };

    setFilters(newFilters);

    if (newFilters.q || (newFilters.tags && newFilters.tags.length > 0) || newFilters.fileType || newFilters.isPublic !== undefined) {
      performSearch(newFilters);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const clearFilters = () => {
    const newFilters: SearchParams = {
      q: searchKeyword,
      page: 1,
      pageSize: 10,
      sortBy: 'relevance',
      sortOrder: 'DESC',
    };

    setFilters(newFilters);
    if (searchKeyword) {
      performSearch(newFilters);
    }
  };

  const handleTagQuickSearch = (tagId: number) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];

    const newFilters = {
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
      page: 1,
    };

    setFilters(newFilters);
    performSearch(newFilters);
  };

  const renderDocumentItem = (doc: Document) => {
    const highlightedTitle = HighlightHelper.highlightText(
      doc.title,
      searchKeyword,
      'search-highlight'
    );

    const highlightedDescription = doc.description ?
      HighlightHelper.highlightText(doc.description, searchKeyword, 'search-highlight') :
      "";

    return (
      <List.Item
        key={doc.id}
        actions={[
          <Tooltip title="查看详情">
            <Link to={`/documents/${doc.id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>,
          <DownloadButton
            document={doc}
            type="text"
            size="small"
            showProgress={false}
          />
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{ fontSize: '24px' }}>
              {getFileTypeIcon(doc.mime_type)}
            </div>
          }
          title={
            <div>
              <Link
                to={`/documents/${doc.id}`}
                dangerouslySetInnerHTML={{ __html: highlightedTitle }}
                style={{ fontWeight: 'bold', color: '#1890ff' }}
              />
              <div style={{ marginTop: '4px' }}>
                <Space size={[4, 4]} wrap>
                  <Tag color={doc.is_public ? 'green' : 'orange'}>
                    {doc.is_public ? '公开' : '私有'}
                  </Tag>
                  <Tag color="blue">{doc.friendly_type}</Tag>
                  {doc.tags?.map(tag => (
                    <Tag
                      key={tag.id}
                      color={tag.color || 'default'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTagQuickSearch(tag.id)}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>
          }
          description={
            <div>
              {highlightedDescription && (
                <div
                  dangerouslySetInnerHTML={{ __html: highlightedDescription }}
                  style={{ marginBottom: '8px', color: '#666' }}
                />
              )}
              <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                <span>
                  <UserOutlined /> {doc.creator_name}
                </span>
                <span>
                  <ClockCircleOutlined /> {dayjs(doc.created_at).format('YYYY-MM-DD')}
                </span>
                <span>
                  <FileOutlined /> {doc.formatted_size}
                </span>
                <span>
                  <EyeOutlined /> {doc.view_count}
                </span>
                <span>
                  <DownloadOutlined /> {doc.download_count}
                </span>
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📋';
    if (mimeType.startsWith('text/')) return '📃';
    return '📁';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '16px' }}>
        搜索文档
      </Title>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <AutoComplete
            value={searchKeyword}
            options={autoCompleteOptions}
            onSearch={handleKeywordChange}
            onSelect={(value) => {
              setSearchKeyword(value);
              handleSearch(value);
            }}
            style={{ width: '100%' }}
          >
            <Search
              placeholder="输入关键词搜索文档..."
              size="large"
              allowClear
              enterButton={
                <Button type="primary" icon={<SearchOutlined />} loading={loading}>
                  搜索
                </Button>
              }
              onSearch={handleSearch}
            />
          </AutoComplete>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            {searchResult?.facets?.tags && searchResult.facets.tags.length > 0 && (
              <div>
                <Text type="secondary">热门标签: </Text>
                <Space wrap size={[4, 4]}>
                  {searchResult.facets.tags.slice(0, 8).map(tag => (
                    <Tag
                      key={tag.id}
                      color={tag.color}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTagQuickSearch(tag.id)}
                    >
                      {tag.name} ({tag.count})
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Col>
          <Col span={12}>
            {searchHistory.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">搜索历史: </Text>
                <Space wrap size={[4, 4]}>
                  {searchHistory.slice(0, 5).map((keyword, index) => (
                    <Tag
                      key={index}
                      icon={<HistoryOutlined />}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSearchKeyword(keyword);
                        handleSearch(keyword);
                      }}
                    >
                      {keyword}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            title={
              <Space>
                <FilterOutlined />
                筛选条件
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearFilters}
              >
                清空
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>标签</Text>
                <TagSelector
                  value={filters.tags || []}
                  onChange={(tagIds) => handleFilterChange('tags', tagIds.length > 0 ? tagIds : undefined)}
                  mode="multiple"
                  placeholder="选择标签..."
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>

              <div>
                <Text strong>文件类型</Text>
                <Select
                  value={filters.fileType}
                  onChange={(value) => handleFilterChange('fileType', value)}
                  placeholder="选择文件类型"
                  style={{ width: '100%', marginTop: '8px' }}
                  allowClear
                >
                  <Option value="image">图片</Option>
                  <Option value="document">文档</Option>
                  <Option value="spreadsheet">表格</Option>
                  <Option value="presentation">演示文稿</Option>
                  <Option value="text">文本</Option>
                </Select>
              </div>

              <div>
                <Text strong>排序方式</Text>
                <Select
                  value={filters.sortBy}
                  onChange={(value) => handleFilterChange('sortBy', value)}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <Option value="relevance">相关性</Option>
                  <Option value="created_at">创建时间</Option>
                  <Option value="view_count">浏览量</Option>
                  <Option value="download_count">下载量</Option>
                  <Option value="file_size">文件大小</Option>
                </Select>
              </div>

              <div>
                <Text strong>访问权限</Text>
                <Select
                  value={filters.isPublic}
                  onChange={(value) => handleFilterChange('isPublic', value)}
                  placeholder="选择访问权限"
                  style={{ width: '100%', marginTop: '8px' }}
                  allowClear
                >
                  <Option value={true}>公开</Option>
                  <Option value={false}>私有</Option>
                </Select>
              </div>

              <div>
                <Text strong>创建日期</Text>
                <RangePicker
                  value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
                  onChange={(dates) => {
                    if (dates && dates.length === 2) {
                      handleFilterChange('startDate', dates[0]?.toISOString());
                      handleFilterChange('endDate', dates[1]?.toISOString());
                    } else {
                      handleFilterChange('startDate', undefined);
                      handleFilterChange('endDate', undefined);
                    }
                  }}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder={['开始日期', '结束日期']}
                />
              </div>
            </Space>

            {searchResult?.facets && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  搜索统计
                </Text>
                <div style={{ marginTop: '8px' }}>
                  <Row gutter={8}>
                    {searchResult.facets.fileTypes.slice(0, 3).map(type => (
                      <Col span={24} key={type.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span>{type.type}</span>
                          <span>{type.count}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col span={18}>
          <Card
            title={
              searchResult ? (
                <Space>
                  <span>搜索结果</span>
                  {searchResult.total > 0 && (
                    <>
                      <Text type="secondary">
                        共找到 {searchResult.total} 个结果
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({searchResult.searchTime}ms)
                      </Text>
                    </>
                  )}
                </Space>
              ) : (
                '搜索结果'
              )
            }
          >
            <Spin spinning={loading}>
              {searchResult ? (
                searchResult.documents.length > 0 ? (
                  <>
                    <List
                      dataSource={searchResult.documents}
                      renderItem={renderDocumentItem}
                      split={true}
                    />

                    {searchResult.total > searchResult.pageSize && (
                      <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Pagination
                          current={searchResult.page}
                          total={searchResult.total}
                          pageSize={searchResult.pageSize}
                          onChange={handlePageChange}
                          showSizeChanger={false}
                          showQuickJumper
                          showTotal={(total, range) =>
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                          }
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <div>未找到相关文档</div>
                        <Text type="secondary">
                          试试使用其他关键词或调整筛选条件
                        </Text>
                      </div>
                    }
                  />
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textSecondary }}>
                  <SearchOutlined style={{ fontSize: 48, marginBottom: 16, color: colors.primary }} />
                  <div style={{ fontSize: 16 }}>请输入关键词开始搜索</div>
                  <Paragraph type="secondary">
                    支持按文档标题、内容、标签和文件类型搜索
                  </Paragraph>
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
