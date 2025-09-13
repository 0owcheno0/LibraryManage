import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function DocumentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/documents')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          文档详情
        </Title>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={3}>文档详情页面</Title>
          <Paragraph type="secondary">文档ID: {id}</Paragraph>
          <Paragraph type="secondary">该页面用于显示文档的详细信息、预览和操作</Paragraph>
        </div>
      </Card>
    </div>
  );
}
