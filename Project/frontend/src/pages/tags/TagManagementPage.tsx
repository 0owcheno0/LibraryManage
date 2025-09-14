import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Table,
  Modal,
  Form,
  Input,
  ColorPicker,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  Empty,
  Select
} from 'antd';
import {
  PlusOutlined,
  TagsOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  SyncOutlined,
  FireOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { tagService, CreateTagData, UpdateTagData } from '../../services/tag';
import { ErrorHandler } from '../../utils/errorHandler';

const { Title, Text } = Typography;
const { Search } = Input;

interface TagData {
  id: number;
  name: string;
  color: string;
  description?: string;
  created_by?: number;
  usage_count?: number;
  document_count?: number;
  created_at: string;
  updated_at: string;
}

interface TagListResponse {
  tags: TagData[];
  total: number;
  page: number;
  pageSize: number;
}

interface CreateTagForm {
  name: string;
  color: string;
  description?: string;
}

export default function TagManagementPage() {
  const colors = useThemeColors();
  const { state } = useAuth();
  
  // 状态管理
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage_count' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // Modal状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [popularTags, setPopularTags] = useState<TagData[]>([]);
  
  // 表单
  const [createForm] = Form.useForm<CreateTagForm>();
  const [editForm] = Form.useForm<CreateTagForm>();

  // 加载标签列表
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await tagService.getTags();
      // 现在data是包含tags字段的对象
      setTags(response.data?.tags || []);
      setTotal(response.data?.tags?.length || 0);
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message || '加载标签列表失败');
      console.error('Load tags error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载热门标签
  const loadPopularTags = async () => {
    try {
      const response = await tagService.getPopularTags();
      // 现在data是包含tags字段的对象
      setPopularTags(response.data?.tags?.slice(0, 5) || []);
    } catch (error) {
      console.error('Load popular tags error:', error);
    }
  };

  // 创建标签
  const handleCreateTag = async (values: CreateTagForm) => {
    try {
      const response = await tagService.createTag(values);
      
      message.success('标签创建成功');
      setCreateModalVisible(false);
      createForm.resetFields();
      loadTags();
      loadPopularTags();
    } catch (error: any) {
      // 使用统一的错误处理器
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message);
      
      console.error('标签创建失败:', errorInfo);
    }
  };

  // 编辑标签
  const handleEditTag = async (values: CreateTagForm) => {
    if (!editingTag) return;
    
    try {
      await tagService.updateTag(editingTag.id, values);
      
      message.success('标签更新成功');
      setEditModalVisible(false);
      setEditingTag(null);
      editForm.resetFields();
      loadTags();
      loadPopularTags();
    } catch (error: any) {
      // 使用统一的错误处理器
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message);
      
      console.error('标签更新失败:', errorInfo);
    }
  };

  // 删除标签
  const handleDeleteTag = async (tagId: number, force = false) => {
    try {
      await tagService.deleteTag(tagId);
      
      message.success('标签删除成功');
      loadTags();
      loadPopularTags();
    } catch (error: any) {
      // 使用统一的错误处理器
      const errorInfo = ErrorHandler.handleApiError(error);
      
      // 处理特殊的409冲突错误（标签正在使用中）
      if (error.response?.status === 409 && !force) {
        const documentCount = error.response?.data?.data?.documentCount || 0;
        Modal.confirm({
          title: '标签正在使用中',
          content: `该标签被 ${documentCount} 个文档使用，强制删除将会移除所有关联关系。确定要删除吗？`,
          okText: '强制删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => handleDeleteTag(tagId, true)
        });
      } else {
        message.error(errorInfo.message);
        console.error('标签删除失败:', errorInfo);
      }
    }
  };

  // 同步使用次数统计
  const handleSyncUsageCounts = async () => {
    try {
      await tagService.syncUsageCounts();
      
      message.success('统计数据同步成功');
      loadTags();
      loadPopularTags();
    } catch (error: any) {
      // 使用统一的错误处理器
      const errorInfo = ErrorHandler.handleApiError(error);
      message.error(errorInfo.message);
      
      console.error('统计数据同步失败:', errorInfo);
    }
  };

  // 打开编辑模态框
  const openEditModal = (tag: TagData) => {
    setEditingTag(tag);
    editForm.setFieldsValue({
      name: tag.name,
      color: tag.color,
      description: tag.description
    });
    setEditModalVisible(true);
  };

  // 检查用户是否可以编辑/删除标签
  const canEditTag = (tag: TagData) => {
    return state.user?.role === 'admin' || tag.created_by === state.user?.id;
  };

  // 表格列定义
  const columns: ColumnsType<TagData> = [
    {
      title: '标签',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TagData) => (
        <Space>
          <Tag 
            color={record.color} 
            style={{ 
              borderRadius: '12px',
              fontSize: '13px',
              padding: '2px 8px'
            }}
          >
            {name}
          </Tag>
        </Space>
      ),
      sorter: true,
      sortOrder: sortBy === 'name' ? (sortOrder === 'ASC' ? 'ascend' : 'descend') : null,
    },
    {
      title: '使用次数',
      dataIndex: 'document_count',
      key: 'document_count',
      render: (count: number) => (
        <Badge 
          count={count} 
          style={{ 
            backgroundColor: (count || 0) > 0 ? '#52c41a' : '#d9d9d9'
          }} 
        />
      ),
      sorter: true,
      sortOrder: sortBy === 'usage_count' ? (sortOrder === 'ASC' ? 'ascend' : 'descend') : null,
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {description || '-'}
        </Text>
      ),
      ellipsis: { showTitle: false },
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(time).toLocaleDateString()}
        </Text>
      ),
      sorter: true,
      sortOrder: sortBy === 'created_at' ? (sortOrder === 'ASC' ? 'ascend' : 'descend') : null,
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: TagData) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: '标签详情',
                  width: 500,
                  content: (
                    <div style={{ padding: '16px 0' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>标签名称：</Text>
                          <Tag color={record.color} style={{ marginLeft: 8 }}>
                            {record.name}
                          </Tag>
                        </div>
                        <div>
                          <Text strong>颜色：</Text>
                          <span style={{ marginLeft: 8 }}>{record.color}</span>
                          <div 
                            style={{ 
                              display: 'inline-block',
                              width: 16,
                              height: 16,
                              backgroundColor: record.color,
                              borderRadius: '50%',
                              marginLeft: 8,
                              border: '1px solid #d9d9d9'
                            }} 
                          />
                        </div>
                        <div>
                          <Text strong>描述：</Text>
                          <Text style={{ marginLeft: 8 }}>
                            {record.description || '暂无描述'}
                          </Text>
                        </div>
                        <div>
                          <Text strong>使用次数：</Text>
                          <Badge 
                            count={record.document_count || 0} 
                            style={{ 
                              backgroundColor: (record.document_count || 0) > 0 ? '#52c41a' : '#d9d9d9',
                              marginLeft: 8
                            }} 
                          />
                        </div>
                        <div>
                          <Text strong>创建时间：</Text>
                          <Text style={{ marginLeft: 8 }}>
                            {new Date(record.created_at).toLocaleString()}
                          </Text>
                        </div>
                        <div>
                          <Text strong>更新时间：</Text>
                          <Text style={{ marginLeft: 8 }}>
                            {new Date(record.updated_at).toLocaleString()}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  )
                });
              }}
            />
          </Tooltip>
          
          {canEditTag(record) && (
            <>
              <Tooltip title="编辑标签">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(record)}
                />
              </Tooltip>
              
              <Popconfirm
                title="确定要删除这个标签吗？"
                description={
                  (record.document_count || 0) > 0 
                    ? `该标签被 ${record.document_count || 0} 个文档使用，删除后需要处理关联关系。`
                    : '删除后无法恢复。'
                }
                onConfirm={() => handleDeleteTag(record.id)}
                okText="删除"
                cancelText="取消"
                okType="danger"
              >
                <Tooltip title="删除标签">
                  <Button 
                    type="text" 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: 150,
      fixed: 'right',
    },
  ];

  // 处理表格变化
  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    if (sorter.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'ASC' : 'DESC');
    }
    
    if (pagination.current !== page || pagination.pageSize !== pageSize) {
      setPage(pagination.current);
      setPageSize(pagination.pageSize);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadTags();
    loadPopularTags();
  }, [page, pageSize, sortBy, sortOrder, searchKeyword]);

  return (
    <div>
      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          <TagsOutlined style={{ marginRight: 8, color: colors.primary }} />
          标签管理
        </Title>
        <Space>
          {state.user?.role === 'admin' && (
            <Tooltip title="同步所有标签的使用次数统计">
              <Button 
                icon={<SyncOutlined />} 
                onClick={handleSyncUsageCounts}
              >
                同步统计
              </Button>
            </Tooltip>
          )}
          {(state.user?.role === 'admin' || state.user?.role === 'editor') && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              创建标签
            </Button>
          )}
        </Space>
      </div>

      {/* 统计信息和热门标签 */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title={<><FireOutlined /> 热门标签</>} size="small">
            {popularTags.length > 0 ? (
              <Space wrap>
                {popularTags.map(tag => (
                  <Tag 
                    key={tag.id}
                    color={tag.color}
                    style={{ 
                      borderRadius: '12px',
                      fontSize: '13px',
                      padding: '4px 10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditModal(tag)}
                  >
                    {tag.name} ({tag.document_count})
                  </Tag>
                ))}
              </Space>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="暂无热门标签" 
              />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title="标签总数" 
              value={total} 
              prefix={<TagsOutlined />}
              valueStyle={{ color: colors.primary }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card 
        title="标签列表" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Search
              placeholder="搜索标签名称"
              allowClear
              style={{ width: 250 }}
              onSearch={setSearchKeyword}
              enterButton={<SearchOutlined />}
            />
            <Select
              value={`${sortBy}_${sortOrder}`}
              style={{ width: 150 }}
              onChange={(value) => {
                const [field, order] = value.split('_');
                setSortBy(field as any);
                setSortOrder(order as 'ASC' | 'DESC');
              }}
              options={[
                { value: 'name_ASC', label: '名称 A-Z' },
                { value: 'name_DESC', label: '名称 Z-A' },
                { value: 'usage_count_DESC', label: '使用次数↓' },
                { value: 'usage_count_ASC', label: '使用次数↑' },
                { value: 'created_at_DESC', label: '最新创建' },
                { value: 'created_at_ASC', label: '最早创建' },
              ]}
            />
          </Space>
        }
      >
        <Table<TagData>
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 创建标签模态框 */}
      <Modal
        title="创建标签"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTag}
          initialValues={{
            color: '#1890ff'
          }}
        >
          <Form.Item
            label="标签名称"
            name="name"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 50, message: '标签名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          
          <Form.Item
            label="标签颜色"
            name="color"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker 
              showText 
              format="hex"
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#1890ff', '#52c41a', '#722ed1', '#fa8c16',
                    '#eb2f96', '#13c2c2', '#f5222d', '#fa541c'
                  ]
                }
              ]}
            />
          </Form.Item>
          
          <Form.Item
            label="标签描述"
            name="description"
            rules={[{ max: 500, message: '描述不能超过500个字符' }]}
          >
            <Input.TextArea 
              placeholder="请输入标签描述（可选）"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑标签模态框 */}
      <Modal
        title="编辑标签"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTag(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditTag}
        >
          <Form.Item
            label="标签名称"
            name="name"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 50, message: '标签名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          
          <Form.Item
            label="标签颜色"
            name="color"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker 
              showText 
              format="hex"
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#1890ff', '#52c41a', '#722ed1', '#fa8c16',
                    '#eb2f96', '#13c2c2', '#f5222d', '#fa541c'
                  ]
                }
              ]}
            />
          </Form.Item>
          
          <Form.Item
            label="标签描述"
            name="description"
            rules={[{ max: 500, message: '描述不能超过500个字符' }]}
          >
            <Input.TextArea 
              placeholder="请输入标签描述（可选）"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
