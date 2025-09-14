import React from 'react';
import { Card, Typography, Space, Row, Col, Tag, Alert } from 'antd';
import { BgColorsOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme, useThemeToggle } from '../contexts/ThemeContext';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

const { Title, Text } = Typography;

export default function ThemeTestPage() {
  const { theme, colors, isDark } = useTheme();
  const { setLight, setDark } = useThemeToggle();

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: colors.background }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }}>
          <Col>
            <Space align="center">
              <BgColorsOutlined style={{ fontSize: '24px', color: colors.primary }} />
              <Title level={2} style={{ margin: 0, color: colors.textPrimary }}>
                主题系统测试
              </Title>
            </Space>
          </Col>
          <Col>
            <ThemeSwitcher type="button" showLabel={true} size="large" />
          </Col>
        </Row>

        {/* 当前主题信息 */}
        <Alert
          icon={<InfoCircleOutlined />}
          message={`当前主题: ${isDark ? '深色模式' : '浅色模式'}`}
          description={`主题类型: ${theme}`}
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* 主题切换器展示 */}
        <Card title="主题切换器组件" style={{ marginBottom: '24px' }}>
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <Card size="small" title="开关模式">
                <ThemeSwitcher type="switch" showLabel={true} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="按钮模式">
                <ThemeSwitcher type="button" showLabel={true} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="下拉菜单">
                <ThemeSwitcher type="dropdown" showLabel={true} />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 颜色展示 */}
        <Card title="主题颜色展示" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card size="small" title="主色调">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ 
                    height: '40px', 
                    background: colors.primary, 
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textInverse,
                  }}>
                    Primary
                  </div>
                  <Text code>{colors.primary}</Text>
                </Space>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" title="背景色">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ 
                    height: '40px', 
                    background: colors.background, 
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textPrimary,
                  }}>
                    Background
                  </div>
                  <Text code>{colors.background}</Text>
                </Space>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" title="表面色">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ 
                    height: '40px', 
                    background: colors.surface, 
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textPrimary,
                  }}>
                    Surface
                  </div>
                  <Text code>{colors.surface}</Text>
                </Space>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" title="边框色">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ 
                    height: '40px', 
                    background: colors.surface, 
                    border: `2px solid ${colors.border}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textPrimary,
                  }}>
                    Border
                  </div>
                  <Text code>{colors.border}</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 文本颜色展示 */}
        <Card title="文本颜色" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text style={{ color: colors.textPrimary, fontSize: '16px' }}>
                主要文本 - {colors.textPrimary}
              </Text>
            </div>
            <div>
              <Text style={{ color: colors.textSecondary, fontSize: '14px' }}>
                次要文本 - {colors.textSecondary}
              </Text>
            </div>
            <div>
              <Text style={{ color: colors.textDisabled, fontSize: '12px' }}>
                禁用文本 - {colors.textDisabled}
              </Text>
            </div>
          </Space>
        </Card>

        {/* 状态颜色展示 */}
        <Card title="状态颜色">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Tag color="success" style={{ background: colors.success }}>
                成功状态
              </Tag>
            </Col>
            <Col span={6}>
              <Tag color="warning" style={{ background: colors.warning }}>
                警告状态
              </Tag>
            </Col>
            <Col span={6}>
              <Tag color="error" style={{ background: colors.error }}>
                错误状态
              </Tag>
            </Col>
            <Col span={6}>
              <Tag color="info" style={{ background: colors.info }}>
                信息状态
              </Tag>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}