import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Avatar, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Upload, 
  message,
  Space
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  UploadOutlined, 
  LockOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../contexts/ThemeContext';

const { Title } = Typography;

interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
}

export default function ProfilePage() {
  const { state, updateUser } = useAuth();
  const colors = useThemeColors();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // 编辑资料
  const handleEditProfile = () => {
    editForm.setFieldsValue({
      full_name: state.user?.full_name,
      email: state.user?.email,
    });
    setIsEditModalVisible(true);
  };
  
  // 保存资料
  const handleSaveProfile = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      if (result.code === 200) {
        message.success('资料更新成功');
        
        // 更新本地用户信息
        const updatedUser = result.data as UserProfile;
        updateUser(updatedUser);
        
        setIsEditModalVisible(false);
      } else {
        message.error(result.message || '更新资料失败');
      }
    } catch (error) {
      console.error('更新资料失败:', error);
      message.error('更新资料失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 修改密码
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/users/me/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });
      
      const result = await response.json();
      if (result.code === 200) {
        message.success('密码修改成功');
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(result.message || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 上传头像
  const handleAvatarUpload = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('http://localhost:8000/api/v1/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      if (result.code === 200) {
        message.success('头像上传成功');
        
        // 更新本地用户信息
        const updatedUser = { ...state.user, avatar_url: result.data.avatar_url } as UserProfile;
        updateUser(updatedUser);
        
        setAvatarModalVisible(false);
      } else {
        message.error(result.message || '上传头像失败');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      message.error('上传头像失败');
    }
    
    return false; // 阻止默认上传行为
  };
  
  // 关闭编辑模态框
  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };
  
  // 关闭密码模态框
  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
    passwordForm.resetFields();
  };
  
  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        个人资料
      </Title>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              src={state.user?.avatar_url}
              style={{ marginRight: 24 }}
            />
            <Button 
              type="primary" 
              size="small" 
              icon={<UploadOutlined />}
              style={{ position: 'absolute', bottom: 0, right: 24 }}
              onClick={() => setAvatarModalVisible(true)}
            />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {state.user?.full_name || '用户'}
            </Title>
            <div style={{ color: colors.textSecondary, marginTop: 8 }}>{state.user?.role || '普通用户'}</div>
          </div>
        </div>

        <Descriptions
          title="基本信息"
          bordered
          column={1}
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEditProfile}
              >
                编辑资料
              </Button>
              <Button 
                icon={<LockOutlined />}
                onClick={() => setIsPasswordModalVisible(true)}
              >
                修改密码
              </Button>
            </Space>
          }
        >
          <Descriptions.Item label="用户名">{state.user?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{state.user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">{state.user?.full_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">{state.user?.role || '-'}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{state.user?.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {state.user?.created_at ? new Date(state.user.created_at).toLocaleDateString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑个人资料"
        visible={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="full_name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存
              </Button>
              <Button onClick={handleEditModalCancel} icon={<CloseOutlined />}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        visible={isPasswordModalVisible}
        onCancel={handlePasswordModalCancel}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度不能少于6位' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[{ required: true, message: '请确认新密码' }, ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            })]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                修改密码
              </Button>
              <Button onClick={handlePasswordModalCancel} icon={<CloseOutlined />}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传头像模态框 */}
      <Modal
        title="上传头像"
        visible={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
      >
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>选择图片</Button>
          <div style={{ marginTop: 16, color: colors.textSecondary }}>
            支持JPG、PNG格式，文件大小不超过5MB
          </div>
        </Upload>
      </Modal>
    </div>
  );
}
