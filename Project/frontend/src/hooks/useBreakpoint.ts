import { useState, useEffect } from 'react';

// 断点定义 - 与Ant Design保持一致
export const breakpoints = {
  xs: 0,     // < 576px
  sm: 576,   // >= 576px
  md: 768,   // >= 768px
  lg: 992,   // >= 992px
  xl: 1200,  // >= 1200px
  xxl: 1600, // >= 1600px
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * 获取当前断点的Hook
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    // 获取当前断点
    const getCurrentBreakpoint = (width: number): Breakpoint => {
      if (width >= breakpoints.xxl) return 'xxl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };

    // 更新断点状态
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setCurrentBreakpoint(getCurrentBreakpoint(width));
    };

    // 初始化
    updateBreakpoint();

    // 监听窗口大小变化
    const handleResize = () => {
      updateBreakpoint();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 判断是否为移动端
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  
  // 判断是否为平板
  const isTablet = currentBreakpoint === 'md';
  
  // 判断是否为桌面端
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === 'xxl';

  // 判断是否满足最小断点
  const isMinBreakpoint = (minBreakpoint: Breakpoint): boolean => {
    return screenWidth >= breakpoints[minBreakpoint];
  };

  // 判断是否在断点范围内
  const isBreakpointBetween = (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean => {
    return screenWidth >= breakpoints[minBreakpoint] && screenWidth < breakpoints[maxBreakpoint];
  };

  return {
    currentBreakpoint,
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    isMinBreakpoint,
    isBreakpointBetween,
    breakpoints: {
      xs: currentBreakpoint === 'xs',
      sm: currentBreakpoint === 'sm',
      md: currentBreakpoint === 'md',
      lg: currentBreakpoint === 'lg',
      xl: currentBreakpoint === 'xl',
      xxl: currentBreakpoint === 'xxl',
    }
  };
}

/**
 * 响应式样式Hook
 */
export function useResponsiveStyle() {
  const { currentBreakpoint } = useBreakpoint();

  // 根据断点获取样式值
  const getResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
    // 按优先级获取值
    const priorities: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = priorities.indexOf(currentBreakpoint);
    
    // 从当前断点向下查找
    for (let i = currentIndex; i < priorities.length; i++) {
      const breakpoint = priorities[i];
      if (values[breakpoint] !== undefined) {
        return values[breakpoint];
      }
    }
    
    return undefined;
  };

  return { getResponsiveValue };
}

/**
 * 移动端导航Hook
 */
export function useMobileNavigation() {
  const { isMobile } = useBreakpoint();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  // 在非移动端时自动关闭移动菜单
  useEffect(() => {
    if (!isMobile && mobileMenuVisible) {
      setMobileMenuVisible(false);
    }
  }, [isMobile, mobileMenuVisible]);

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  return {
    isMobile,
    mobileMenuVisible,
    toggleMobileMenu,
    closeMobileMenu
  };
}