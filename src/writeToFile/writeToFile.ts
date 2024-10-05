import { DataItem, stringify } from "@std/csv";
import * as path from "@std/path";

export const writeResultsToFile = (
    results: {
        dailyGeneration: Map<string, number>;
        monthlyGeneration: Map<string, number>;
    },
    inputFile: string,
): void => {
    const folderPath = inputFile.substring(0, inputFile.lastIndexOf("/"));
    const fileName = path.basename(inputFile, path.extname(inputFile));

    const dailyGenerationOutputPath = path.join(
        folderPath,
        `${fileName}_daily.csv`,
    );
    const monthlyGenerationOutputPath = path.join(
        folderPath,
        `${fileName}_monthly.csv`,
    );

    writeDailyGenerationResults(
        results.dailyGeneration,
        dailyGenerationOutputPath,
    );

    writeMonthlyGeneration(
        results.monthlyGeneration,
        monthlyGenerationOutputPath,
    );
};

const writeDailyGenerationResults = (
    dailyGeneration: Map<string, number>,
    outputPath: string,
): void => {
    const dataItems: DataItem[] = [];

    for (const [day, generation] of dailyGeneration) {
        dataItems.push({
            day,
            generation: generation.toFixed(2).replace(".", ","),
        });
    }

    const output = stringify(dataItems, {
        bom: true,
        columns: [{
            prop: "day",
            header: "Tag",
        }, {
            prop: "generation",
            header: "Erzeugung (kWh)",
        }],
        headers: true,
        separator: ";",
    });

    Deno.writeTextFileSync(outputPath, output);
};

const writeMonthlyGeneration = (
    monthlyGeneration: Map<string, number>,
    outputPath: string,
): void => {
    const dataItems: DataItem[] = [];

    for (const [month, generation] of monthlyGeneration) {
        dataItems.push({
            month,
            generation: generation.toFixed(2).replace(".", ","),
        });
    }

    const output = stringify(dataItems, {
        bom: true,
        columns: [{
            prop: "month",
            header: "Monat",
        }, {
            prop: "generation",
            header: "Erzeugung (kWh)",
        }],
        headers: true,
        separator: ";",
    });

    Deno.writeTextFileSync(outputPath, output);
};
