import { ShopStockInfo } from '@/views/finance/shopStock/shopStockTs';

export interface SaleOrderInfo {
    sumSaleAmount?: number;
    incomeAndExpenses?: string;
    shopStockVoList?: ShopStockInfo[];
}