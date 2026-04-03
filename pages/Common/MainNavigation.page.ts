import { expect, Locator, Page } from '@playwright/test';

export class MainNavigationPage {
  // Define types for the locators
  readonly page: Page;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly contactLink: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using data-test attributes (best practice) 
    // or accessible roles/labels.
    this.logo = page.getByRole('link', { name: 'Company Logo' });
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.productsLink = page.getByRole('link', { name: 'Products' });
    this.contactLink = page.getByRole('link', { name: 'Contact' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  // --- Actions ---

  async goto() {
    await this.page.goto('/');
  }

  async clickProducts() {
    await this.productsLink.click();
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  // --- Assertions ---

  async expectNavigationVisible() {
    await expect(this.logo).toBeVisible();
    await expect(this.homeLink).toBeVisible();
  }
}