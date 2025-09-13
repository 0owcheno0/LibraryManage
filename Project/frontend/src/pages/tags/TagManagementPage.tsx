import React from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';
import { PlusOutlined, TagsOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function TagManagementPage() {
  const mockTags = [
    { name: '技术文档', color: '#1890ff' },
    { name: '产品文档', color: '#52c41a' },
    { name: 'API文档', color: '#722ed1' },
    { name: '用户手册', color: '#fa8c16' },
    { name: '项目文档', color: '#eb2f96' },
    { name: '培训资料', color: '#13c2c2' },
    { name: '规范标准', color: '#f5222d' },
    { name: '会议记录', color: '#52c41a' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          标签管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          创建标签
        </Button>
      </div>

      <Card title="预设标签">
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          系统已预设了8个基础标签，您可以在此基础上创建更多标签
        </Paragraph>
        
        <Space wrap size="middle">
          {mockTags.map((tag, index) => (
            <Tag
              key={index}
              color={tag.color}
              icon={<TagsOutlined />}
              style={{ 
                padding: '4px 12px', 
                fontSize: '14px',
                borderRadius: '16px'
              }}
            >
              {tag.name}
            </Tag>
          ))}
        </Space>

        <div style={{ marginTop: 32, textAlign: 'center', color: '#999' }}>
          <TagsOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>标签管理功能开发中</div>
          <div>包括创建、编辑、删除标签，以及标签使用统计</div>
        </div>
      </Card>
    </div>
  );
}