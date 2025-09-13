import React from 'react';
import { Card, Typography, Descriptions, Avatar, Button, Space } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeColors } from '../../contexts/ThemeContext';

const { Title } = Typography;

export default function ProfilePage() {
  const { state } = useAuth();
  const colors = useThemeColors();

  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        个人资料
      </Title>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={state.user?.avatar_url}
            style={{ marginRight: 24 }}
          />
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
            <Button type="primary" icon={<EditOutlined />}>
              编辑资料
            </Button>
          }
        >
          <Descriptions.Item label="用户名">{state.user?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{state.user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">{state.user?.full_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">{state.user?.role || '-'}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{state.user?.id || '-'}</Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 32, textAlign: 'center', color: colors.textSecondary }}>
          个人资料编辑功能开发中...
        </div>
      </Card>
    </div>
  );
}
