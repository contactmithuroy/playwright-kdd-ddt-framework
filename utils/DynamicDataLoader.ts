import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

export class DynamicDataLoader {
  private testDataPath: string;
  private dataCache: Map<string, any[]> = new Map();

  constructor() {
    this.testDataPath = path.resolve(process.cwd(), 'test-data');
  }

  loadData(fileName: string, rowIndex?: number): any | any[] {
    if (!fileName) {
      console.warn('⚠️ No data file specified');
      return null;
    }

    const filePath = path.join(this.testDataPath, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Data file not found: ${filePath}`);
      return null;
    }

    // Check cache first
    if (!this.dataCache.has(fileName)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true
        });

        this.dataCache.set(fileName, records);
        console.log(`✅ Loaded ${records.length} row(s) from ${fileName}`);
      } catch (error) {
        console.error(`❌ Error loading ${fileName}:`, error);
        return null;
      }
    }

    const data = this.dataCache.get(fileName)!;

    // Return specific row if index is provided
    if (rowIndex !== undefined) {
      if (rowIndex < 0 || rowIndex >= data.length) {
        console.warn(`⚠️ Row index ${rowIndex} out of bounds for ${fileName} (has ${data.length} rows)`);
        return null;
      }
      return data[rowIndex];
    }

    // Return all rows
    return data;
  }

  /**
   * Load data and return first row (most common use case)
   * @param fileName - Name of the CSV file
   */
  loadFirstRow(fileName: string): any {
    return this.loadData(fileName, 0);
  }

  /**
   * Load all rows from a CSV file
   * @param fileName - Name of the CSV file
   */
  loadAllRows(fileName: string): any[] {
    return this.loadData(fileName) as any[];
  }

  /**
   * Clear the data cache
   */
  clearCache(): void {
    this.dataCache.clear();
  }

  /**
   * Get all available data files in test-data directory
   */
  getAvailableDataFiles(): string[] {
    if (!fs.existsSync(this.testDataPath)) {
      return [];
    }

    return fs.readdirSync(this.testDataPath)
      .filter(file => file.endsWith(".csv"))
      .sort();
  }

  /**
   * Check if a data file exists
   */
  dataFileExists(fileName: string): boolean {
    const filePath = path.join(this.testDataPath, fileName);
    return fs.existsSync(filePath);
  }

  /**
   * Get column headers from a data file
   */
  getDataFileColumns(fileName: string): string[] | null {
    const filePath = path.join(this.testDataPath, fileName);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        to_line: 1 // Only read first line
      }) as Array<Record<string, unknown>>;

      if (records.length > 0) {
        return Object.keys(records[0]);
      }
      return [];
    } catch (error) {
      console.error(`Error reading columns from ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Preview data file (first N rows)
   */
  previewDataFile(fileName: string, numRows: number = 5): void {
    const allData = this.loadData(fileName);

    if (!allData) {
      console.log(`❌ Could not load ${fileName}`);
      return;
    }

    const data = Array.isArray(allData) ? allData : [allData];
    const preview = data.slice(0, numRows);

    console.log(`\n📄 Preview of ${fileName} (${data.length} total rows):`);
    console.log('-'.repeat(80));
    console.table(preview);
    console.log('-'.repeat(80) + '\n');
  }
}

// Export singleton instance
export const dynamicDataLoader = new DynamicDataLoader();