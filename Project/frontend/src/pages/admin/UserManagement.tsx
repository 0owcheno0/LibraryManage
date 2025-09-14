import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Popconfirm,
  Card,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { useThemeColors } from '../../contexts/ThemeContext';

const { Column } = Table;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role_id: number;
  role_name: string;
  status: number;
  created_at: string;
  last_login_at?: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  const { state: authState } = useAuth();
  const { isAdmin } = usePermission();
  const colors = useThemeColors();

  // 检查权限
  useEffect(() => {
    if (!isAdmin()) {
      message.error('无权限访问此页面');
      // 这里应该重定向到无权限页面
    }
  }, [isAdmin]);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/users?page=${currentPage}&pageSize=${pageSize}&keyword=${searchKeyword}`,
        {
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = await response.json();
      if (result.code === 200) {
        const data = result.data as UserListResponse;
        setUsers(data.users);
        setTotal(data.total);
      } else {
        message.error(result.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // 搜索用户
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    fetchUsers();
  };

  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      role_id: user.role_id,
      status: user.status === 1,
    });
    setIsModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = await response.json();
      if (result.code === 200) {
        message.success('用户删除成功');
        fetchUsers(); // 重新加载用户列表
      } else {
        message.error(result.message || '删除用户失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    if (!editingUser) return;
    
    try {
      // 更新用户角色
      if (values.role_id !== undefined && values.role_id !== editingUser.role_id) {
        const roleResponse = await fetch(
          `http://localhost:8000/api/v1/admin/users/${editingUser.id}/roles`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authState.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role_id: values.role_id }),
          }
        );
        
        const roleResult = await roleResponse.json();
        if (roleResult.code !== 200) {
          message.error(roleResult.message || '更新用户角色失败');
          return;
        }
      }
      
      // 更新用户状态
      const newStatus = values.status ? 1 : 0;
      if (newStatus !== editingUser.status) {
        const statusResponse = await fetch(
          `http://localhost:8000/api/v1/admin/users/${editingUser.id}/status`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authState.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        
        const statusResult = await statusResponse.json();
        if (statusResult.code !== 200) {
          message.error(statusResult.message || '更新用户状态失败');
          return;
        }
      }
      
      message.success('用户信息更新成功');
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers(); // 重新加载用户列表
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error('更新用户信息失败');
    }
  };

  // 关闭模态框
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // 初始化数据
  useEffect(() => {
    if (authState.token) {
      fetchUsers();
    }
  }, [authState.token, currentPage, pageSize, searchKeyword]);

  // 角色标签颜色映射
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'editor':
        return 'blue';
      case 'viewer':
        return 'green';
      default:
        return 'default';
    }
  };

  // 状态标签
  const getStatusTag = (status: number) => {
    return status === 1 ? (
      <Tag color="green">启用</Tag>
    ) : (
      <Tag color="red">禁用</Tag>
    );
  };

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索用户名、邮箱或姓名"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleResetSearch}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={users}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          rowKey="id"
        >
          <Column
            title="用户ID"
            dataIndex="id"
            key="id"
            width={80}
          />
          <Column
            title="用户名"
            dataIndex="username"
            key="username"
          />
          <Column
            title="邮箱"
            dataIndex="email"
            key="email"
          />
          <Column
            title="姓名"
            dataIndex="full_name"
            key="full_name"
          />
          <Column
            title="角色"
            dataIndex="role_name"
            key="role_name"
            render={(roleName: string) => (
              <Tag color={getRoleColor(roleName)}>{roleName}</Tag>
            )}
          />
          <Column
            title="状态"
            dataIndex="status"
            key="status"
            render={(status: number) => getStatusTag(status)}
          />
          <Column
            title="创建时间"
            dataIndex="created_at"
            key="created_at"
            render={(date: string) => new Date(date).toLocaleDateString()}
          />
          <Column
            title="最后登录"
            dataIndex="last_login_at"
            key="last_login_at"
            render={(date: string) => date ? new Date(date).toLocaleDateString() : '-'}
          />
          <Column
            title="操作"
            key="action"
            width={150}
            render={(_, record: User) => (
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEditUser(record)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个用户吗？"
                  onConfirm={() => handleDeleteUser(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    disabled={record.id === authState.user?.id}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {editingUser && (
            <>
              <Form.Item label="用户名">
                <Input value={editingUser.username} disabled />
              </Form.Item>
              <Form.Item label="邮箱">
                <Input value={editingUser.email} disabled />
              </Form.Item>
              <Form.Item label="姓名">
                <Input value={editingUser.full_name} disabled />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="role_id"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value={1}>管理员</Option>
              <Option value={2}>编辑者</Option>
              <Option value={3}>查看者</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={handleModalCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;