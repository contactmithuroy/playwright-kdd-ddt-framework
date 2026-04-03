import type { Page, TestInfo } from "@playwright/test";

export class CommonFunctions {
  constructor(readonly page: Page) {}

  protected async navigateTo(url: string): Promise<void> {

    await this.page.goto(url);
  }

  public async takeScreenShot(testInfo: TestInfo, ssName: string): Promise<void> {
    if (process.env.TAKE_SCREENSHOTS !== "false") {
      const screenshot = await this.page.screenshot({
        type: "jpeg",
        quality: 50,
        fullPage: true,
      });
      await testInfo.attach(ssName, {
        body: screenshot,
        contentType: "image/jpeg",
      });
    }
  }

  public async clickBrowserDialogOkBtn(): Promise<void> {
    this.page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
  }

  public async clickBrowserDialogCancelBtn(): Promise<void> {
    this.page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
  }

  public async getCellValueByLabel(
    tableSelector: string,
    label: string
  ): Promise<string | null> {
    const row = this.page
      .locator(`${tableSelector} tbody tr`)
      .filter({ hasText: label });

    const cell = row.locator("td");
    const cellValue = await cell.textContent();
    return cellValue?.trim() ?? null;
  }

  public async getCellValueByLabel1(
    tableSelector: string,
    label: string
  ): Promise<string | null> {
    const table = this.page.locator(`${tableSelector}`).nth(0); //first table
    const row = table.locator("tbody tr").filter({ hasText: label }); //matching row with label

    const cell = row.locator("td").nth(1); //second column
    const cellValue = await cell.textContent();
    return cellValue?.trim() ?? null;
  }

  public async getCurrentDateFormatted(): Promise<string> {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${month}/${day}/${year}`; // Returns MM/DD/YYYY
  }

  public async random4DigitNumber(): Promise<string> {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}