/**
 * 主题配置文件
 * 定义黑白主题的颜色配置
 */

export interface ThemeColors {
  // 主色调
  primary: string;
  primaryHover: string;
  primaryActive: string;
  
  // 成功色
  success: string;
  successHover: string;
  
  // 警告色
  warning: string;
  warningHover: string;
  
  // 错误色
  error: string;
  errorHover: string;
  
  // 信息色
  info: string;
  infoHover: string;
  
  // 背景色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // 表面色
  surface: string;
  surfaceHover: string;
  
  // 文本色
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  
  // 边框色
  border: string;
  borderSecondary: string;
  borderLight: string;
  
  // 阴影色
  shadow: string;
  shadowSecondary: string;
  
  // 状态色
  link: string;
  linkHover: string;
  
  // 特殊颜色
  mask: string;
  placeholder: string;
}

/**
 * 白色主题配置
 */
export const lightTheme: ThemeColors = {
  // 主色调
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  
  // 成功色
  success: '#52c41a',
  successHover: '#73d13d',
  
  // 警告色
  warning: '#faad14',
  warningHover: '#ffc53d',
  
  // 错误色
  error: '#ff4d4f',
  errorHover: '#ff7875',
  
  // 信息色
  info: '#1890ff',
  infoHover: '#40a9ff',
  
  // 背景色
  background: '#ffffff',
  backgroundSecondary: '#fafafa',
  backgroundTertiary: '#f5f5f5',
  
  // 表面色
  surface: '#ffffff',
  surfaceHover: '#fafafa',
  
  // 文本色
  textPrimary: '#262626',
  textSecondary: '#595959',
  textDisabled: '#bfbfbf',
  textInverse: '#ffffff',
  
  // 边框色
  border: '#d9d9d9',
  borderSecondary: '#f0f0f0',
  borderLight: '#e8e8e8',
  
  // 阴影色
  shadow: 'rgba(0, 0, 0, 0.15)',
  shadowSecondary: 'rgba(0, 0, 0, 0.06)',
  
  // 状态色
  link: '#1890ff',
  linkHover: '#40a9ff',
  
  // 特殊颜色
  mask: 'rgba(0, 0, 0, 0.45)',
  placeholder: '#bfbfbf',
};

/**
 * 黑色主题配置
 */
export const darkTheme: ThemeColors = {
  // 主色调
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  
  // 成功色
  success: '#52c41a',
  successHover: '#73d13d',
  
  // 警告色
  warning: '#faad14',
  warningHover: '#ffc53d',
  
  // 错误色
  error: '#ff4d4f',
  errorHover: '#ff7875',
  
  // 信息色
  info: '#1890ff',
  infoHover: '#40a9ff',
  
  // 背景色
  background: '#141414',
  backgroundSecondary: '#1f1f1f',
  backgroundTertiary: '#262626',
  
  // 表面色
  surface: '#1f1f1f',
  surfaceHover: '#262626',
  
  // 文本色
  textPrimary: '#ffffff',
  textSecondary: '#d9d9d9',
  textDisabled: '#595959',
  textInverse: '#141414',
  
  // 边框色
  border: '#434343',
  borderSecondary: '#303030',
  borderLight: '#383838',
  
  // 阴影色
  shadow: 'rgba(0, 0, 0, 0.45)',
  shadowSecondary: 'rgba(0, 0, 0, 0.25)',
  
  // 状态色
  link: '#1890ff',
  linkHover: '#40a9ff',
  
  // 特殊颜色
  mask: 'rgba(0, 0, 0, 0.65)',
  placeholder: '#595959',
};

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark';

/**
 * 获取主题配置
 */
export const getTheme = (themeType: ThemeType): ThemeColors => {
  return themeType === 'dark' ? darkTheme : lightTheme;
};

/**
 * 主题配置映射
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

/**
 * 默认主题
 */
export const DEFAULT_THEME: ThemeType = 'light';

/**
 * 主题存储键名
 */
export const THEME_STORAGE_KEY = 'knowledge-base-theme';

/**
 * CSS变量名映射
 */
export const CSS_VARIABLES = {
  // 主色调
  primary: '--color-primary',
  primaryHover: '--color-primary-hover',
  primaryActive: '--color-primary-active',
  
  // 成功色
  success: '--color-success',
  successHover: '--color-success-hover',
  
  // 警告色
  warning: '--color-warning',
  warningHover: '--color-warning-hover',
  
  // 错误色
  error: '--color-error',
  errorHover: '--color-error-hover',
  
  // 信息色
  info: '--color-info',
  infoHover: '--color-info-hover',
  
  // 背景色
  background: '--color-background',
  backgroundSecondary: '--color-background-secondary',
  backgroundTertiary: '--color-background-tertiary',
  
  // 表面色
  surface: '--color-surface',
  surfaceHover: '--color-surface-hover',
  
  // 文本色
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textDisabled: '--color-text-disabled',
  textInverse: '--color-text-inverse',
  
  // 边框色
  border: '--color-border',
  borderSecondary: '--color-border-secondary',
  borderLight: '--color-border-light',
  
  // 阴影色
  shadow: '--color-shadow',
  shadowSecondary: '--color-shadow-secondary',
  
  // 状态色
  link: '--color-link',
  linkHover: '--color-link-hover',
  
  // 特殊颜色
  mask: '--color-mask',
  placeholder: '--color-placeholder',
} as const;

/**
 * 将主题颜色应用到CSS变量
 */
export const applyThemeToCSS = (theme: ThemeColors) => {
  const root = document.documentElement;
  
  Object.entries(CSS_VARIABLES).forEach(([key, variable]) => {
    const colorValue = theme[key as keyof ThemeColors];
    root.style.setProperty(variable, colorValue);
  });
};

/**
 * 移除CSS变量
 */
export const removeThemeFromCSS = () => {
  const root = document.documentElement;
  
  Object.values(CSS_VARIABLES).forEach(variable => {
    root.style.removeProperty(variable);
  });
};