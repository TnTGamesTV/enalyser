import type { Item } from "../types.ts";
import { convertCsvToSeries } from "./csvToSeriesConverter.ts";

export const analysis = (files: string[]) => {
    const series = files.map((file) => convertCsvToSeries(file));

    const generation = series.map((s) => ({
        filePath: s.path,
        ...calculateDailyAndMonthlyGeneration(s.items),
    }));

    const dailyGeneration = generation.reduce((acc, g) => {
        for (const [day, generation] of g.dailyGeneration) {
            if (acc.has(day)) {
                acc.set(day, acc.get(day)! + generation);
            } else {
                acc.set(day, generation);
            }
        }
        return acc;
    }, new Map<string, number>());

    const monthlyGeneration = generation.reduce((acc, g) => {
        for (const [month, generation] of g.monthlyGeneration) {
            if (acc.has(month)) {
                acc.set(month, acc.get(month)! + generation);
            } else {
                acc.set(month, generation);
            }
        }
        return acc;
    }, new Map<string, number>());

    console.log(`Tägliche Erzeugung:`);

    for (const [day, generation] of dailyGeneration) {
        console.log(`${day}: ${generation.toFixed(2)} kWh`);
    }

    console.log(`Monatliche Erzeugung:`);

    for (const [month, generation] of monthlyGeneration) {
        console.log(`${month}: ${generation.toFixed(2)} kWh`);
    }

    return generation;
};

function calculateDailyAndMonthlyGeneration(
    items: Item[],
): {
    dailyGeneration: Map<string, number>;
    monthlyGeneration: Map<string, number>;
} {
    const dailyGeneration = new Map<string, number>();
    const monthlyGeneration = new Map<string, number>();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        //apprently the csv files contain directly kWh per entry even if this should be 1/4th of an hour
        //only god knows why they did that as it wasn't mentioned anywhere
        const energyProducedKwh = item.wattage;

        const dayKey = getDayKey(item.time);
        const monthKey = getMonthKey(item.time);

        if (dailyGeneration.has(dayKey)) {
            dailyGeneration.set(
                dayKey,
                dailyGeneration.get(dayKey)! + energyProducedKwh,
            );
        } else {
            dailyGeneration.set(dayKey, energyProducedKwh);
        }

        if (monthlyGeneration.has(monthKey)) {
            monthlyGeneration.set(
                monthKey,
                monthlyGeneration.get(monthKey)! + energyProducedKwh,
            );
        } else {
            monthlyGeneration.set(monthKey, energyProducedKwh);
        }
    }

    return { dailyGeneration, monthlyGeneration };
}

const getDayKey = (date: Date) => {
    return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${
        ("0" + (date.getDate())).slice(-2)
    }`;
};

const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}`;
};
