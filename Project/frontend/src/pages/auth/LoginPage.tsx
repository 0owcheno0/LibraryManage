import React, { useRef } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Layout, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';

const { Title, Text } = Typography;
const { Content } = Layout;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login, state } = useAuth();
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordInputRef = useRef<any>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    const success = await login({
      email: values.email,
      password: values.password,
    });

    if (success) {
      // 登录成功，跳转到目标页面
      navigate(from, { replace: true });
    } else {
      // 登录失败，清空密码字段并让用户重新输入
      form.setFieldsValue({ password: '' });
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: isDark 
          ? `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.backgroundTertiary} 100%)`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
      }}
    >
      {/* 主题切换器 - 右上角 */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <ThemeSwitcher type="button" size="large" />
      </div>

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
            boxShadow: isDark 
              ? '0 10px 30px rgba(0,0,0,0.5)'
              : '0 10px 30px rgba(0,0,0,0.1)',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderLight}`,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ color: colors.primary, marginBottom: 8 }}>
              团队知识库
            </Title>
            <Text style={{ color: colors.textSecondary }}>登录到您的账户</Text>
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
              <Input.Password
                ref={passwordInputRef}
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={state.isLoading} block>
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text style={{ color: colors.textSecondary }}>或</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>
              还没有账户？
              <Link to="/register" style={{ marginLeft: 8, color: colors.primary }}>
                立即注册
              </Link>
            </Text>
          </div>

          <div 
            style={{ 
              marginTop: 24, 
              padding: 16, 
              background: colors.backgroundSecondary, 
              borderRadius: 6,
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
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
