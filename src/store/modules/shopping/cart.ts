import type { CartState } from './typing';
import { piniaPersistConfig } from '@/config/piniaPersist';
import type { ShopStockInfo } from '@/views/finance/shopStock/shopStockTs';

export const useCartStore = defineStore({
	id: 'app-cart',
	state: (): CartState => ({
		shoppingCart: [] as ShopStockInfo[],
	}),

	getters: {
		getShoppingCart(): ShopStockInfo[] {
			const localStorage = window.localStorage;
			return this.shoppingCart || JSON.parse(localStorage.getItem('shoppingCart') || '') || [];
		},
	},
	actions: {
		setShoppingCart(shoppings: ShopStockInfo[]) {
			this.shoppingCart = shoppings;
			localStorage.setItem('shoppingCart', JSON.stringify(this.shoppingCart));
		},
	},
	persist: piniaPersistConfig('app-cart'),
});
