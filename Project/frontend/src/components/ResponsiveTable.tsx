import React, { useMemo } from 'react';
import { Table, Card, List, Avatar, Typography, Tag, Space, Button } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import { useBreakpoint } from '../hooks/useBreakpoint';

const { Text, Title } = Typography;

interface ResponsiveTableProps<T = any> extends TableProps<T> {
  mobileCardRender?: (item: T, index: number) => React.ReactNode;
  mobileListItemProps?: (item: T) => any;
  breakpoint?: 'sm' | 'md' | 'lg';
}

/**
 * 响应式表格组件
 * 在移动端自动切换为卡片或列表展示
 */
export function ResponsiveTable<T extends Record<string, any>>({
  columns = [],
  dataSource = [],
  mobileCardRender,
  mobileListItemProps,
  breakpoint = 'md',
  ...tableProps
}: ResponsiveTableProps<T>) {
  const { currentBreakpoint, isMobile, isTablet } = useBreakpoint();
  const shouldUseMobileView = currentBreakpoint === 'xs' || (breakpoint === 'md' && (isMobile || isTablet));

  // 移动端列配置 - 只显示关键列
  const mobileColumns = useMemo(() => {
    return columns.filter((col: any) => col.responsive !== false && !col.hideInMobile);
  }, [columns]);

  // 默认移动端卡片渲染
  const defaultMobileCardRender = (item: T, index: number) => {
    const primaryColumn = columns.find((col: any) => col.primary) || columns[0];
    const secondaryColumns = columns.filter((col: any) => !col.primary && col.key !== primaryColumn?.key).slice(0, 2);

    return (
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: '12px 16px' }}
        hoverable
        onClick={() => tableProps.onRow?.(item, index)?.onClick?.()}
      >
        <div>
          {/* 主要信息 */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16 }}>
              {primaryColumn?.render 
                ? primaryColumn.render(item[primaryColumn.key as string], item, index)
                : item[primaryColumn?.key as string]
              }
            </Text>
          </div>

          {/* 次要信息 */}
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {secondaryColumns.map((col: any) => (
              <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {col.title}:
                </Text>
                <Text style={{ fontSize: 12 }}>
                  {col.render 
                    ? col.render(item[col.key], item, index)
                    : item[col.key]
                  }
                </Text>
              </div>
            ))}
          </Space>

          {/* 操作按钮 */}
          {columns.some((col: any) => col.key === 'actions') && (
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              {columns.find((col: any) => col.key === 'actions')?.render?.(null, item, index)}
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 移动端列表项渲染
  const defaultMobileListRender = (item: T, index: number) => {
    const primaryColumn = columns.find((col: any) => col.primary) || columns[0];
    const descColumn = columns.find((col: any) => col.description) || columns[1];
    const avatarColumn = columns.find((col: any) => col.avatar);

    const listItemProps = mobileListItemProps?.(item) || {};

    return (
      <List.Item
        key={item.key || index}
        actions={[
          columns.find((col: any) => col.key === 'actions')?.render?.(null, item, index)
        ].filter(Boolean)}
        {...listItemProps}
      >
        <List.Item.Meta
          avatar={
            avatarColumn ? (
              <Avatar 
                src={item[avatarColumn.key]} 
                size={40}
              >
                {item[avatarColumn.key]?.charAt(0)}
              </Avatar>
            ) : undefined
          }
          title={
            primaryColumn?.render 
              ? primaryColumn.render(item[primaryColumn.key as string], item, index)
              : item[primaryColumn?.key as string]
          }
          description={
            descColumn?.render 
              ? descColumn.render(item[descColumn.key as string], item, index)
              : item[descColumn?.key as string]
          }
        />
      </List.Item>
    );
  };

  if (shouldUseMobileView) {
    // 如果提供了自定义渲染函数
    if (mobileCardRender) {
      return (
        <div>
          {dataSource.map((item, index) => mobileCardRender(item, index))}
        </div>
      );
    }

    // 如果有列表项配置，使用List组件
    if (mobileListItemProps) {
      return (
        <List
          dataSource={dataSource}
          renderItem={defaultMobileListRender}
          {...tableProps}
        />
      );
    }

    // 默认使用卡片布局
    return (
      <div>
        {dataSource.map((item, index) => defaultMobileCardRender(item, index))}
      </div>
    );
  }

  // 桌面端使用标准表格
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: true }}
      {...tableProps}
    />
  );
}

/**
 * 响应式数据展示组件
 */
interface ResponsiveDataDisplayProps {
  data: Record<string, any>;
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
    span?: number | Record<string, number>;
    hideOnMobile?: boolean;
  }>;
  title?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export const ResponsiveDataDisplay: React.FC<ResponsiveDataDisplayProps> = ({
  data,
  fields,
  title,
  layout = 'horizontal'
}) => {
  const { isMobile, isTablet } = useBreakpoint();
  const shouldUseVerticalLayout = isMobile || layout === 'vertical';

  return (
    <Card title={title}>
      <div style={{ 
        display: 'grid',
        gap: shouldUseVerticalLayout ? '8px' : '16px 24px',
        gridTemplateColumns: shouldUseVerticalLayout 
          ? '1fr' 
          : isTablet 
            ? 'repeat(2, 1fr)' 
            : 'repeat(3, 1fr)'
      }}>
        {fields
          .filter(field => !(field.hideOnMobile && isMobile))
          .map(field => (
            <div key={field.key} style={{
              display: 'flex',
              flexDirection: shouldUseVerticalLayout ? 'column' : 'row',
              gap: '4px'
            }}>
              <Text strong style={{ 
                minWidth: shouldUseVerticalLayout ? 'auto' : '120px',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {field.label}:
              </Text>
              <Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                {field.render ? field.render(data[field.key]) : data[field.key]}
              </Text>
            </div>
          ))}
      </div>
    </Card>
  );
};

export default ResponsiveTable;