/**
 * 搜索功能端到端测试
 * 测试全文搜索、标签筛选、组合搜索等功能
 */

import { test, expect, Page } from '@playwright/test';

// 页面对象模型
class SearchPage {
  constructor(private page: Page) {}

  async navigateToSearch() {
    await this.page.goto('/search');
    await expect(this.page).toHaveTitle(/搜索/);
  }

  async performSearch(query: string) {
    await this.page.fill('[data-testid="search-input"]', query);
    await this.page.click('[data-testid="search-button"]');
  }

  async performAdvancedSearch(options: {
    title?: string;
    content?: string;
    tags?: string[];
    fileType?: string;
    dateRange?: { start: string; end: string };
    author?: string;
  }) {
    await this.page.click('[data-testid="advanced-search-toggle"]');
    await expect(this.page.locator('[data-testid="advanced-search-panel"]')).toBeVisible();

    if (options.title) {
      await this.page.fill('[data-testid="search-title"]', options.title);
    }

    if (options.content) {
      await this.page.fill('[data-testid="search-content"]', options.content);
    }

    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await this.page.fill('[data-testid="search-tags"]', tag);
        await this.page.press('[data-testid="search-tags"]', 'Enter');
      }
    }

    if (options.fileType) {
      await this.page.selectOption('[data-testid="search-file-type"]', options.fileType);
    }

    if (options.dateRange) {
      await this.page.fill('[data-testid="search-date-start"]', options.dateRange.start);
      await this.page.fill('[data-testid="search-date-end"]', options.dateRange.end);
    }

    if (options.author) {
      await this.page.fill('[data-testid="search-author"]', options.author);
    }

    await this.page.click('[data-testid="advanced-search-button"]');
  }

  async filterByTag(tag: string) {
    await this.page.click(`[data-testid="tag-filter-${tag}"]`);
  }

  async sortResults(sortBy: string) {
    await this.page.selectOption('[data-testid="sort-results"]', sortBy);
  }

  async expectSearchResults(count: number) {
    if (count === 0) {
      await expect(this.page.locator('[data-testid="no-results"]')).toBeVisible();
    } else {
      await expect(this.page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(this.page.locator('[data-testid="result-item"]')).toHaveCount(count);
    }
  }

  async expectHighlightedText(text: string) {
    await expect(this.page.locator(`[data-testid="highlight"]:has-text("${text}")`)).toBeVisible();
  }

  async expectResultContains(title: string) {
    await expect(this.page.locator(`[data-testid="result-title"]:has-text("${title}")`)).toBeVisible();
  }
}

// 认证辅助函数
async function loginAsTestUser(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'testuser_e2e');
  await page.fill('[data-testid="password"]', 'Test123!@#');
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/dashboard/);
}

