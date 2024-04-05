import { CartState } from './typing';
import { piniaPersistConfig } from '@/config/piniaPersist';
import { ShopStockInfo, } from '@/views/finance/shopStock/shopStockTs';

export const useCartStore = defineStore({
    id: 'app-cart',
    state: (): CartState => ({
        shoppingCart: [] as ShopStockInfo[],
    }),

    getters: {
        getShoppingCart(): ShopStockInfo[] {
            let localStorage = window.localStorage;
            console.log(`get shoppingCart`, this.shoppingCart)
            return this.shoppingCart || JSON.parse(localStorage.getItem("shoppingCart") || '') || [];
        },
    },
    actions: {
        addShoppingCart(shopping: ShopStockInfo) {
            this.shoppingCart.push(shopping);
            console.log(`set shoppingCart`, this.shoppingCart)
            localStorage.setItem("shoppingCart", JSON.stringify(this.shoppingCart));
        },
        setShoppingCart(shoppings: ShopStockInfo[]) {
            this.shoppingCart = shoppings;
            localStorage.setItem("shoppingCart", JSON.stringify(this.shoppingCart));
        },
        // async login(
        //   params: LoginParams & {
        //     goHome?: boolean;
        //   }
        // ) {
        //   try {
        //     const { goHome = true, ...loginParams } = params;
        //     const data = await loginApi(loginParams);
        //     if (data?.code == '200') {
        //       const { token, admin } = data.data;
        //       this.setUserInfo(admin);
        //       return admin;
        //     } else {
        //       showFailToast((data?.message) || '登录失败！');
        //     }
        //   } catch (error) {
        //     // message.error("系统错误，请联系管理员！", 3);
        //     return Promise.reject(error);
        //   }
        // },
    },
    persist: piniaPersistConfig('app-cart'),
});
