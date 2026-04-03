import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import { dynamicDataLoader } from "./DynamicDataLoader";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_TEST_SUITE_CSV = (process.env.TEST_SUITE_CSV || 'Smoke_TestCases.csv').trim();

export interface TestCase {
    TestCaseID: string;
    TCToExecute: string;
    Description: string;
    Execute: string;
    DataFile?: string;        
    DataRowIndex?: string;   
    RequiresLogin?: string;   
    TestPlanID: string;
    SuiteID: string;
    Status: string;
    ParentSuteID?: string;
    Notes?: string;
}

export class CSVDataController {
    private testCases: TestCase[] = [];
    private csvFilePath: string;
    private csvFileName: string;

    constructor(csvFileName: string = DEFAULT_TEST_SUITE_CSV) {
        this.csvFileName = csvFileName;
        this.csvFilePath = path.resolve(process.cwd(), "test-data", csvFileName);
        this.loadTestCases();
    }

    /**
     * Load test cases from CSV file
     */
    private loadTestCases(): void {
        try {
            const fileContent = fs.readFileSync(this.csvFilePath, "utf-8");

            // Parse CSV using csv-parse library
            this.testCases = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            console.log(`✓ Loaded ${this.testCases.length} test cases from ${this.csvFilePath}`);
        } catch (error) {
            console.error(`Error loading test cases from ${this.csvFilePath}:`, error);
            throw error;
        }
    }

    /**
     * Get all test cases where Execute = 'Y'
     */
    getExecutableTests(): TestCase[] {
        return this.testCases.filter(tc => tc.Execute.toUpperCase() === 'Y');
    }

    /**
     * Get all test cases where Execute = 'N'
     */
    getSkippedTests(): TestCase[] {
        return this.testCases.filter(tc => tc.Execute.toUpperCase() === 'N');
    }

    /**
     * Get test case by TCToExecute name
     */
    getTestByName(tcName: string): TestCase | undefined {
        return this.testCases.find(tc => tc.TCToExecute === tcName);
    }

    /**
     * Check if a test should be executed
     */
    shouldExecute(tcName: string): boolean {
        const testCase = this.getTestByName(tcName);
        return testCase ? testCase.Execute.toUpperCase() === 'Y' : false;
    }

    /**
     * Get all test cases
     */
    getAllTests(): TestCase[] {
        return this.testCases;
    }

    /**
     * Get test cases by status
     */
    getTestsByStatus(status: string): TestCase[] {
        return this.testCases.filter(tc => 
            tc.Status.toLowerCase() === status.toLowerCase()
        );
    }

    /**
     * Get test cases by Execute flag (Y, N, NA, NE)
     */
    getTestsByExecuteFlag(flag: string): TestCase[] {
        return this.testCases.filter(tc => 
            tc.Execute.toUpperCase() === flag.toUpperCase()
        );
    }

    /**
     * Get the CSV file name being used
     */
    getCSVFileName(): string {
        return this.csvFileName;
    }

    /**
     * Print summary of test execution plan
     */
    printExecutionSummary(): void {
        const executable = this.getExecutableTests();
        const skipped = this.getSkippedTests();
        const notApplicable = this.getTestsByExecuteFlag('NA');
        const notExecuted = this.getTestsByExecuteFlag('NE');

        console.log('\n========= Test Execution Summary =========');
        console.log(`CSV File: ${this.csvFileName}`);
        console.log(`Total Test Cases: ${this.testCases.length}`);
        console.log(`✓ To Execute (Y): ${executable.length}`);
        console.log(`X Skipped (N): ${skipped.length}`);
        console.log(`- Not Applicable (NA): ${notApplicable.length}`);
        console.log(`- Not Executed (NE): ${notExecuted.length}`);
        console.log('-------------------------------------------\n');

        if (executable.length > 0) {
            console.log('Tests to Execute:');
            executable.forEach((tc, index) => {
                console.log(` ${index + 1}. ${tc.TCToExecute} - ${tc.Description}`);
            });
            console.log('');
        }
    }

    /**
     * Get test data for a specific test case
     * @param testCase - The test case
     * @returns Test data from the specified CSV file, or null if no data file specified
     */
    getTestData(testCase: TestCase): any | any[] | null {
        if (!testCase.DataFile) {
            console.log(`ℹ️ No data file specified for ${testCase.TestCaseID}`);
            return null;
        }

        // Check if specific row index is provided
        if (testCase.DataRowIndex !== undefined && testCase.DataRowIndex !== '') {
            const rowIndex = parseInt(testCase.DataRowIndex);
            if (!isNaN(rowIndex)) {
                return dynamicDataLoader.loadData(testCase.DataFile, rowIndex);
            }
        }

        // Return first row by default (most common case)
        return dynamicDataLoader.loadFirstRow(testCase.DataFile);
    }

    /**
     * Get all test data rows for a specific test case
     * @param testCase - The test case
     * @returns All test data rows from the specified CSV file
     */
    getAllTestData(testCase: TestCase): any[] | null {
        if (!testCase.DataFile) {
            return null;
        }
        return dynamicDataLoader.loadAllRows(testCase.DataFile);
    }

    /**
     * Generate Playwright test tags for executable tests
     */
    generateTestTags(): string[] {
        return this.getExecutableTests().map(tc => tc.TCToExecute);
    }

    /**
     * Export executable tests as JSON for reporting
     */
    exportExecutableTests(outputPath?: string): void {
        const executable = this.getExecutableTests();
        const output = outputPath || path.resolve(__dirname, '../test-results/executable-tests.json');

        fs.writeFileSync(output, JSON.stringify(executable, null, 2));
        console.log(`✓ Exported ${executable.length} executable tests to ${output}`);
    }

    /**
     * Static method to create a new controller instance for a specific CSV file
     * @param csvFileName - Name of the CSV file (without path)
     * @returns New CSVDataController instance
     */
    static create(csvFileName: string): CSVDataController {
        return new CSVDataController(csvFileName);
    }
}

// Export singleton instance (default from TEST_SUITE_CSV in .env, fallback: Smoke_TestCases.csv)
export const smokeTestController = new CSVDataController();

// Export factory function for creating controllers with custom CSV files
export function createTestController(csvFileName: string): CSVDataController {
    return CSVDataController.create(csvFileName);
}