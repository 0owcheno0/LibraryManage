import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Tabs,
  Statistic,
  Divider,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  GlobalOutlined,
  LockOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import TeamDocumentList from './TeamDocumentList';
import type { Document } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const TeamDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { canUploadDocument } = usePermission();
  const [activeTab, setActiveTab] = useState<string>('team');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // 获取文档统计信息（模拟数据）
  const stats = {
    total: 128,
    public: 45,
    private: 83,
    myDocuments: 32,
  };

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑在TeamDocumentList组件中处理
  };

  // 处理重置
  const handleReset = () => {
    setSearchKeyword('');
    setFileType('');
    setDateRange([null, null]);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <TeamOutlined /> 团队文档
      </Title>
      
      {/* 统计信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="团队文档"
              value={stats.total || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="公开文档"
              value={stats.public || 0}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="私有文档"
              value={stats.private || 0}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="我的文档"
              value={stats.myDocuments || 0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="团队文档" key="team">
          <Card>
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Input
                    placeholder="搜索文档标题或描述"
                    prefix={<SearchOutlined />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                  />
                </Col>
                <Col>
                  <Select
                    placeholder="文件类型"
                    style={{ width: 120 }}
                    value={fileType}
                    onChange={setFileType}
                    allowClear
                  >
                    <Option value="application/pdf">PDF</Option>
                    <Option value="application/msword">Word</Option>
                    <Option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (.docx)</Option>
                    <Option value="application/vnd.ms-excel">Excel</Option>
                    <Option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (.xlsx)</Option>
                    <Option value="text/plain">文本文件</Option>
                  </Select>
                </Col>
                <Col>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder={['开始日期', '结束日期']}
                  />
                </Col>
                <Col>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Col>
              </Row>
            </div>
            
            <Divider />
            
            {/* 操作按钮 */}
            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong>文档列表</Text>
                </Col>
                <Col>
                  <Space>
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
            </div>
            
            {/* 文档列表 */}
            <TeamDocumentList 
              activeTab={activeTab}
              searchKeyword={searchKeyword}
              fileType={fileType}
              dateRange={dateRange}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="共享给我的" key="shared">
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <FileOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <Title level={4} style={{ marginTop: '16px' }}>
                功能开发中
              </Title>
              <Text type="secondary">
                共享给我的文档功能正在开发中，敬请期待。
              </Text>
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="公开文档" key="public">
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <GlobalOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              <Title level={4} style={{ marginTop: '16px' }}>
                功能开发中
              </Title>
              <Text type="secondary">
                公开文档功能正在开发中，敬请期待。
              </Text>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TeamDocumentsPage;