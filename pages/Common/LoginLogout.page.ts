import { expect, Locator, Page } from '@playwright/test';

export class LoginLogoutPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');

    this.errorMessage = page.locator('[data-test="error"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  // =============================
  // 🔹 Login Flow
  // =============================
  async loginPage(url: string, username: string, password: string) {
    
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    await expect(this.page).toHaveURL(/inventory/);
  }

  // =============================
  // 🔹 Logout Flow
  // =============================
  async LogOut_UserPortal() {
    await this.menuButton.click();

    // menu animation delay handled safely
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();

    // ✅ Back to login page
    await expect(this.loginButton).toBeVisible();
  }

  // =============================
  // 🔹 Assertions
  // =============================
  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectUserIsLoggedIn() {
    await expect(this.page).toHaveURL(/inventory/);
  }
}