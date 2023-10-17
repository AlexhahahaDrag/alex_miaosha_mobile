export interface ItemInfo {
    name: string,
    value: number | string,
}

export interface barItem {
    xAxis?: string[];
    series?: string[][];
    yTitle?: string;
    xTile: string,
    yNameGap?: number;
    tooltip?: {};
    legend?: [];
    color?: string;
}