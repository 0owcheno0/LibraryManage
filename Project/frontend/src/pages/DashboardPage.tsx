import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Button, Spin, Alert } from 'antd';
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
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { documentService } from '../services/document';
import { tagService } from '../services/tag';
import { ErrorHandler } from '../utils/errorHandler';

const { Title, Paragraph } = Typography;

interface DashboardStats {
  documentsTotal: number;
  tagsTotal: number;
  todayDownloads: number;
  totalViews: number;
  myDocuments: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const { state } = useAuth();
  const { canUploadDocument } = usePermission();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    documentsTotal: 0,
    tagsTotal: 0,
    todayDownloads: 0,
    totalViews: 0,
    myDocuments: 0,
  });

  // 获取仪表板统计数据
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // 并行获取统计数据
      const [documentsResponse, tagsResponse] = await Promise.all([
        documentService.getDocuments({ page: 1, pageSize: 1 }),
        tagService.getTags()
      ]);

      setStats({
        documentsTotal: documentsResponse.total || 0,
        tagsTotal: tagsResponse.data?.length || 0,
        todayDownloads: documentsResponse.stats?.totalDownloads || 0,
        totalViews: documentsResponse.stats?.totalViews || 0,
        myDocuments: documentsResponse.stats?.myDocuments || 0,
      });
    } catch (error: any) {
      const errorInfo = ErrorHandler.handleApiError(error);
      setError(errorInfo.message);
      console.error('获取仪表板统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statisticsData = [
    {
      title: '文档总数',
      value: stats.documentsTotal,
      icon: <FileTextOutlined style={{ color: colors.primary }} />,
    },
    {
      title: '标签总数',
      value: stats.tagsTotal,
      icon: <TagsOutlined style={{ color: colors.success }} />,
    },
    {
      title: '今日下载',
      value: stats.todayDownloads,
      icon: <DownloadOutlined style={{ color: colors.warning }} />,
    },
    {
      title: '总浏览量',
      value: stats.totalViews,
      icon: <EyeOutlined style={{ color: colors.info }} />,
    },
  ];

  // 基于用户权限动态生成快速操作
  const quickActions = [
    ...(canUploadDocument() ? [{
      title: '上传文档',
      description: '上传新的文档到知识库',
      icon: <PlusOutlined />,
      onClick: () => navigate('/documents'),
      show: true,
    }] : []),
    {
      title: '搜索文档',
      description: '在知识库中查找文档',
      icon: <SearchOutlined />,
      onClick: () => navigate('/search'),
      show: true,
    },
    {
      title: '管理标签',
      description: '创建和管理文档标签',
      icon: <TagsOutlined />,
      onClick: () => navigate('/tags'),
      show: true,
    },
  ].filter(action => action.show);

  // 如果有错误，显示错误信息和重试选项
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>仪表盘</Title>
          <Paragraph type="secondary">
            欢迎来到团队知识库管理系统，在这里您可以管理文档、标签和用户权限。
          </Paragraph>
        </div>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          action={
            <Button size="small" danger onClick={fetchDashboardStats}>
              重试
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>仪表盘</Title>
        <Paragraph type="secondary">
          欢迎来到团队知识库管理系统，{state.user?.full_name || '用户'}！在这里您可以管理文档、标签和用户权限。
        </Paragraph>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {statisticsData.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card hoverable>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ fontSize: 24 }}
                  loading={loading}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

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
          <Card 
            title="最近文档" 
            extra={<Button type="link" onClick={() => navigate('/documents')}>查看全部</Button>}
          >
            <Spin spinning={loading}>
              <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
                {stats.documentsTotal > 0 ? (
                  <div>
                    <FileTextOutlined style={{ fontSize: 48, color: colors.primary, marginBottom: 16 }} />
                    <div>共有 {stats.documentsTotal} 个文档</div>
                    <Button type="link" onClick={() => navigate('/documents')}>
                      浏览文档
                    </Button>
                  </div>
                ) : (
                  <div>
                    暂无文档，
                    {canUploadDocument() && (
                      <Button type="link" onClick={() => navigate('/documents')}>
                        立即上传
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Spin>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="标签管理" 
            extra={<Button type="link" onClick={() => navigate('/tags')}>查看全部</Button>}
          >
            <Spin spinning={loading}>
              <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
                <Space direction="vertical">
                  <TagsOutlined style={{ fontSize: 48, color: colors.success, marginBottom: 16 }} />
                  <span>系统共有 {stats.tagsTotal} 个标签</span>
                  <Button type="link" onClick={() => navigate('/tags')}>
                    管理标签
                  </Button>
                </Space>
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
