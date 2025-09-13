import React from 'react';
import { Spin, Empty, Skeleton, Result, Space, Typography, Card, Row, Col } from 'antd';
import {
  LoadingOutlined,
  FileTextOutlined,
  InboxOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useThemeColors } from '../contexts/ThemeContext';

const { Text, Title } = Typography;

/**
 * 自定义加载图标
 */
const CustomLoadingIcon = () => {
  const colors = useThemeColors();
  return <LoadingOutlined style={{ fontSize: 24, color: colors.primary }} spin />;
};

/**
 * 页面级别的加载组件
 */
export const PageLoading: React.FC<{
  tip?: string;
  size?: 'small' | 'default' | 'large';
}> = ({ tip = '加载中...', size = 'large' }) => {
  const colors = useThemeColors();
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      padding: '50px 0',
      color: colors.textSecondary,
    }}>
      <Spin size={size} tip={tip} indicator={<CustomLoadingIcon />} />
    </div>
  );
};

/**
 * 内联加载组件
 */
export const InlineLoading: React.FC<{
  tip?: string;
  size?: 'small' | 'default' | 'large';
}> = ({ tip = '加载中...', size = 'default' }) => (
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <Spin size={size} tip={tip} />
  </div>
);

/**
 * 文档列表骨架屏
 */
export const DocumentListSkeleton: React.FC<{
  rows?: number;
}> = ({ rows = 5 }) => (
  <div style={{ padding: '16px' }}>
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {Array.from({ length: rows }, (_, index) => (
        <Card key={index} size="small">
          <Row gutter={16} align="middle">
            <Col span={2}>
              <Skeleton.Avatar active size="large" shape="square" />
            </Col>
            <Col span={14}>
              <Skeleton active paragraph={{ rows: 2, width: ['60%', '40%'] }} />
            </Col>
            <Col span={4}>
              <Skeleton.Button active size="small" style={{ width: '80px' }} />
            </Col>
            <Col span={4}>
              <Space>
                <Skeleton.Button active size="small" style={{ width: '32px' }} />
                <Skeleton.Button active size="small" style={{ width: '32px' }} />
                <Skeleton.Button active size="small" style={{ width: '32px' }} />
              </Space>
            </Col>
          </Row>
        </Card>
      ))}
    </Space>
  </div>
);

/**
 * 文档详情页骨架屏
 */
export const DocumentDetailSkeleton: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* 标题和操作按钮 */}
      <Row justify="space-between" align="middle">
        <Col>
          <Skeleton.Input active style={{ width: '300px', height: '32px' }} />
        </Col>
        <Col>
          <Space>
            <Skeleton.Button active />
            <Skeleton.Button active />
            <Skeleton.Button active />
          </Space>
        </Col>
      </Row>
      
      {/* 主要内容 */}
      <Row gutter={24}>
        <Col span={16}>
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      </Row>
    </Space>
  </div>
);

/**
 * 卡片列表骨架屏
 */
export const CardListSkeleton: React.FC<{
  rows?: number;
  cols?: number;
}> = ({ rows = 2, cols = 3 }) => (
  <div style={{ padding: '16px' }}>
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Row key={rowIndex} gutter={16}>
          {Array.from({ length: cols }, (_, colIndex) => (
            <Col key={colIndex} span={24 / cols}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ))}
    </Space>
  </div>
);

/**
 * 空数据状态 - 无文档
 */
export const EmptyDocuments: React.FC<{
  onAddDocument?: () => void;
}> = ({ onAddDocument }) => {
  const colors = useThemeColors();
  return (
    <Empty
      image={<FileTextOutlined style={{ fontSize: '64px', color: colors.textDisabled }} />}
      description={
        <Space direction="vertical">
          <Text type="secondary">暂无文档</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            上传您的第一个文档开始使用
          </Text>
        </Space>
      }
    >
      {onAddDocument && (
        <button
          type="button"
          onClick={onAddDocument}
          style={{
            background: colors.primary,
            color: colors.textInverse,
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          上传文档
        </button>
      )}
    </Empty>
  );
};

/**
 * 空数据状态 - 搜索无结果
 */
export const EmptySearch: React.FC<{
  keyword?: string;
  onClearSearch?: () => void;
}> = ({ keyword, onClearSearch }) => {
  const colors = useThemeColors();
  return (
    <Empty
      image={<SearchOutlined style={{ fontSize: '64px', color: colors.textDisabled }} />}
      description={
        <Space direction="vertical">
          <Text type="secondary">
            {keyword ? `未找到包含 "${keyword}" 的文档` : '未找到相关文档'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            尝试使用其他关键词搜索
          </Text>
        </Space>
      }
    >
      {onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          style={{
            background: 'transparent',
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          清除搜索
        </button>
      )}
    </Empty>
  );
};

/**
 * 空数据状态 - 无权限
 */
export const EmptyPermission: React.FC<{
  message?: string;
}> = ({ message = '您没有权限访问此内容' }) => {
  const colors = useThemeColors();
  return (
    <Empty
      image={<ExclamationCircleOutlined style={{ fontSize: '64px', color: colors.error }} />}
      description={
        <Space direction="vertical">
          <Text type="secondary">{message}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            请联系管理员获取权限
          </Text>
        </Space>
      }
    />
  );
};

/**
 * 通用空数据状态
 */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ 
  icon,
  title = '暂无数据',
  description,
  action,
}) => {
  const colors = useThemeColors();
  const defaultIcon = <InboxOutlined style={{ fontSize: '64px', color: colors.textDisabled }} />;
  
  return (
    <Empty
      image={icon || defaultIcon}
      description={
        <Space direction="vertical">
          <Text type="secondary">{title}</Text>
          {description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {description}
            </Text>
          )}
        </Space>
      }
    >
      {action}
    </Empty>
  );
};

/**
 * 错误状态
 */
export const ErrorState: React.FC<{
  title?: string;
  subTitle?: string;
  onRetry?: () => void;
}> = ({ 
  title = '加载失败',
  subTitle = '请稍后重试或联系管理员',
  onRetry,
}) => {
  const colors = useThemeColors();
  return (
    <Result
      status="error"
      title={title}
      subTitle={subTitle}
      extra={
        onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: colors.primary,
              color: colors.textInverse,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        )
      }
    />
  );
};

/**
 * 组合型加载状态组件
 */
export const LoadingWrapper: React.FC<{
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  skeleton?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}> = ({ 
  loading, 
  error, 
  empty = false, 
  skeleton, 
  emptyComponent, 
  onRetry, 
  children 
}) => {
  if (loading) {
    return skeleton ? <>{skeleton}</> : <PageLoading />;
  }

  if (error) {
    return <ErrorState title="加载失败" subTitle={error} onRetry={onRetry} />;
  }

  if (empty) {
    return emptyComponent ? <>{emptyComponent}</> : <EmptyState />;
  }

  return <>{children}</>;
};

export default {
  PageLoading,
  InlineLoading,
  DocumentListSkeleton,
  DocumentDetailSkeleton,
  CardListSkeleton,
  EmptyDocuments,
  EmptySearch,
  EmptyPermission,
  EmptyState,
  ErrorState,
  LoadingWrapper,
};