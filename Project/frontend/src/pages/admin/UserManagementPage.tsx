import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import UserManagement from './UserManagement';
import { Card, Typography, Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const UserManagementPage: React.FC = () => {
  const { isAdmin } = usePermission();
  const navigate = useNavigate();

  if (!isAdmin()) {
    return (
      <Card>
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面"
          extra={
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        用户管理
      </Title>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;