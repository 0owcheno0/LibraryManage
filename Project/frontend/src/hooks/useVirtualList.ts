import { useMemo, useState, useCallback, useEffect } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // 额外渲染的元素数量，用于平滑滚动
}

interface VirtualListItem {
  index: number;
  top: number;
  height: number;
}

/**
 * 虚拟滚动列表Hook
 * 优化大列表渲染性能
 */
export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见区域信息
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan),
      visibleCount
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 计算虚拟列表项目
  const virtualItems = useMemo((): VirtualListItem[] => {
    const result: VirtualListItem[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        top: i * itemHeight,
        height: itemHeight
      });
    }
    return result;
  }, [visibleRange, itemHeight]);

  // 获取可见的实际数据
  const visibleItems = useMemo(() => {
    return virtualItems.map(vItem => ({
      ...vItem,
      data: items[vItem.index]
    }));
  }, [virtualItems, items]);

  // 总高度
  const totalHeight = items.length * itemHeight;

  // 滚动处理函数
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  }, []);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const top = index * itemHeight;
    setScrollTop(top);
    return top;
  }, [itemHeight]);

  return {
    virtualItems,
    visibleItems,
    totalHeight,
    handleScroll,
    scrollToIndex,
    visibleRange
  };
}

/**
 * 无限滚动Hook
 */
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  options: {
    threshold?: number;
    hasMore: boolean;
    loading: boolean;
  }
) {
  const { threshold = 100, hasMore, loading } = options;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom < threshold) {
      fetchMore();
    }
  }, [loading, hasMore, threshold, fetchMore]);

  return { handleScroll };
}