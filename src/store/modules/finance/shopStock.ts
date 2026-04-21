import { defineStore } from 'pinia';
import { piniaPersistConfig } from '@/config/piniaPersist';

export interface ShopStockState {
	lastStockBatch: string;
}

// 进货单仓库
export const useShopStockStore = defineStore('shop-stock', {
	state: (): ShopStockState => ({
		lastStockBatch: '',
	}),
	actions: {
		setLastStockBatch(batch: string) {
			this.lastStockBatch = batch;
		},
	},
	persist: piniaPersistConfig('shop-stock'),
});
