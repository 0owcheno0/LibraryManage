import React from 'react';
import { Card, Input, Typography, Button, Space, Tag, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useThemeColors } from '../../contexts/ThemeContext';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export default function SearchPage() {
  const colors = useThemeColors();
  const popularTags = ['技术文档', '产品文档', 'API文档', '用户手册'];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        搜索文档
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="输入关键词搜索文档..."
            size="large"
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
            }
            onSearch={value => console.log('搜索:', value)}
          />

          <div>
            <Space>
              <span>热门标签:</span>
              {popularTags.map(tag => (
                <Tag key={tag} style={{ cursor: 'pointer' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="筛选条件" extra={<FilterOutlined />}>
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
              高级筛选功能
              <br />
              开发中...
            </div>
          </Card>
        </Col>

        <Col span={18}>
          <Card title="搜索结果">
            <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textSecondary }}>
              <SearchOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div style={{ fontSize: 16 }}>请输入关键词开始搜索</div>
              <Paragraph type="secondary">支持按文档标题、标签和文件类型搜索</Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
