import { Page, Locator } from '@playwright/test';
import { CommonFunctions } from '../../utils/CommonFunctions';

export class TransferPage extends CommonFunctions {
  readonly page: Page;

  // Locators
  readonly fromAccountDropdown: Locator;
  readonly toAccountDropdown: Locator;
  readonly amountInput: Locator;
  readonly transferButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    // Define locators 
    this.fromAccountDropdown = page.locator('#fromAccount');
    this.toAccountDropdown = page.locator('#toAccount');
    this.amountInput = page.locator('#amount');
    this.transferButton = page.locator('#transferBtn');
    this.successMessage = page.locator('.alert-success');
  }

  async selectAccount(dropdown: Locator, accountNumber: string) {
    const options = dropdown.locator('option');
    const count = await options.count();

    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();

      if (text?.toLowerCase().includes(accountNumber.toLowerCase())) {
        await dropdown.selectOption({ index: i });
        break;
      }
    }
  }

}