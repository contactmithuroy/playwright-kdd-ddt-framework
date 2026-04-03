import { readCSV } from "../utils/csvReader";

const cache: Record<string, Record<string, string>[]> = {};

export const DataStore = {

    privateLoad(filePath: string) {
        if (!cache[filePath]) {
            cache[filePath] = readCSV(filePath) ?? [];
        }
        return cache[filePath];
    },

    getAll(filePath: string) {
        return this.privateLoad(filePath);
    },

    getRow(filePath: string, rowIndex: number) {
        const data = this.privateLoad(filePath);
        return data[rowIndex];
    },

    getCell(filePath: string, rowIndex: number, columnName: string) {
        const row = this.getRow(filePath, rowIndex);
        return row?.[columnName];
    }
};