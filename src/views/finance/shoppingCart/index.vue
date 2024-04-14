<template>
    <NavBar :info="info"></NavBar>
    <div class="container">
        <div class="content">
            <van-cell-group>
                <van-swipe-cell :key="index" v-if="shopCartList?.length" v-for="(item, index) in shopCartList">
                    <div class="cell-info">
                        <van-tag style="width: 10px;" v-if="(item?.stockNum || 0) === 0" color="grey"
                            text-color="#ffffff">无货</van-tag>
                        <van-checkbox v-if="item?.stockNum || 0 > 0" v-model="item.checked" icon-size="18px"
                            @change="changeCheck"></van-checkbox>
                        <van-cell center :key="item?.id" @click="selectProduct(item)">
                            <template #title>
                                <div class="text-left">
                                    <span :class="item?.stockNum || 0 > 0 ? '' : 'font-grey'">{{ item.shopName }}</span>
                                    <van-tag type="primary">{{ item.oldShopCode }}</van-tag>
                                </div>
                            </template>
                            <template #right-icon>
                                <div class="text-right">
                                    <div class="rightRedDiv" @click.stop>
                                        <van-stepper v-model="item.saleNum" @change="changeCount(item)" min="1"
                                            theme="round" button-size="20px" :disabled="(item?.stockNum || 0) === 0" />
                                    </div>
                                </div>
                            </template>
                            <template #label>
                                <div class="amountInfo">
                                    ￥{{ commonUtils.formatAmount(item.saleAmount || 0, 2, '') }}
                                </div>
                            </template>
                        </van-cell>
                    </div>
                    <template #right>
                        <van-button class="right_info" @click="delShopCartInfo(item.id)" square type="danger"
                            text="删除" />
                    </template>
                    <van-divider :style="{
        color: '#1989fa',
        borderColor: 'grey',
        padding: '0 16px',
        'margin-top': '0px',
        'margin-bottom': '0px',
    }">
                    </van-divider>
                </van-swipe-cell>
            </van-cell-group>
        </div>
        <div class="footer-container">
            <div class="footer">
                <div class="amount-info">
                    ￥{{ commonUtils.formatAmount(sumAmount || 0, 2, '') }}
                </div>
                <div class="checkout-button">
                    <van-button @click="settlementAmount" style="width: 100%" :loading="submitLoading" round
                        type="danger" loading-text="结算中...">结 算</van-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import commonUtils from '@/utils/common/index';
import { ShopCartInfo } from '@/views/finance/shoppingCart/shoppingCartTs';
import {
    getShopCartList,
    addOrEditShopCart,
    deleteShopCart,
} from '@/api/finance/shopCart/shopCartTs';

let route = useRoute();
let router = useRouter();

const info = ref<any>({
    title: route?.meta?.title || "购物车",
});

let sumAmount = ref<number>(0);
let submitLoading = ref<boolean>(false);
let shopCartList = ref<ShopCartInfo[]>([]);
const settlementAmount = () => {
    let ids = shopCartList.value.filter((item: ShopCartInfo) => item.checked).map((item: ShopCartInfo) => item.id);
    router.push({ name: 'saleTicket', query: { type: 'shopCart', ids: ids } });
};

const getSumAmount = (): void => {
    if (!shopCartList.value?.length) {
        sumAmount.value = 0;
        return;
    }
    sumAmount.value = 0;
    shopCartList.value.forEach((item: any) => {
        if (item?.checked) {
            sumAmount.value = commonUtils.plus(sumAmount.value,
                commonUtils.multiply(item.saleAmount, item.saleNum));
        }
    });
}

const changeCount = (item: ShopCartInfo): void => {
    // 保存购物车信息
    addOrEditShopCart('put', {
        id: item.id,
        saleNum: item.saleNum,
    });
    // 求和选中商品金额
    getSumAmount();
}

const getShopCartListInfo = async () => {
    await getShopCartList().then((res: any) => {
        if (res?.code == "200") {
            if (res?.data) {
                shopCartList.value = res.data;
            } else {
                showFailToast(res?.message || "获取购物车失败，请联系管理员！");
            }
        }
    }).catch((err: any) => {
        showFailToast(err?.message || "删除失败，请联系管理员！");
    });;
};

const selectProduct = (info: ShopCartInfo) => {
    shopCartList.value.forEach((item: ShopCartInfo) => {
        if (item.id === info.id) {
            item.checked = !info.checked;
        }
    });
    getSumAmount();
}

const changeCheck = (): void => {
    getSumAmount();
};

const delShopCartInfo = (id: number): void => {
    deleteShopCart(id + '').then((res: any) => {
        if (res?.code == "200") {
            showSuccessToast("删除成功！");
            init()
        } else {
            showFailToast(res?.message || "删除失败，请联系管理员！");
        }
    }).catch((err: any) => {
        showFailToast(err?.message || "删除失败，请联系管理员！");
    });
};

const init = async () => {
    await getShopCartListInfo();
    getSumAmount();
};

init();

onMounted(async () => {
    init();
});
</script>

<style>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .content {
        .text-left {
            font-size: 17px;
            width: 100%;
            padding-bottom: 15px;
        }

        .amountInfo {
            font-size: 15px;
            color: red;
        }

        .cell-info {
            display: flex;
            justify-content: space-between;
            /* 使子元素分别对齐到容器的两端 */
            align-items: center;
            /* 纵向居中对齐 */
            left: 0;
            width: 100%;
            padding: 10px;
            /* 根据需要调整 */
            box-sizing: border-box;
        }

        .right_info {
            height: 100%;
        }
    }
}

.footer {
    display: flex;
    justify-content: space-between;
    /* 使子元素分别对齐到容器的两端 */
    align-items: center;
    /* 纵向居中对齐 */
    position: fixed;
    /* 或使用 absolute，根据需要 */
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 10px;
    /* 根据需要调整 */
    box-sizing: border-box;
    /* 确保内边距不会影响到元素的总宽度 */
    background-color: #f8f8f8;
    /* 根据需要调整 */
}

.amount-info {
    padding-left: 15px;
    display: flex;
    align-items: center;
    color: red;
    font-size: 28px;

    .old-info {
        font-size: 15px;
        color: gray;
        text-decoration: line-through;
    }
}

.checkout-button {
    width: 25%;
}

.font-grey {
    color: gray;
}
</style>