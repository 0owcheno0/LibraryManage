/**
 * 用户认证端到端测试
 * 测试用户注册、登录、注销等完整流程
 */

import { test, expect, Page } from '@playwright/test';

// 测试数据
const testUser = {
  username: 'testuser_e2e',
  email: 'testuser.e2e@example.com',
  password: 'Test123!@#',
  fullName: '测试用户E2E'
};

// 页面对象模型
class AuthPage {
  constructor(private page: Page) {}

  // 登录页面操作
  async navigateToLogin() {
    await this.page.goto('/login');
    await expect(this.page).toHaveTitle(/登录/);
  }

  async fillLoginForm(username: string, password: string) {
    await this.page.fill('[data-testid="username"]', username);
    await this.page.fill('[data-testid="password"]', password);
  }

  async submitLogin() {
    await this.page.click('[data-testid="login-button"]');
  }

  // 注册页面操作
  async navigateToRegister() {
    await this.page.goto('/register');
    await expect(this.page).toHaveTitle(/注册/);
  }

  async fillRegisterForm(userData: typeof testUser) {
    await this.page.fill('[data-testid="register-username"]', userData.username);
    await this.page.fill('[data-testid="register-email"]', userData.email);
    await this.page.fill('[data-testid="register-password"]', userData.password);
    await this.page.fill('[data-testid="register-confirm-password"]', userData.password);
    await this.page.fill('[data-testid="register-fullname"]', userData.fullName);
  }

  async submitRegister() {
    await this.page.click('[data-testid="register-button"]');
  }

  // 注销操作
  async logout() {
    await this.page.click('[data-testid="user-dropdown"]');
    await this.page.click('[data-testid="logout-button"]');
  }

  // 验证登录状态
  async expectLoggedIn() {
    await expect(this.page.locator('[data-testid="user-info"]')).toBeVisible();
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async expectLoggedOut() {
    await expect(this.page).toHaveURL(/login/);
  }
}

test.describe('用户认证流程', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test('用户注册流程', async ({ page }) => {
    // 1. 访问注册页面
    await authPage.navigateToRegister();

    // 2. 填写注册表单
    await authPage.fillRegisterForm(testUser);

    // 3. 提交注册
    await authPage.submitRegister();

    // 4. 验证注册成功 - 应该跳转到登录页面
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('用户登录流程', async ({ page }) => {
    // 1. 访问登录页面
    await authPage.navigateToLogin();

    // 2. 填写登录表单
    await authPage.fillLoginForm(testUser.username, testUser.password);

    // 3. 提交登录
    await authPage.submitLogin();

    // 4. 验证登录成功
    await authPage.expectLoggedIn();
  });

  test('登录失败处理', async ({ page }) => {
    // 1. 访问登录页面
    await authPage.navigateToLogin();

    // 2. 使用错误凭据
    await authPage.fillLoginForm('wronguser', 'wrongpassword');
    await authPage.submitLogin();

    // 3. 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('用户名或密码错误');

    // 4. 确保仍在登录页面
    await expect(page).toHaveURL(/login/);
  });

  test('用户注销流程', async ({ page, context }) => {
    // 1. 先登录
    await authPage.navigateToLogin();
    await authPage.fillLoginForm(testUser.username, testUser.password);
    await authPage.submitLogin();
    await authPage.expectLoggedIn();

    // 2. 执行注销
    await authPage.logout();

    // 3. 验证注销成功
    await authPage.expectLoggedOut();

    // 4. 验证认证状态已清除
    const cookies = await context.cookies();
    const authToken = cookies.find(cookie => cookie.name === 'auth_token');
    expect(authToken).toBeUndefined();
  });

  test('页面访问权限控制', async ({ page }) => {
    // 1. 未登录状态下访问受保护页面
    await page.goto('/dashboard');
    
    // 2. 应该重定向到登录页面
    await expect(page).toHaveURL(/login/);

    // 3. 登录后应该可以访问
    await authPage.fillLoginForm(testUser.username, testUser.password);
    await authPage.submitLogin();
    await authPage.expectLoggedIn();
  });

  test('记住登录状态', async ({ page, context }) => {
    // 1. 登录
    await authPage.navigateToLogin();
    await authPage.fillLoginForm(testUser.username, testUser.password);
    
    // 2. 勾选记住我
    await page.check('[data-testid="remember-me"]');
    await authPage.submitLogin();
    await authPage.expectLoggedIn();

    // 3. 刷新页面，验证仍然登录
    await page.reload();
    await authPage.expectLoggedIn();

    // 4. 关闭页面后重新打开，验证仍然登录
    await page.close();
    const newPage = await context.newPage();
    const newAuthPage = new AuthPage(newPage);
    await newPage.goto('/dashboard');
    await newAuthPage.expectLoggedIn();
  });

  test('密码强度验证', async ({ page }) => {
    await authPage.navigateToRegister();

    // 测试弱密码
    await page.fill('[data-testid="register-password"]', '123');
    await page.blur('[data-testid="register-password"]');
    
    // 验证密码强度提示
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('密码强度：弱');
    
    // 测试强密码
    await page.fill('[data-testid="register-password"]', 'StrongPass123!@#');
    await page.blur('[data-testid="register-password"]');
    
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('密码强度：强');
  });

  test('表单验证', async ({ page }) => {
    await authPage.navigateToRegister();

    // 提交空表单
    await authPage.submitRegister();

    // 验证必填字段错误提示
    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // 测试邮箱格式验证
    await page.fill('[data-testid="register-email"]', 'invalid-email');
    await page.blur('[data-testid="register-email"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('邮箱格式不正确');
  });
});