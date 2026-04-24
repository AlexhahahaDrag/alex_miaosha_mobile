import { defineStore } from 'pinia';
import type { CartState } from './typing';
import { piniaPersistConfig } from '@/config/piniaPersist';
import type { ShopStockInfo } from '@/views/finance/shopStock/shopStockTs';

export const useCartStore = defineStore('app-cart', {
	state: (): CartState => ({
		shoppingCart: [] as ShopStockInfo[],
	}),

	getters: {
		getShoppingCart(state): ShopStockInfo[] {
			return state.shoppingCart;
		},
	},
	actions: {
		setShoppingCart(shoppings: ShopStockInfo[]) {
			this.shoppingCart = shoppings;
		},
		clearShoppingCart() {
			this.shoppingCart = [];
		},
	},
	persist: piniaPersistConfig('app-cart'),
});
