import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 用于端到端测试配置
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 全局设置
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // 并行运行的worker数量
  workers: process.env.CI ? 2 : undefined,

  // 失败重试次数
  retries: process.env.CI ? 2 : 0,

  // 测试超时时间
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['line'] // 控制台输出
  ],

  // 输出配置
  outputDir: 'test-results/',
  
  // 全局配置
  use: {
    // 基础URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 浏览器设置
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    
    // 测试跟踪
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 等待页面加载完成
    waitForLoadState: 'networkidle',

    // 全局数据属性选择器
    testIdAttribute: 'data-testid'
  },

  // 项目配置 - 多浏览器测试
  projects: [
    // 桌面浏览器
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 移动端浏览器
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // 平板
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // 开发服务器配置
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});