import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Button } from 'antd';
import {
  FileTextOutlined,
  TagsOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../contexts/ThemeContext';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const colors = useThemeColors();

  const stats = [
    {
      title: '文档总数',
      value: 0,
      icon: <FileTextOutlined style={{ color: colors.primary }} />,
    },
    {
      title: '标签总数',
      value: 8,
      icon: <TagsOutlined style={{ color: colors.success }} />,
    },
    {
      title: '今日下载',
      value: 0,
      icon: <DownloadOutlined style={{ color: colors.warning }} />,
    },
    {
      title: '总浏览量',
      value: 0,
      icon: <EyeOutlined style={{ color: colors.info }} />,
    },
  ];

  const quickActions = [
    {
      title: '上传文档',
      description: '上传新的文档到知识库',
      icon: <PlusOutlined />,
      onClick: () => navigate('/documents'),
    },
    {
      title: '搜索文档',
      description: '在知识库中查找文档',
      icon: <SearchOutlined />,
      onClick: () => navigate('/search'),
    },
    {
      title: '管理标签',
      description: '创建和管理文档标签',
      icon: <TagsOutlined />,
      onClick: () => navigate('/tags'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>仪表盘</Title>
        <Paragraph type="secondary">
          欢迎来到团队知识库管理系统，在这里您可以管理文档、标签和用户权限。
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ marginBottom: 16 }}>
        快速操作
      </Title>

      <Row gutter={[16, 16]}>
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card hoverable onClick={action.onClick} style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, color: colors.primary, marginBottom: 16 }}>
                  {action.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {action.title}
                </Title>
                <Paragraph type="secondary">{action.description}</Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 32 }}>
        <Col span={12}>
          <Card title="最近文档" extra={<Button type="link">查看全部</Button>}>
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
              暂无文档，
              <Button type="link" onClick={() => navigate('/documents')}>
                立即上传
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门标签" extra={<Button type="link">查看全部</Button>}>
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
              <Space direction="vertical">
                <span>系统预设了8个基础标签</span>
                <Button type="link" onClick={() => navigate('/tags')}>
                  管理标签
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
