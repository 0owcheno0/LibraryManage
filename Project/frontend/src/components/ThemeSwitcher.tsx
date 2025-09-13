import React from 'react';
import { Button, Switch, Tooltip, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTheme, useThemeToggle } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  size?: 'small' | 'middle' | 'large';
  type?: 'switch' | 'button' | 'dropdown';
  showLabel?: boolean;
}

/**
 * 主题切换器组件
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  size = 'middle',
  type = 'switch',
  showLabel = false,
}) => {
  const { colors } = useTheme();
  const { theme, isDark, toggle, setLight, setDark } = useThemeToggle();

  // 开关模式
  if (type === 'switch') {
    return (
      <Space size="small">
        {showLabel && (
          <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
            主题
          </span>
        )}
        <Switch
          size={size === 'middle' ? 'default' : size}
          checked={isDark}
          onChange={toggle}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          style={{
            backgroundColor: isDark ? colors.primary : colors.textDisabled,
          }}
        />
      </Space>
    );
  }

  // 按钮模式
  if (type === 'button') {
    return (
      <Tooltip title={isDark ? '切换到浅色主题' : '切换到深色主题'}>
        <Button
          size={size}
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggle}
          style={{
            color: colors.textSecondary,
          }}
        >
          {showLabel && (isDark ? '浅色' : '深色')}
        </Button>
      </Tooltip>
    );
  }

  // 下拉菜单模式
  if (type === 'dropdown') {
    const menuItems: MenuProps['items'] = [
      {
        key: 'light',
        label: '浅色主题',
        icon: <SunOutlined />,
        onClick: setLight,
        style: {
          backgroundColor: theme === 'light' ? colors.backgroundSecondary : 'transparent',
        },
        ...(theme === 'light' && {
          icon: <CheckOutlined style={{ color: colors.primary }} />
        }),
      },
      {
        key: 'dark',
        label: '深色主题',
        icon: <MoonOutlined />,
        onClick: setDark,
        style: {
          backgroundColor: theme === 'dark' ? colors.backgroundSecondary : 'transparent',
        },
        ...(theme === 'dark' && {
          icon: <CheckOutlined style={{ color: colors.primary }} />
        }),
      },
    ];

    return (
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button
          size={size}
          type="text"
          icon={<BgColorsOutlined />}
          style={{
            color: colors.textSecondary,
          }}
        >
          {showLabel && '主题'}
        </Button>
      </Dropdown>
    );
  }

  return null;
};

/**
 * 简单的主题切换按钮
 */
export const SimpleThemeToggle: React.FC<{
  size?: 'small' | 'middle' | 'large';
}> = ({ size = 'middle' }) => {
  const { isDark, toggle } = useThemeToggle();
  const { colors } = useTheme();

  return (
    <Tooltip title={`切换到${isDark ? '浅色' : '深色'}主题`}>
      <Button
        size={size}
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggle}
        style={{
          color: colors.textSecondary,
          borderColor: colors.border,
        }}
      />
    </Tooltip>
  );
};

/**
 * 紧凑的主题切换开关
 */
export const CompactThemeSwitch: React.FC = () => {
  const { isDark, toggle } = useThemeToggle();
  const { colors } = useTheme();

  return (
    <Switch
      size="small"
      checked={isDark}
      onChange={toggle}
      checkedChildren="🌙"
      unCheckedChildren="☀️"
      style={{
        backgroundColor: isDark ? colors.primary : colors.textDisabled,
      }}
    />
  );
};

/**
 * 带标签的主题选择器
 */
export const LabeledThemeSelector: React.FC = () => {
  const { theme, setLight, setDark } = useThemeToggle();
  const { colors } = useTheme();

  return (
    <Space>
      <span style={{ color: colors.textSecondary }}>外观:</span>
      <Button.Group size="small">
        <Button
          type={theme === 'light' ? 'primary' : 'default'}
          icon={<SunOutlined />}
          onClick={setLight}
        >
          浅色
        </Button>
        <Button
          type={theme === 'dark' ? 'primary' : 'default'}
          icon={<MoonOutlined />}
          onClick={setDark}
        >
          深色
        </Button>
      </Button.Group>
    </Space>
  );
};

export default ThemeSwitcher;