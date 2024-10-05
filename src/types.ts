export type Item = {
    time: Date;
    wattage: number;
}

export type Series = {
    path: string;
    startDate: Date;
    endDate: Date;
    minWattage: number;
    maxWattage: number;
    items: Item[];
}