test.describe('搜索功能测试', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    searchPage = new SearchPage(page);
  });

  test('基本文本搜索', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 执行基本搜索
    await searchPage.performSearch('测试文档');

    // 2. 验证搜索结果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-query"]')).toContainText('测试文档');

    // 3. 验证结果高亮
    await searchPage.expectHighlightedText('测试文档');

    // 4. 验证结果信息完整性
    const firstResult = page.locator('[data-testid="result-item"]').first();
    await expect(firstResult.locator('[data-testid="result-title"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="result-description"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="result-tags"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="result-date"]')).toBeVisible();
  });

  test('搜索结果为空', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 搜索不存在的内容
    await searchPage.performSearch('不存在的内容xyz123');

    // 2. 验证空结果处理
    await searchPage.expectSearchResults(0);
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
  });

  test('高级搜索功能', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 执行高级搜索
    await searchPage.performAdvancedSearch({
      title: '测试',
      tags: ['E2E', '测试'],
      fileType: 'pdf',
      dateRange: {
        start: '2025-01-01',
        end: '2025-12-31'
      }
    });

    // 2. 验证高级搜索结果
    await expect(page.locator('[data-testid="advanced-search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-filters-applied"]')).toBeVisible();

    // 3. 验证筛选条件显示
    await expect(page.locator('[data-testid="filter-title"]')).toContainText('标题包含: 测试');
    await expect(page.locator('[data-testid="filter-tags"]')).toContainText('标签: E2E, 测试');
    await expect(page.locator('[data-testid="filter-type"]')).toContainText('文件类型: PDF');
  });

  test('标签筛选功能', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 查看可用标签
    await expect(page.locator('[data-testid="available-tags"]')).toBeVisible();

    // 2. 点击标签筛选
    await searchPage.filterByTag('测试');

    // 3. 验证筛选结果
    await expect(page.locator('[data-testid="tag-filtered-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tag-filter"]')).toContainText('测试');

    // 4. 添加多个标签筛选
    await searchPage.filterByTag('E2E');
    await expect(page.locator('[data-testid="active-tag-filter"]')).toContainText('E2E');

    // 5. 移除标签筛选
    await page.click('[data-testid="remove-tag-filter-测试"]');
    await expect(page.locator('[data-testid="active-tag-filter"]:has-text("测试")')).not.toBeVisible();
  });

  test('搜索结果排序', async ({ page }) => {
    await searchPage.navigateToSearch();
    await searchPage.performSearch('文档');

    // 1. 按相关性排序 (默认)
    await expect(page.locator('[data-testid="sort-results"]')).toHaveValue('relevance');

    // 2. 按时间排序
    await searchPage.sortResults('date');
    await expect(page.locator('[data-testid="sort-results"]')).toHaveValue('date');
    
    // 验证结果重新排列
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // 3. 按文件大小排序
    await searchPage.sortResults('size');
    await expect(page.locator('[data-testid="sort-results"]')).toHaveValue('size');
  });

  test('搜索历史记录', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 执行几次搜索
    await searchPage.performSearch('第一次搜索');
    await page.waitForTimeout(1000);
    
    await searchPage.performSearch('第二次搜索');
    await page.waitForTimeout(1000);

    // 2. 清空搜索框查看历史
    await page.fill('[data-testid="search-input"]', '');
    await page.focus('[data-testid="search-input"]');

    // 3. 验证搜索历史显示
    await expect(page.locator('[data-testid="search-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]:has-text("第一次搜索")')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]:has-text("第二次搜索")')).toBeVisible();

    // 4. 点击历史记录执行搜索
    await page.click('[data-testid="history-item"]:has-text("第一次搜索")');
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('第一次搜索');
  });

  test('搜索自动建议', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 输入部分文本触发建议
    await page.fill('[data-testid="search-input"]', '测');
    
    // 2. 验证自动建议显示
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggestion-item"]')).toHaveCount({ min: 1 });

    // 3. 点击建议项
    await page.click('[data-testid="suggestion-item"]').first();
    
    // 4. 验证自动填充
    const inputValue = await page.locator('[data-testid="search-input"]').inputValue();
    expect(inputValue).toContain('测');
  });

  test('模糊搜索和拼写纠错', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 输入有拼写错误的搜索词
    await searchPage.performSearch('ceshi'); // 应该能匹配"测试"

    // 2. 验证模糊匹配结果
    await expect(page.locator('[data-testid="fuzzy-match-notice"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // 3. 验证拼写建议
    await searchPage.performSearch('testt documennt'); // 拼写错误
    await expect(page.locator('[data-testid="spell-suggestion"]')).toBeVisible();
    await expect(page.locator('[data-testid="spell-suggestion"]')).toContainText('您是否想搜索');
    
    // 4. 点击拼写建议
    await page.click('[data-testid="use-suggestion"]');
    const correctedQuery = await page.locator('[data-testid="search-input"]').inputValue();
    expect(correctedQuery).not.toContain('testt');
  });

  test('搜索结果分页', async ({ page }) => {
    await searchPage.navigateToSearch();
    await searchPage.performSearch('文档'); // 假设有很多结果

    // 1. 验证分页控件显示
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-page"]')).toContainText('1');

    // 2. 点击下一页
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

    // 3. 验证URL更新
    await expect(page).toHaveURL(/page=2/);

    // 4. 验证结果更新
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('实时搜索', async ({ page }) => {
    await searchPage.navigateToSearch();

    // 1. 开启实时搜索
    await page.check('[data-testid="real-time-search"]');

    // 2. 输入搜索词，验证实时结果
    await page.fill('[data-testid="search-input"]', '测');
    await page.waitForTimeout(500); // 等待防抖
    await expect(page.locator('[data-testid="live-results"]')).toBeVisible();

    // 3. 继续输入，验证结果更新
    await page.fill('[data-testid="search-input"]', '测试');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="live-results"]')).toBeVisible();

    // 4. 验证搜索次数限制
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="search-input"]', `测试${i}`);
      await page.waitForTimeout(100);
    }
    // 应该有频率限制
    await expect(page.locator('[data-testid="search-throttled"]')).toBeVisible();
  });

  test('导出搜索结果', async ({ page }) => {
    await searchPage.navigateToSearch();
    await searchPage.performSearch('测试');

    // 1. 验证有搜索结果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // 2. 点击导出按钮
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-results"]');
    
    // 3. 选择导出格式
    await page.selectOption('[data-testid="export-format"]', 'xlsx');
    await page.click('[data-testid="confirm-export"]');

    // 4. 验证下载
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/search-results.*\.xlsx/);
  });
});