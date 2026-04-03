import { test as base, Page, TestInfo, expect } from '@playwright/test';
import { LoginLogoutPage } from '../../pages/Common/LoginLogout.page';
import { smokeTestController } from '../../utils/CSVDataController';
import { testBase } from '../base/base';

export class TestHooks {
    private page: Page;
    private testInfo: TestInfo;
    private loginPage?: LoginLogoutPage;
    private requiresLogin: boolean;
    private screenshotCounter: number = 0;
    private autoStepTracking: boolean = true;
    private currentStepDepth: number = 0;

    private readonly actionTypes = {
        CLICK: { emoji: '🖱️', color: 'blue' },
        INPUT: { emoji: '⌨️', color: 'green' },
        VERIFY: { emoji: '✅', color: 'purple' },
        SELECT: { emoji: '🖱️', color: 'orange' },
        NAVIGATE: { emoji: '🌐', color: 'teal' },
        WAIT: { emoji: '⏳', color: 'yellow' },
        DEFAULT: { emoji: '▶️', color: 'gray' }
    };

    constructor(page: Page, testInfo: TestInfo, requiresLogin: boolean = true) {
        this.page = page;
        this.testInfo = testInfo;
        this.requiresLogin = requiresLogin;
    }

    async initialize(loginPage?: LoginLogoutPage): Promise<void> {
        this.loginPage = loginPage;
        await this.wrapAllPageObjects();
        await this.beforeTest();
    }

    private async wrapAllPageObjects(): Promise<void> {
        const { pageObjects } = await import('../base/base');

        const nameMap: Record<string, string> = {
            mainNavigationPage: 'MainNavigation',
            transferPage: 'Transfer',
        };

        for (const [key, value] of Object.entries(pageObjects)) {
            if (key !== 'page' && value !== null && typeof value === 'object') {
                const displayName = nameMap[key] || key.replace(/Page$/, '');
                (pageObjects as any)[key] = this.wrapPageObject(value, displayName);
                console.log(`✔️ Wrapped ${key}`);
            }
        }
        console.log('✨ Page objects wrapped with automatic step tracking');
    }

    private async beforeTest(): Promise<void> {
        console.log('\n' + '='.repeat(80));
        console.log(`🚀 Starting Test: ${this.testInfo.title}`);
        console.log(`📋 Test ID: ${this.testInfo.testId}`);
        console.log(`🔐 Requires Login: ${this.requiresLogin}`);
        console.log('='.repeat(80) + '\n');

        await base.step('🚀 Initialize Test', async () => {
            const path = process.env.USER_PORTAL_URL!;
            await this.page.goto(path);
            await this.attachScreenshotToCurrentStep('Initial_Page_Load');

            if (this.requiresLogin && this.loginPage) {
                await this.executeStep('Login', async () => {
                    const userName = process.env.USER_PORTAL_USERNAME!;
                    const pwd = process.env.USER_PORTAL_PASSWORD!;
                    await this.loginPage!.loginPage(path, userName, pwd);
                });
            } else {
                console.log('ℹ️ Skipping login for this test');
            }
        });
    }

    async cleanup(passed: boolean = true): Promise<void> {
        await base.step('🧹 Cleanup Test', async () => {
            console.log('\n' + '='.repeat(80));
            console.log(`${passed ? '✅' : '❌'} Test ${passed ? 'Passed' : 'Failed'}: ${this.testInfo.title}`);
            console.log('='.repeat(80) + '\n');

            await this.attachScreenshotToCurrentStep(passed ? 'Test_Success' : 'Test_Failed');

            if (this.requiresLogin && this.loginPage) {
                try {
                    await this.loginPage.LogOut_UserPortal();
                    console.log('🔓 Logged out successfully');
                } catch (error) {
                    console.log('⚠️ Logout failed or not needed:', error);
                }
            }
        });
    }

    async executeStep<T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> {
        const actionType = this.categorizeAction(stepName);
        const visualStepName = `${actionType.emoji} ${stepName}`;

        console.log(`\n▶️ Step: ${visualStepName}`);
        console.log('-'.repeat(60));

        return await base.step(visualStepName, async () => {
            await this.beforeStep(stepName);
            try {
                const result = await stepFunction();
                await this.afterStep(stepName, true);
                return result;
            } catch (error) {
                await this.afterStep(stepName, false, error);
                throw error;
            }
        });
    }

    private async beforeStep(stepName: string): Promise<void> {
        console.log(`▶️ Starting: ${stepName}`);
    }

    private async afterStep(stepName: string, passed: boolean, error?: any): Promise<void> {
        if (passed) {
            console.log(`✔️ Completed: ${stepName}`);
            await this.attachScreenshotToCurrentStep(stepName);
        } else {
            console.error(`❌ Failed: ${stepName}`, error);
            await this.attachScreenshotToCurrentStep(`${stepName}_FAILED`);
        }
    }

