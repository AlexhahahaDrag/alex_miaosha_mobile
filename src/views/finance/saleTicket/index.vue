<template>
    <NavBar :info="info"></NavBar>
    <div class="header-container">
        <div class="title">丁丁尾单</div>
    </div>
    <div class="container">
        <div class="content">
            <van-cell v-for="item in dataSource" :key="item">
                <template #title>
                    <div class="text-left">
                        <span class="custom-title">{{ item.shopName }}</span>
                        <van-tag type="primary">{{ item.oldShopCode }}</van-tag>
                    </div>
                </template>
                <template #right-icon>
                    <div class="text-right">
                        <div class="rightRedDiv">
                            <van-stepper v-model="item.saleNum" @change="getSumAmount" min="1" />
                        </div>
                    </div>
                </template>
                <template #label>
                    <div class="amountInfo">
                        ￥{{ commonUtils.formatAmount(item?.saleAmount, 2, '') }}
                    </div>
                </template>
            </van-cell>
        </div>
        <div class="footer-container">
            <div class="footer">
                <div class="amount-info">
                    <van-field v-model="finalSumAmount" type="number" @change="changeSumAmount" label="￥"
                        placeholder="请输入用户名" />
                    <div class="old-info" v-if="showOldAmount">
                        ￥{{ commonUtils.formatAmount(sumAmount, 2, '') }}
                    </div>
                </div>
                <div class="checkout-button">
                    <van-button @click="submitOrder" :loading="submitLoading" round type="danger"
                        loading-text="提交中...">提交订单</van-button>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { showFailToast } from 'vant';
import commonUtils from '@/utils/common/index';
import { getShopList } from '@/api/finance/shopStock/shopStockTs';
import { ShopStockInfo } from '@/views/finance/shopStock/shopStockTs';

let route = useRoute();

const info = ref<any>({
    title: route?.meta?.title || "订单提交",
});

let sumAmount = ref<number>(0);
let finalSumAmount = ref<number>(0);
let submitLoading = ref<boolean>(false);
let showOldAmount = ref<boolean>(false);
const submitOrder = () => {
    submitLoading.value = true;
};

const getSumAmount = (): void => {
    console.log(22222222222)
    if (!dataSource.value?.length) {
        sumAmount.value = 0;
        return;
    }
    sumAmount.value = 0;
    // todo 修改为购物车对应的样式
    dataSource.value.forEach((item: any) => {
        sumAmount.value = commonUtils.plus(sumAmount.value,
            commonUtils.multiply(item.saleAmount, item.saleNum));
    });
    finalSumAmount.value = sumAmount.value;
    showOldAmount.value = false;
}

const changeSumAmount = () => {
    showOldAmount.value = finalSumAmount.value < sumAmount.value;
}

let dataSource = ref<any>([]);

const getShopListInfo = async(ids: string) => {
    await getShopList(ids).then((res: any) => {
        console.log(111111111111111)
        if (res?.code == "200") {
            dataSource.value = res.data;
            if (dataSource.value?.length) {
                dataSource.value.forEach((item: ShopStockInfo) => {
                    item.saleNum = 1;
                });
            } else {
                showFailToast("获取订单失败，请联系管理员！");
            }
        }
    });
}

onMounted(async () => {
    let ids: any = route.query.ids;
    await getShopListInfo(ids);
    getSumAmount();
});
</script>
  
<style>
.header-container {
    height: 100px;
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;

    /* 垂直居中 */
    .title {
        font-size: 40px;
        font-weight: bolder;
    }
}

.container {
    display: flex;
    flex-direction: column;

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

    .van-field {
        --van-field-label-width: 5%;
        --van-field-label-color: red;
        --van-field-input-text-color: red;

        .van-field__control {
            font-size: 25px;
            width: 100px;
        }
    }

    .old-info {
        font-size: 15px;
        color: gray;
        text-decoration: line-through;
    }
}

.checkout-button {
    /* 可以根据需要添加样式 */
}
</style>
  