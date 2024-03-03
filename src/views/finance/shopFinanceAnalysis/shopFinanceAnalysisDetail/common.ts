import { Dayjs } from 'dayjs';

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

export interface FinanceDetail {
  id?: number;
  name?: string;
  typeCode?: string;
  amount?: number;
  fromSource?: string;
  fromSourceName?: string;
  isValid?: string;
  infoDate?: Dayjs | string;
  incomeAndExpenses?: string;
  belongTo?: string;
}