    private async attachScreenshotToCurrentStep(stepName: string): Promise<void> {
        if (process.env.TAKE_SCREENSHOTS !== 'false') {
            try {
                this.screenshotCounter++;
                const screenshotName = `${String(this.screenshotCounter).padStart(2, '0')}_${stepName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
                const screenshot = await this.page.screenshot({ type: 'png', fullPage: false });
                await this.testInfo.attach(screenshotName, { body: screenshot, contentType: 'image/png' });
            } catch (error) {
                console.log(`⚠️ Screenshot failed for ${stepName}:`, error);
            }
        }
    }

    getPage(): Page { return this.page; }
    getTestInfo(): TestInfo { return this.testInfo; }
    async takeScreenshot(name: string): Promise<void> { await this.attachScreenshotToCurrentStep(name); }

    wrapPageObject<T extends object>(pageObject: T, objectName: string): T {
        if (!this.autoStepTracking) return pageObject;

        return new Proxy(pageObject, {
            get: (target: any, property: string | symbol) => {
                const originalValue = target[property];
                if (typeof originalValue !== 'function' || property === 'constructor' || String(property).startsWith('_')) {
                    return originalValue;
                }

                return async (...args: any[]) => {
                    if (this.currentStepDepth > 0) return await originalValue.apply(target, args);
                    const stepName = this.createStepName(objectName, String(property), args);
                    this.currentStepDepth++;
                    try {
                        return await this.executeStep(stepName, async () => {
                            return await originalValue.apply(target, args);
                        });
                    } finally {
                        this.currentStepDepth--;
                    }
                };
            }
        });
    }

    private categorizeAction(stepName: string): { emoji: string; color: string } {
        const lowerName = stepName.toLowerCase();
        if (lowerName.includes('click') || lowerName.includes('tap') || lowerName.includes('press')) return this.actionTypes.CLICK;
        if (lowerName.includes('enter') || lowerName.includes('type') || lowerName.includes('input') || lowerName.includes('fill') || lowerName.includes('set')) return this.actionTypes.INPUT;
        if (lowerName.includes('verify') || lowerName.includes('expect') || lowerName.includes('assert') || lowerName.includes('check') || lowerName.includes('validate')) return this.actionTypes.VERIFY;
        if (lowerName.includes('select') || lowerName.includes('choose') || lowerName.includes('pick')) return this.actionTypes.SELECT;
        if (lowerName.includes('navigate') || lowerName.includes('goto') || lowerName.includes('open') || lowerName.includes('login') || lowerName.includes('logout')) return this.actionTypes.NAVIGATE;
        if (lowerName.includes('wait') || lowerName.includes('pause')) return this.actionTypes.WAIT;
        return this.actionTypes.DEFAULT;
    }

    private createStepName(objectName: string, methodName: string, args: any[]): string {
        const readable = methodName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
        const context = objectName.replace(/Page$/, '').replace(/([A-Z])/g, ' $1').trim();
        let argInfo = '';
        if (args.length > 0 && (typeof args[0] === 'string' || typeof args[0] === 'number')) {
            const argStr = String(args[0]);
            if (argStr.length < 30) argInfo = ` - ${argStr}`;
        }
        return `${context}: ${readable}${argInfo}`;
    }

    setAutoStepTracking(enabled: boolean): void { this.autoStepTracking = enabled; }
}

export class SuiteHooks {
    static async beforeAll(description?: string): Promise<void> {
        console.log('\n' + '⬛'.repeat(80));
        console.log(`🏗️ Test Suite Started: ${description || 'Unknown Suite'}`);
        console.log('⬛'.repeat(80) + '\n');
    }

    static async afterAll(description?: string): Promise<void> {
        console.log('\n' + '⬛'.repeat(80));
        console.log(`🏗️ Test Suite Completed: ${description || 'Unknown Suite'}`);
        console.log('⬛'.repeat(80) + '\n');
    }
}

export const testFromHooks = testBase;

testFromHooks.beforeAll(async ({}, testInfo) => {
    const testFileName = testInfo.project.name + ' - ' + (testInfo.file.split(/[/\\]/).pop() || 'Test Suite');
    await SuiteHooks.beforeAll(testFileName);
    try {
        if (smokeTestController.getExecutableTests().length > 0) {
            smokeTestController.printExecutionSummary();
        }
    } catch (e) {}
});

testFromHooks.beforeEach(async ({ page, loginPage, requiresLogin }, testInfo) => {
    const { pageObjects } = await import('../base/base');
    const hooks = new TestHooks(page, testInfo, requiresLogin);
    await hooks.initialize(loginPage);
    pageObjects.hooks = hooks;
});

testFromHooks.afterEach(async ({}, testInfo) => {
    const { pageObjects } = await import('../base/base');
    if (pageObjects.hooks) {
        await pageObjects.hooks.cleanup(testInfo.status === 'passed');
        pageObjects.hooks = null;
    }
});

testFromHooks.afterAll(async ({}, testInfo) => {
    const testFileName = testInfo.project.name + ' - ' + (testInfo.file.split(/[/\\]/).pop() || 'Test Suite');
    await SuiteHooks.afterAll(testFileName);
});

export { expect } from '@playwright/test';