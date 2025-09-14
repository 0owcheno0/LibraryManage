/**
 * 文档管理端到端测试
 * 测试文档上传、查看、下载、删除等完整流程
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// 测试数据
const testDocument = {
  title: '测试文档E2E',
  description: '这是一个端到端测试文档',
  tags: ['测试', 'E2E']
};

// 页面对象模型
class DocumentManagePage {
  constructor(private page: Page) {}

  async navigateToDocuments() {
    await this.page.goto('/documents');
    await expect(this.page).toHaveTitle(/文档管理/);
  }

  async navigateToUpload() {
    await this.page.click('[data-testid="upload-button"]');
    await expect(this.page.locator('[data-testid="upload-modal"]')).toBeVisible();
  }

  async uploadFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.click('[data-testid="file-upload-button"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async fillDocumentInfo(docData: typeof testDocument) {
    await this.page.fill('[data-testid="document-title"]', docData.title);
    await this.page.fill('[data-testid="document-description"]', docData.description);
    
    // 添加标签
    for (const tag of docData.tags) {
      await this.page.fill('[data-testid="tag-input"]', tag);
      await this.page.press('[data-testid="tag-input"]', 'Enter');
    }
  }

  async submitUpload() {
    await this.page.click('[data-testid="submit-upload"]');
  }

  async searchDocument(title: string) {
    await this.page.fill('[data-testid="search-input"]', title);
    await this.page.press('[data-testid="search-input"]', 'Enter');
  }

  async openDocument(title: string) {
    await this.page.click(`[data-testid="document-item-${title}"]`);
  }

  async downloadDocument(title: string) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click(`[data-testid="download-${title}"]`);
    return await downloadPromise;
  }

  async deleteDocument(title: string) {
    await this.page.click(`[data-testid="delete-${title}"]`);
    await this.page.click('[data-testid="confirm-delete"]');
  }

  async expectDocumentExists(title: string) {
    await expect(this.page.locator(`[data-testid="document-item-${title}"]`)).toBeVisible();
  }

  async expectDocumentNotExists(title: string) {
    await expect(this.page.locator(`[data-testid="document-item-${title}"]`)).not.toBeVisible();
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

test.describe('文档管理流程', () => {
  let docPage: DocumentManagePage;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    docPage = new DocumentManagePage(page);
  });

  test('文档上传流程', async ({ page }) => {
    // 1. 进入文档管理页面
    await docPage.navigateToDocuments();

    // 2. 点击上传按钮
    await docPage.navigateToUpload();

    // 3. 选择文件上传 (创建一个临时测试文件)
    const testFilePath = path.join(__dirname, '../fixtures/test-document.txt');
    await page.evaluate(() => {
      const content = '这是一个测试文档的内容';
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'test-document.txt', { type: 'text/plain' });
      return file;
    });

    // 4. 填写文档信息
    await docPage.fillDocumentInfo(testDocument);

    // 5. 提交上传
    await docPage.submitUpload();

    // 6. 验证上传成功
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-modal"]')).not.toBeVisible();
  });

  test('文档列表显示', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 验证文档列表加载
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    
    // 验证文档项目显示完整信息
    const firstDocItem = page.locator('[data-testid^="document-item-"]').first();
    await expect(firstDocItem.locator('[data-testid="doc-title"]')).toBeVisible();
    await expect(firstDocItem.locator('[data-testid="doc-size"]')).toBeVisible();
    await expect(firstDocItem.locator('[data-testid="doc-date"]')).toBeVisible();
  });

  test('文档搜索功能', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 执行搜索
    await docPage.searchDocument(testDocument.title);

    // 2. 验证搜索结果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await docPage.expectDocumentExists(testDocument.title);

    // 3. 测试无结果搜索
    await docPage.searchDocument('不存在的文档');
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });

  test('文档详情查看', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 点击文档查看详情
    await docPage.openDocument(testDocument.title);

    // 2. 验证详情页面信息
    await expect(page.locator('[data-testid="document-title"]')).toContainText(testDocument.title);
    await expect(page.locator('[data-testid="document-description"]')).toContainText(testDocument.description);
    
    // 3. 验证标签显示
    for (const tag of testDocument.tags) {
      await expect(page.locator(`[data-testid="tag-${tag}"]`)).toBeVisible();
    }

    // 4. 验证文档操作按钮
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
  });

  test('文档下载功能', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 执行下载
    const download = await docPage.downloadDocument(testDocument.title);

    // 2. 验证下载成功
    expect(download.suggestedFilename()).toBeTruthy();
    
    // 3. 验证下载的文件
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
  });

  test('文档删除功能', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 删除文档
    await docPage.deleteDocument(testDocument.title);

    // 2. 验证删除成功
    await expect(page.locator('[data-testid="delete-success"]')).toBeVisible();
    await docPage.expectDocumentNotExists(testDocument.title);
  });

  test('批量操作功能', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 选择多个文档
    await page.check('[data-testid="select-all"]');
    
    // 2. 验证批量操作按钮可用
    await expect(page.locator('[data-testid="batch-delete"]')).not.toBeDisabled();
    await expect(page.locator('[data-testid="batch-download"]')).not.toBeDisabled();

    // 3. 执行批量删除
    await page.click('[data-testid="batch-delete"]');
    await page.click('[data-testid="confirm-batch-delete"]');

    // 4. 验证操作成功
    await expect(page.locator('[data-testid="batch-success"]')).toBeVisible();
  });

  test('文档权限控制', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 查看文档权限设置
    await docPage.openDocument(testDocument.title);
    await page.click('[data-testid="permissions-tab"]');

    // 2. 验证权限设置界面
    await expect(page.locator('[data-testid="permission-settings"]')).toBeVisible();
    
    // 3. 修改权限
    await page.select('[data-testid="permission-level"]', 'public');
    await page.click('[data-testid="save-permissions"]');

    // 4. 验证权限更新成功
    await expect(page.locator('[data-testid="permission-success"]')).toBeVisible();
  });

  test('文档分享功能', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 创建分享链接
    await docPage.openDocument(testDocument.title);
    await page.click('[data-testid="share-button"]');

    // 2. 设置分享选项
    await page.click('[data-testid="enable-share"]');
    await page.fill('[data-testid="share-expiry"]', '7'); // 7天有效期
    await page.click('[data-testid="generate-share-link"]');

    // 3. 验证分享链接生成
    await expect(page.locator('[data-testid="share-link"]')).toBeVisible();
    
    // 4. 复制分享链接
    await page.click('[data-testid="copy-link"]');
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();

    // 5. 测试分享链接访问
    const shareLink = await page.locator('[data-testid="share-link"]').inputValue();
    await page.goto(shareLink);
    await expect(page.locator('[data-testid="shared-document"]')).toBeVisible();
  });

  test('文档版本管理', async ({ page }) => {
    await docPage.navigateToDocuments();

    // 1. 上传新版本
    await docPage.openDocument(testDocument.title);
    await page.click('[data-testid="upload-new-version"]');
    
    // 模拟上传新版本文件
    const newVersionPath = path.join(__dirname, '../fixtures/test-document-v2.txt');
    await docPage.uploadFile(newVersionPath);
    
    // 2. 验证版本历史
    await page.click('[data-testid="version-history"]');
    await expect(page.locator('[data-testid="version-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="version-item"]')).toHaveCount(2);

    // 3. 回滚到之前版本
    await page.click('[data-testid="rollback-version-1"]');
    await page.click('[data-testid="confirm-rollback"]');
    await expect(page.locator('[data-testid="rollback-success"]')).toBeVisible();
  });
});