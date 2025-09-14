import React from 'react';
import { useVirtualList } from '../hooks/useVirtualList';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  overscan?: number;
}

/**
 * 虚拟滚动列表组件
 * 优化大量数据的渲染性能
 */
export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  style,
  overscan = 5
}: VirtualListProps<T>) {
  const {
    virtualItems,
    visibleItems,
    totalHeight,
    handleScroll
  } = useVirtualList(items, {
    itemHeight,
    containerHeight: height,
    overscan
  });

  return (
    <div
      className={className}
      style={{
        height,
        overflow: 'auto',
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* 总高度占位容器 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见项目容器 */}
        {visibleItems.map(({ index, top, data }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(data, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
}

/**
 * 无限滚动列表组件
 */
export function InfiniteScrollList<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  className,
  style,
  threshold = 100
}: InfiniteScrollListProps<T>) {
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom < threshold) {
        loadMore();
      }
    },
    [loading, hasMore, threshold, loadMore]
  );

  return (
    <div
      className={className}
      style={{
        overflow: 'auto',
        ...style
      }}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {loading && (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          color: '#666'
        }}>
          加载中...
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          color: '#999'
        }}>
          没有更多数据了
        </div>
      )}
    </div>
  );
}