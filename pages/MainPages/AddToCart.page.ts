import { Page, Locator } from '@playwright/test';

export class AddToCartPage {
  readonly page: Page;

  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  // ✅ Step 1: Verify Products page
  async verifyProductsPageDisplayed(): Promise<boolean> {
    try {
      await this.page.waitForURL(/inventory/);
      return true;
    } catch (error) {
      console.error('Products page not displayed:', error);
      return false;
    }
  }

  // ✅ Step 2: Add product
  async addProductToCart(productName: string): Promise<boolean> {
    try {
      const product = this.page.locator('.inventory_item').filter({
        has: this.page.locator('.inventory_item_name', { hasText: productName })
      });

      await product.locator('button').click();
      return true;
    } catch (error) {
      console.error('Add product failed:', error);
      return false;
    }
  }

  // ✅ Step 3: Verify cart
  async verifyProductAddedToCart(expectedCount: string): Promise<boolean> {
    try {
      await this.cartBadge.waitFor();
      const text = await this.cartBadge.textContent();
      return text?.trim() === expectedCount;
    } catch (error) {
      console.error('Cart verification failed:', error);
      return false;
    }
  }
}