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
        for (const [day, generation] of g.dailyGeneration) {
            if (acc.has(day)) {
                acc.set(day, acc.get(day)! + generation);
            } else {
                acc.set(day, generation);
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

    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const previousItem = items[i - 1];

        const currentDate = item.time;
        const previousDate = previousItem.time;

        // Berechne die Zeitdifferenz in Sekunden
        const timeDifferenceInSeconds =
            (currentDate.getTime() - previousDate.getTime()) / 1000;

        // Berechne die Erzeugung in kWh (Watt * Zeit in Sekunden, dann Umrechnung in kWh)
        const energyProduced =
            (previousItem.wattage * timeDifferenceInSeconds) / (1000 * 3600); // Watt zu kWh

        const dayKey = `${previousDate.getFullYear()}-${
            ("0" + (previousDate.getMonth() + 1)).slice(-2)
        }-${("0" + (previousDate.getDate() + 1)).slice(-2)}`;
        const monthKey = `${previousDate.getFullYear()}-${
            ("0" + (previousDate.getMonth() + 1)).slice(-2)
        }`;

        // Tageserzeugung aktualisieren
        if (dailyGeneration.has(dayKey)) {
            dailyGeneration.set(
                dayKey,
                dailyGeneration.get(dayKey)! + energyProduced,
            );
        } else {
            dailyGeneration.set(dayKey, energyProduced);
        }

        // Monatserzeugung aktualisieren
        if (monthlyGeneration.has(monthKey)) {
            monthlyGeneration.set(
                monthKey,
                monthlyGeneration.get(monthKey)! + energyProduced,
            );
        } else {
            monthlyGeneration.set(monthKey, energyProduced);
        }
    }

    return { dailyGeneration, monthlyGeneration };
}
