import React from 'react';
import { Card, Form, Input, Button, Typography, Divider, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Content } = Layout;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    const success = await login({
      email: values.email,
      password: values.password,
    });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
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
            <Text type="secondary">登录到您的账户</Text>
          </div>

          <Form form={form} name="login" onFinish={onFinish} autoComplete="off" size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="邮箱地址" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={state.isLoading} block>
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">或</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              还没有账户？
              <Link to="/register" style={{ marginLeft: 8 }}>
                立即注册
              </Link>
            </Text>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#f0f2f5', borderRadius: 6 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>测试账号：</strong>
              <br />
              邮箱：admin@example.com
              <br />
              密码：admin123
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
