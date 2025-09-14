import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Avatar,
  Form,
  Input,
  Select,
  Switch,
  Modal,
  message,
  Spin,
  Divider,
  Tooltip,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  LinkOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CrownOutlined,
  LockOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useThemeColors } from '../../contexts/ThemeContext';
import { documentService } from '../../services/document';
import { permissionService } from '../../services/permission';
import type { Document } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DocumentPermission {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  permission_type: 'read' | 'write' | 'admin';
  granted_by: number;
  created_at: string;
}

interface ShareLink {
  id: number;
  token: string;
  expires_at: string;
  password?: string;
  download_limit?: number;
  download_count: number;
  created_at: string;
}

interface UserOption {
  id: number;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

const DocumentPermissions: React.FC<{ document: Document }> = ({ document }) => {
  const colors = useThemeColors();
  const [loading, setLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState<boolean>(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [permissionForm] = Form.useForm();
  const [shareForm] = Form.useForm();

  // 获取文档权限列表
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await permissionService.getDocumentPermissions(document.id);
      // 暂时使用模拟数据
      const mockPermissions: DocumentPermission[] = [
        {
          id: 1,
          user_id: 1,
          user_name: '张三',
          user_avatar: '',
          permission_type: 'admin',
          granted_by: 1,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 2,
          user_id: 2,
          user_name: '李四',
          permission_type: 'write',
          granted_by: 1,
          created_at: '2023-01-02T00:00:00Z',
        },
        {
          id: 3,
          user_id: 3,
          user_name: '王五',
          permission_type: 'read',
          granted_by: 1,
          created_at: '2023-01-03T00:00:00Z',
        },
      ];
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      message.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分享链接列表
  const fetchShareLinks = async () => {
    // 暂时使用模拟数据
    const mockShareLinks: ShareLink[] = [
      {
        id: 1,
        token: 'abc123',
        expires_at: '2023-12-31T23:59:59Z',
        password: '123456',
        download_limit: 100,
        download_count: 10,
        created_at: '2023-01-01T00:00:00Z',
      },
    ];
    setShareLinks(mockShareLinks);
  };

  // 搜索用户
  const searchUsers = async (keyword: string) => {
    if (!keyword.trim()) {
      setUserOptions([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      // 这里应该调用实际的API搜索用户
      // 暂时使用模拟数据
      const mockUsers: UserOption[] = [
        {
          id: 4,
          username: 'zhaoliu',
          full_name: '赵六',
          email: 'zhaoliu@example.com',
        },
        {
          id: 5,
          username: 'sunqi',
          full_name: '孙七',
          email: 'sunqi@example.com',
        },
      ];
      setUserOptions(mockUsers);
    } catch (error) {
      console.error('搜索用户失败:', error);
      message.error('搜索用户失败');
    } finally {
      setUserSearchLoading(false);
    }
  };

  // 添加用户权限
  const handleAddPermission = async (values: any) => {
    try {
      await permissionService.addPermission(document.id, values.user, values.permission);
      message.success('权限添加成功');
      setPermissionModalVisible(false);
      permissionForm.resetFields();
      fetchPermissions();
    } catch (error) {
      console.error('添加权限失败:', error);
      message.error('添加权限失败');
    }
  };

  // 移除用户权限
  const handleRemovePermission = async (permissionId: number) => {
    try {
      // 这里需要实现移除权限的API
      message.success('权限移除成功');
      fetchPermissions();
    } catch (error) {
      console.error('移除权限失败:', error);
      message.error('移除权限失败');
    }
  };

  // 生成分享链接
  const handleGenerateShareLink = async (values: any) => {
    try {
      const { shareToken, shareUrl } = await permissionService.generateShareLink(
        document.id,
        values.expiresAt,
        values.password,
        values.downloadLimit
      );
      message.success('分享链接生成成功');
      setShareModalVisible(false);
      shareForm.resetFields();
      fetchShareLinks();
    } catch (error) {
      console.error('生成分享链接失败:', error);
      message.error('生成分享链接失败');
    }
  };

  // 删除分享链接
  const handleDeleteShareLink = async (linkId: number) => {
    try {
      // 这里需要实现删除分享链接的API
      message.success('分享链接删除成功');
      fetchShareLinks();
    } catch (error) {
      console.error('删除分享链接失败:', error);
      message.error('删除分享链接失败');
    }
  };

  // 复制分享链接
  const copyShareLink = (token: string) => {
    const shareUrl = `${window.location.origin}/api/v1/shared/${token}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('链接已复制到剪贴板');
  };

  useEffect(() => {
    fetchPermissions();
    fetchShareLinks();
  }, [document.id]);

  // 权限类型标签
  const renderPermissionTag = (permissionType: string) => {
    switch (permissionType) {
      case 'read':
        return <Tag icon={<EyeOutlined />} color="blue">只读</Tag>;
      case 'write':
        return <Tag icon={<EditOutlined />} color="green">读写</Tag>;
      case 'admin':
        return <Tag icon={<CrownOutlined />} color="gold">管理</Tag>;
      default:
        return <Tag>{permissionType}</Tag>;
    }
  };

  // 权限列表列定义
  const permissionColumns = [
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (_: any, record: DocumentPermission) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={record.user_avatar} />
          <span>{record.user_name}</span>
        </Space>
      ),
    },
    {
      title: '权限',
      dataIndex: 'permission_type',
      key: 'permission_type',
      render: (permissionType: string) => renderPermissionTag(permissionType),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DocumentPermission) => (
        <Popconfirm
          title="确定要移除该用户的权限吗？"
          onConfirm={() => handleRemovePermission(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button icon={<DeleteOutlined />} size="small" danger>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 分享链接列表列定义
  const shareLinkColumns = [
    {
      title: '链接',
      dataIndex: 'token',
      key: 'token',
      render: (token: string) => (
        <Space>
          <Text code>/shared/{token}</Text>
          <Tooltip title="复制链接">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => copyShareLink(token)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (expiresAt: string) => (
        <Space>
          <CalendarOutlined />
          {expiresAt ? new Date(expiresAt).toLocaleString() : '永不过期'}
        </Space>
      ),
    },
    {
      title: '密码保护',
      dataIndex: 'password',
      key: 'password',
      render: (password: string) => (
        password ? <LockOutlined style={{ color: '#fa8c16' }} /> : '无'
      ),
    },
    {
      title: '下载次数',
      dataIndex: 'download_count',
      key: 'download_count',
      render: (_: any, record: ShareLink) => (
        <span>
          <DownloadOutlined /> {record.download_count}
          {record.download_limit ? `/${record.download_limit}` : ''}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ShareLink) => (
        <Popconfirm
          title="确定要删除这个分享链接吗？"
          onConfirm={() => handleDeleteShareLink(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button icon={<DeleteOutlined />} size="small" danger>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={24}>
        {/* 用户权限管理 */}
        <Col span={24}>
          <Card 
            title="用户权限" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setPermissionModalVisible(true)}
              >
                添加用户
              </Button>
            }
          >
            <Table
              dataSource={permissions}
              columns={permissionColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>

        {/* 分享链接管理 */}
        <Col span={24} style={{ marginTop: '24px' }}>
          <Card 
            title="分享链接" 
            extra={
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={() => setShareModalVisible(true)}
              >
                生成链接
              </Button>
            }
          >
            <Table
              dataSource={shareLinks}
              columns={shareLinkColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* 添加权限模态框 */}
      <Modal
        title="添加用户权限"
        open={permissionModalVisible}
        onCancel={() => {
          setPermissionModalVisible(false);
          permissionForm.resetFields();
        }}
        onOk={() => permissionForm.submit()}
        width={500}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleAddPermission}
        >
          <Form.Item
            name="user"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select
              showSearch
              placeholder="搜索用户名或邮箱"
              onSearch={searchUsers}
              notFoundContent={userSearchLoading ? <Spin size="small" /> : null}
            >
              {userOptions.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{user.full_name} ({user.username})</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{user.email}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="permission"
            label="权限级别"
            rules={[{ required: true, message: '请选择权限级别' }]}
          >
            <Select placeholder="请选择权限级别">
              <Option value="read">
                <Space>
                  <EyeOutlined />
                  <span>只读</span>
                  <Text type="secondary">只能查看和下载文档</Text>
                </Space>
              </Option>
              <Option value="write">
                <Space>
                  <EditOutlined />
                  <span>读写</span>
                  <Text type="secondary">可以编辑和管理文档</Text>
                </Space>
              </Option>
              <Option value="admin">
                <Space>
                  <CrownOutlined />
                  <span>管理</span>
                  <Text type="secondary">完全控制权限</Text>
                </Space>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 生成分享链接模态框 */}
      <Modal
        title="生成分享链接"
        open={shareModalVisible}
        onCancel={() => {
          setShareModalVisible(false);
          shareForm.resetFields();
        }}
        onOk={() => shareForm.submit()}
        width={500}
      >
        <Form
          form={shareForm}
          layout="vertical"
          onFinish={handleGenerateShareLink}
        >
          <Form.Item
            name="expiresAt"
            label="过期时间"
            rules={[{ required: true, message: '请选择过期时间' }]}
          >
            <Select placeholder="请选择过期时间">
              <Option value="1d">1天后</Option>
              <Option value="7d">7天后</Option>
              <Option value="30d">30天后</Option>
              <Option value="never">永不过期</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="password"
            label="访问密码"
          >
            <Input.Password placeholder="可选，设置访问密码" />
          </Form.Item>
          
          <Form.Item
            name="downloadLimit"
            label="下载次数限制"
          >
            <Input type="number" placeholder="可选，限制下载次数" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentPermissions;