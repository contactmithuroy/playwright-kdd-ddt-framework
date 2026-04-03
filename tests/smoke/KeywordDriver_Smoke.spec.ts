import { testFromHooks, expect } from "../hooks/hooks";
import { CSVDataController, TestCase } from "../../utils/CSVDataController";
import { TestCases } from "../../tests/registry/testCases";
import { pageObjects } from "../base/base";

const keywordController = new CSVDataController();

testFromHooks.describe("Keyword Driver - Data-Driven Test Suite", () => {
    const executableTests = keywordController.getExecutableTests();

    executableTests.forEach((testCase: TestCase) => {
        const requiresLogin = testCase.RequiresLogin !== 'N';

        testFromHooks.describe(`${testCase.TestCaseID}`, () => {
            testFromHooks.use({ requiresLogin });

            testFromHooks(`${testCase.Description} @smoke`, async ({ page, loginPage }, testInfo) => {
                const hooks = pageObjects.hooks;
                let testPassed = false;

                try {
                    console.log(`\n🔄 Executing: ${testCase.Description}`);
                    console.log(`📋 Test Case ID: ${testCase.TestCaseID}`);
                    console.log(`🔧 Function: ${testCase.TCToExecute}`);

                    const testData = keywordController.getTestData(testCase);

                    if (testData) {
                        console.log(`📊 Test Data Loaded from: ${testCase.DataFile}`);
                        console.log('Data:', JSON.stringify(testData, null, 2));
                    } else {
                        console.log('ℹ️ No test data file specified for this test');
                    }

                    if (!TestCases.has(testCase.TCToExecute)) {
                        throw new Error(
                            `Test '${testCase.TCToExecute}' is not registered in TestCases.\n` +
                            `Available tests: ${TestCases.getRegisteredTests().join(', ')}`
                        );
                    }

                    await TestCases.execute(testCase.TCToExecute, testData, hooks);

                    console.log(`✅ Test Passed: ${testCase.TestCaseID}`);
                    testPassed = true;

                } catch (error) {
                    console.error(`❌ Test Failed: ${testCase.TestCaseID}`, error);
                    testPassed = false;
                    throw error;
                }
            });
        });
    });
});