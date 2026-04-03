import { test as base, Page } from '@playwright/test';
import { MainNavigationPage } from '../../pages/Common/MainNavigation.page';
import { LoginLogoutPage } from '../../pages/Common/LoginLogout.page';
import { TransferPage } from '../../pages/MainPages/Transfer.page';
import { AddToCartPage } from '../../pages/MainPages/AddToCart.page';

// Global object to hold page instances for easy access in tests
//Exproting pageObjects for use in tests that may not use the fixtures directly
export const pageObjects = {
  page: null as Page | null,
  loginPage: null as LoginLogoutPage | null,
  transferPage: null as TransferPage | null,
  mainNavigationPage: null as MainNavigationPage | null,
  addToCartPage: null as AddToCartPage | null,

  // Store hooks instance globally for access in tests
  hooks: null as any | null,
};

type PageObjectTypes = {
  [K in keyof typeof pageObjects]: NonNullable<typeof pageObjects[K]>;
};

export function getPageObjects() {
  if (!pageObjects.page) {
    throw new Error('Page objects not initialized. Make sure test fixtures are loaded.');
  }
  return pageObjects as PageObjectTypes;
}

export const testBase = base.extend<PageObjectTypes & {
  requiresLogin: boolean;
  _autoInit: void;
}>({
  // Test option - default to true (most tests need login)
  requiresLogin: [true, { option: true }],

  // Override page to be shared across all tests in a worker
  page: async ({ browser }, use) => {
    const page = await browser.newPage();
    pageObjects.page = page;
    await use(page);
    await page.close();
  },

  // Initialize page objects once per worker
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginLogoutPage(page);
    pageObjects.loginPage = loginPage;
    await use(loginPage);
  },

  transferPage: async ({ page }, use) => {
    const transferPage = new TransferPage(page);
    pageObjects.transferPage = transferPage;
    await use(transferPage);
  },

  mainNavigationPage: async ({ page }, use) => {
    const mainNavigationPage = new MainNavigationPage(page);
    pageObjects.mainNavigationPage = mainNavigationPage;
    await use(mainNavigationPage);
  },

  addToCartPage: async ({ page }, use) => {
    const addToCartPage = new AddToCartPage(page);
    pageObjects.addToCartPage = addToCartPage;
    await use(addToCartPage);
  },

  // Auto-initialize fixture that ensures all page objects are created
  _autoInit: [async ({
    page,
    loginPage,
    transferPage,
    mainNavigationPage,
    addToCartPage,
  }, use) => {
    // All fixtures are now initialized and stored in pageObjects
    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';