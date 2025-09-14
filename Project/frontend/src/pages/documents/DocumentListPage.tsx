import React, { useState } from 'react';
import { Card, Typography, Button, Space, Row, Col } from 'antd';
import { FileTextOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import DocumentList from './DocumentList';

const { Title, Text } = Typography;

export default function DocumentListPage() {
  const navigate = useNavigate();
  const { canUploadDocument } = usePermission();

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined /> 文档管理
          </Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<TeamOutlined />} 
              onClick={() => navigate('/documents/team')}
            >
              团队文档
            </Button>
            {canUploadDocument() && (
              <Button 
                type="primary" 
                icon={<UploadOutlined />} 
                onClick={() => navigate('/documents/upload')}
              >
                上传文档
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Card>
        <DocumentList />
      </Card>
    </div>
  );
}
