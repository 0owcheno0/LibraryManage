import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { 
  ThemeType, 
  ThemeColors, 
  getTheme, 
  DEFAULT_THEME, 
  THEME_STORAGE_KEY,
  applyThemeToCSS,
} from '../config/theme';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
}

/**
 * 主题提供者组件
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = DEFAULT_THEME 
}) => {
  // 从localStorage获取保存的主题，如果没有则使用默认主题
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType;
      return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') 
        ? savedTheme 
        : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const colors = getTheme(theme);
  const isDark = theme === 'dark';

  // 设置主题
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 应用主题到CSS变量
  useEffect(() => {
    applyThemeToCSS(colors);
    
    // 更新document class用于全局样式
    document.documentElement.className = theme;
    
    // 更新meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary);
    }
  }, [theme, colors]);

  // 监听系统主题变化（可选）
  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    colors,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: colors.primary,
            colorSuccess: colors.success,
            colorWarning: colors.warning,
            colorError: colors.error,
            colorInfo: colors.info,
            colorBgBase: colors.background,
            colorBgContainer: colors.surface,
            colorText: colors.textPrimary,
            colorTextSecondary: colors.textSecondary,
            colorTextDisabled: colors.textDisabled,
            colorBorder: colors.border,
            colorBorderSecondary: colors.borderSecondary,
            borderRadius: 6,
            wireframe: false,
          },
          components: {
            Layout: {
              headerBg: colors.surface,
              bodyBg: colors.background,
              triggerBg: colors.backgroundSecondary,
            },
            Menu: {
              itemBg: colors.surface,
              itemSelectedBg: colors.backgroundSecondary,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题的Hook
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * 主题切换Hook
 */
export const useThemeToggle = () => {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();
  
  return {
    theme,
    isDark,
    toggle: toggleTheme,
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setTheme,
  };
};

/**
 * 获取当前主题颜色的Hook
 */
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

export default ThemeProvider;