import { parse } from "jsr:@std/csv";
import type { Series } from "../types.ts";

export const convertCsvToSeries = (filePath: string): Series => {
    const content = Deno.readTextFileSync(filePath);

    const data = parse(content, {
        skipFirstRow: true,
        strip: true,
        separator: ";",
        columns: ["time", "wattage", "_"],
        comment: "#",
    });

    let startDate = new Date();
    let endDate = new Date(0);

    let minWattage = Infinity;
    let maxWattage = -Infinity;

    const items = data.map((item) => {
        const date = convertToDate(item.time);
        const wattage = parseFloat(item.wattage.replace(",", "."));

        if (date < startDate) {
            startDate = date;
        }

        if (date > endDate) {
            endDate = date;
        }

        if (wattage < minWattage) {
            minWattage = wattage;
        }

        if (wattage > maxWattage) {
            maxWattage = wattage;
        }

        return {
            time: date,
            wattage,
        };
    });

    return {
        path: filePath,
        endDate,
        items,
        maxWattage,
        minWattage,
        startDate,
    };
};

function convertToDate(timestamp: string): Date {
    const [datePart, timePart] = timestamp.split(" ");

    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes);
}
