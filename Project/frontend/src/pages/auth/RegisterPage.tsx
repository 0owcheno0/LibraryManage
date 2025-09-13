import React from 'react';
import { Card, Form, Input, Button, Typography, Divider, Layout } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Content } = Layout;

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [form] = Form.useForm();
  const { register, state } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterForm) => {
    const { confirmPassword, ...registerData } = values;
    const success = await register(registerData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Content style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
              团队知识库
            </Title>
            <Text type="secondary">创建新账户</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3位' },
                { max: 20, message: '用户名最多20位' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱地址"
              />
            </Form.Item>


            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={state.isLoading}
                block
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">或</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              已有账户？
              <Link to="/login" style={{ marginLeft: 8 }}>
                立即登录
              </Link>
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}