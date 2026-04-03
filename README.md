# 🎭 Playwright Keyword-Driven Automation Framework Enterprise-level

A scalable and maintainable **Test Automation Framework** built using **Playwright + TypeScript**, following a **Keyword-Driven + Data-Driven approach (CSV-based)**.

This framework is designed for **Enterprise-Level Test Automation**, supporting reusable components, structured reporting, and dynamic test execution.

---

## 📌 Key Features

* ✅ Keyword-driven test execution
* ✅ CSV-based data-driven testing
* ✅ Page Object Model (POM) design
* ✅ Automatic login/logout via hooks
* ✅ Step-level reporting with screenshots
* ✅ Scalable and modular architecture
* ✅ Easy test case addition (no code change needed)

---

## 📁 Project Structure

```
📦 Project Root
├── pages/              # Page Object Models
├── test-data/          # CSV test data
├── tests/              # Test execution layer
│   ├── base/           # Fixtures & setup
│   ├── hooks/          # Hooks (login, reporting)
│   ├── registry/       # Test case mapping
│   └── smoke/          # Test runner
├── utils/              # Utilities (CSV reader, helpers)
├── playwright.config.ts
├── .env
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```
git clone <repo-url>
cd <project-folder>
```

### 2. Install dependencies

```
npm install
```

### 3. Install Playwright browsers

```
npx playwright install
```

---

## 🔑 Environment Configuration

Create a `.env` file:

```
USER_PORTAL_URL=https://www.saucedemo.com
USER_PORTAL_USERNAME=standard_user
USER_PORTAL_PASSWORD=secret_sauce
TAKE_SCREENSHOTS=true
```

---

## 🧪 How It Works

### 🔄 Execution Flow

```text
npx playwright test
        ↓
KeywordDriver_Smoke.spec.ts (Test Runner)
        ↓
CSVDataController (Reads Test Cases)
        ↓
Smoke_TestCases.csv (Controls Execution)
        ↓
TestCases.ts (Maps Keyword → Function)
        ↓
Page Objects (POM Layer)
        ↓
Playwright Actions (UI Execution)
```
### 📄 Test Case Control (`Smoke_TestCases.csv`)

Defines:

* Which test to run( eg, Y/N)
* Test description
* Data file

Example:

```
TestCaseID,TCToExecute,Description,Execute,RequiresLogin,DataFile
TESC_001,Verify_user_can_add_product_to_cart,Verify add to cart,Y,,AddToCartTestData.csv
```

---

### 📊 Test Data (`AddToCartTestData.csv`)

```
run,mainmenu,submenu,pageTitle,productName
true,Products,,,Sauce Labs Backpack
```

---

## 🧠 Adding a New Test Case

### Step 1.1: Add entry in CSV

```
Smoke_TestCases.csv
```

### Step 1.2: Add Test Data file in CSV and Update the CSV

```
NewTestData.csv
```

---
### Step 2.1: Global Page Object Initialization (Base Setup)

All Page Objects are initialized globally in `base.ts` using Playwright fixtures.

```
import { pageObjects } from '../base/base';

import { NewPage } from '../../pages/MainPages/New.page';
```

👉 Example (from base.ts):

Exproting pageObjects
```
export const pageObjects = {
  newPage: null as NewPage | null,  
};
```
Initialize page objects once per worker
```
addToCartPage: async ({ page }, use) => {
  const addToCartPage = new AddToCartPage(page);
  pageObjects.addToCartPage = addToCartPage;
  await use(addToCartPage);
},
```
Auto-initialize fixture
```
 _autoInit: [async ({
    newPage,
  },
```

✔ This ensures:

* Page objects are created automatically
* Available globally via `pageObjects`
* No need for manual instantiation or dynamic import
* Can use multiple time without creating object again and again

### Step 2.2: Register test in `TestCases.ts`

```ts
this.register('Verify_user_can_add_product_to_cart', async (testData, hooks) => {

    const isPageLoaded = await pageObjects.addToCartPage.verifyProductsPageDisplayed();
    await expect(isPageLoaded).toBe(true);

    const isAdded = await pageObjects.addToCartPage.addProductToCart(testData.productName);
    await expect(isAdded).toBe(true);

    const isVerified = await pageObjects.addToCartPage.verifyProductAddedToCart('1');
    await expect(isVerified).toBe(true);
});
```

---

### Step 3: Implement Page Object

```
pages/MainPages/Payment.page.ts
```

---

## ▶️ Running Tests

### Run all tests

```
npx playwright test
```

### Run specific test

```
npx playwright test tests/smoke
```

### Run in headed mode

```
npx playwright test --headed
```

### Run in debug mode

```
npx playwright test --debug
```

---

## 📸 Reporting & Screenshots

* Automatic step tracking via hooks
* Screenshots captured per step
* Attached in Playwright report

View report:

```
npx playwright show-report
```

---

## 🔄 Hooks Behavior

| Hook       | Action                  |
| ---------- | ----------------------- |
| beforeEach | Initialize test + login |
| afterEach  | Logout + screenshot     |
| autoStep   | Wraps all page methods  |

---

## 🏗️ Framework Design Principles

* Separation of concerns
* Reusability of page methods
* Data-driven execution
* Minimal code changes for new tests
* Clean and readable test steps

---

## 🚀 Future Enhancements

* API testing integration
* Parallel execution optimization
* CI/CD (GitHub Actions / Jenkins)
* Allure reporting
* Cross-browser execution

---

## 👨‍💻 Author

**Mithu Roy**
Software Quality Engineer | Automation Specialist

---

## 📄 License

This project is for educational and professional use.
