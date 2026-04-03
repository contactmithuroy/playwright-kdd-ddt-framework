import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export function readCSV(filePath: string) {

    try {
        const absolutePath = path.resolve(__dirname, filePath);
        const fileContent = fs.readFileSync(absolutePath, "utf-8");

        const [headerLine, ...lines] = fileContent.trim().split("\n");
        const headers = headerLine.split(",").map(h => h.trim());

        return lines.map(line => {
            const values = line.split(",").map(v => v.trim());
            return Object.fromEntries(
                headers.map((h, i) => [h, values[i]])
            );
        });
    } catch (error) {
        console.error("Error reading test data file:", error);
    }
}