import { TestHooks, expect } from '../hooks/hooks';
import { pageObjects } from '../base/base';
import { assert, table } from 'node:console';
import test from 'node:test';
import { existsSync, unlinkSync } from 'node:fs';
import { env } from 'node:process';
import { on } from 'node:cluster';

export type TestMethod = (testData: any, hooks: TestHooks) => Promise<void>;

export class TestCases {
    private static registry: Map<string, TestMethod> = new Map();

    static register(testCaseName: string, testMethod: TestMethod): void {
        this.registry.set(testCaseName, testMethod);
    }

    static get(testCaseName: string): TestMethod | undefined {
        return this.registry.get(testCaseName);
    }

    static has(testCaseName: string): boolean {
        return this.registry.has(testCaseName);
    }

    static async execute(testCaseName: string, testData: any, hooks: TestHooks): Promise<void> {
        const testMethod = this.get(testCaseName);

        if (!testMethod) {
            throw new Error(`Test method '${testCaseName}' not found in registry. Please register it first.`);
        }

        await testMethod(testData, hooks);
    }

    static getRegisteredTests(): string[] {
        return Array.from(this.registry.keys());
    }

    static initialize(): void {
        console.log('🏗️ Initializing Test Registry with AUTOMATIC step tracking...');

        this.register('Verify_user_can_add_product_to_cart', async (testData, hooks) => {

            // Step 1: Verify Products page
            const isProductsPageDisplayed = await pageObjects.addToCartPage!.verifyProductsPageDisplayed();
            await expect(isProductsPageDisplayed).toBe(true);

            // Step 2: Add product
            const isProductAdded = await pageObjects.addToCartPage!.addProductToCart(testData.productName);
            await expect(isProductAdded).toBe(true);

            // Step 3: Verify cart
            const isCartUpdated = await pageObjects.addToCartPage!.verifyProductAddedToCart('1');
            await expect(isCartUpdated).toBe(true);
        });

        console.log(`✅ Registered ${this.registry.size} test methods`);
        console.log('✨ ALL methods are automatically tracked as steps - no manual wrapping needed!');
        console.log(`📋 Available tests: ${this.getRegisteredTests().join(', ')}`);
    }
}

TestCases.initialize();