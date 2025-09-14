import React from 'react';
import { Card, Typography, Button, Space, Row, Col, Alert, Divider, Switch, message } from 'antd';
import { SettingOutlined, BgColorsOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeSwitcher, LabeledThemeSelector } from '../../components/ThemeSwitcher';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
  const { theme, colors, isDark, setTheme } = useTheme();

  const handleThemeReset = () => {
    setTheme('light');
    message.success('主题已重置为浅色模式');
  };

  const handleClearStorage = () => {
    localStorage.removeItem('knowledge-base-theme');
    message.success('主题设置已清除，将使用系统默认设置');
  };

  return (
    <div style={{ padding: '24px', background: colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <Space align="center" style={{ marginBottom: '32px' }}>
          <SettingOutlined style={{ fontSize: '24px', color: colors.primary }} />
          <Title level={2} style={{ margin: 0, color: colors.textPrimary }}>
            系统设置
          </Title>
        </Space>

        {/* 主题设置 */}
        <Card 
          title={
            <Space>
              <BgColorsOutlined />
              <span>主题设置</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 当前主题信息 */}
            <Alert
              icon={<InfoCircleOutlined />}
              message={`当前主题: ${isDark ? '深色模式' : '浅色模式'}`}
              description={
                <div>
                  <Paragraph style={{ marginBottom: '8px' }}>
                    主题配色会影响整个应用的外观，包括背景色、文字色、边框色等。
                  </Paragraph>
                  <Text type="secondary">
                    您的主题选择将自动保存到本地存储中。
                  </Text>
                </div>
              }
              type="info"
              showIcon
            />

            <Divider>主题选择</Divider>

            {/* 主题选择器 */}
            <Row gutter={[24, 16]}>
              <Col span={24} sm={12}>
                <Card size="small" title="快速切换">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>开关模式</Text>
                      <ThemeSwitcher type="switch" showLabel={false} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>按钮模式</Text>
                      <ThemeSwitcher type="button" showLabel={true} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>下拉菜单</Text>
                      <ThemeSwitcher type="dropdown" showLabel={true} />
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col span={24} sm={12}>
                <Card size="small" title="主题选择">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <LabeledThemeSelector />
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Space>
                      <Button size="small" onClick={handleThemeReset}>
                        重置为浅色
                      </Button>
                      <Button size="small" onClick={handleClearStorage}>
                        清除设置
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider>主题预览</Divider>

            {/* 主题预览 */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card 
                  size="small" 
                  title="浅色主题预览"
                  extra={theme === 'light' && <Text type="success">当前</Text>}
                >
                  <div 
                    style={{ 
                      padding: '16px', 
                      background: '#ffffff',
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      color: '#262626',
                    }}
                  >
                    <Text style={{ color: '#262626' }}>主要文本</Text>
                    <br />
                    <Text style={{ color: '#595959' }}>次要文本</Text>
                    <br />
                    <Button type="primary" size="small" style={{ marginTop: '8px' }}>
                      主按钮
                    </Button>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  size="small" 
                  title="深色主题预览"
                  extra={theme === 'dark' && <Text type="success">当前</Text>}
                >
                  <div 
                    style={{ 
                      padding: '16px', 
                      background: '#1f1f1f',
                      border: '1px solid #434343',
                      borderRadius: '6px',
                      color: '#ffffff',
                    }}
                  >
                    <Text style={{ color: '#ffffff' }}>主要文本</Text>
                    <br />
                    <Text style={{ color: '#d9d9d9' }}>次要文本</Text>
                    <br />
                    <Button type="primary" size="small" style={{ marginTop: '8px' }}>
                      主按钮
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* 其他设置 */}
        <Card title="其他设置">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>跟随系统主题</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  自动根据系统主题切换应用主题
                </Text>
              </div>
              <Switch 
                disabled 
                defaultChecked={false}
              />
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>自动保存主题</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  将主题选择保存到本地存储
                </Text>
              </div>
              <Switch checked disabled />
            </div>
          </Space>
        </Card>

        {/* 提示信息 */}
        <Alert
          style={{ marginTop: '24px' }}
          message="主题切换说明"
          description={
            <div>
              <Paragraph style={{ marginBottom: '8px' }}>
                • 主题设置会立即生效，无需刷新页面
              </Paragraph>
              <Paragraph style={{ marginBottom: '8px' }}>
                • 主题选择会自动保存到浏览器本地存储
              </Paragraph>
              <Paragraph style={{ marginBottom: '0' }}>
                • 清除设置后将使用浏览器默认主题
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    </div>
  );
}