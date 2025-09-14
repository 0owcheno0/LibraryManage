import React from 'react';
import { Menu, Drawer, Button, Space, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TagOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobileNavigation } from '../hooks/useBreakpoint';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationProps {
  menuItems?: MenuProps['items'];
}

/**
 * 移动端导航组件
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  menuItems
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isMobile, mobileMenuVisible, toggleMobileMenu, closeMobileMenu } = useMobileNavigation();

  // 默认菜单项
  const defaultMenuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => {
        navigate('/dashboard');
        closeMobileMenu();
      }
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: '文档管理',
      onClick: () => {
        navigate('/documents');
        closeMobileMenu();
      }
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: '标签管理',
      onClick: () => {
        navigate('/tags');
        closeMobileMenu();
      }
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: '搜索',
      onClick: () => {
        navigate('/search');
        closeMobileMenu();
      }
    },
    {
      type: 'divider'
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => {
        navigate('/profile');
        closeMobileMenu();
      }
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {
        navigate('/settings');
        closeMobileMenu();
      }
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout();
        closeMobileMenu();
      }
    }
  ];

  const items = menuItems || defaultMenuItems;

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* 移动端菜单按钮 */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={toggleMobileMenu}
        style={{
          padding: '4px 8px',
          height: 'auto',
          border: 'none',
          boxShadow: 'none'
        }}
        aria-label="打开菜单"
      />

      {/* 移动端侧边栏 */}
      <Drawer
        title={
          <Space>
            <Avatar 
              src={user?.avatar_url} 
              size={32}
              style={{ backgroundColor: '#1890ff' }}
            >
              {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
            </Avatar>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {user?.email}
              </div>
            </div>
          </Space>
        }
        placement="left"
        closable={true}
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { 
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0'
          }
        }}
        closeIcon={<CloseOutlined />}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={items}
          style={{
            border: 'none',
            height: '100%'
          }}
        />
      </Drawer>
    </>
  );
};

/**
 * 移动端底部导航组件
 */
interface MobileBottomNavigationProps {
  items: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    path: string;
  }>;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  items
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobileNavigation();

  if (!isMobile) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)' // iOS 刘海适配
      }}
    >
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => navigate(item.path)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '8px 4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: location.pathname === item.path ? '#1890ff' : '#666',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 2 }}>
            {item.icon}
          </div>
          <div>{item.label}</div>
        </button>
      ))}
    </div>
  );
};

/**
 * 移动端页面容器
 */
interface MobilePageContainerProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const MobilePageContainer: React.FC<MobilePageContainerProps> = ({
  title,
  extra,
  children,
  showBackButton = false,
  onBack
}) => {
  const navigate = useNavigate();
  const { isMobile } = useMobileNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: isMobile ? 70 : 0 // 为底部导航留出空间
    }}>
      {/* 移动端页面头部 */}
      {isMobile && (title || extra || showBackButton) && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showBackButton && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleBack}
                style={{ marginRight: 8 }}
              />
            )}
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {title}
            </div>
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}

      {/* 页面内容 */}
      <div style={{ 
        padding: isMobile ? '16px' : '24px',
        background: '#f5f5f5',
        minHeight: isMobile ? 'calc(100vh - 120px)' : 'auto'
      }}>
        {children}
      </div>
    </div>
  );
};

export default MobileNavigation;