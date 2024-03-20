<template>
    <NavBar :info="info"></NavBar>
    <div class="header-container">
        <div class="title">丁丁尾单</div>
    </div>
    <div class="container">
        <div class="content">
            <!-- 页面主要内容 -->
        </div>
        <div class="footer-container">
            <div class="footer">
                <div class="amount-info">¥{{ commonUtils.formatAmount(sumAmount, 2, '') }}</div>
                <div class="checkout-button">
                    <van-button @click="submitOrder" :loading="submitLoading" round type="danger"
                        loading-text="提交中...">提交订单</van-button>
                </div>
            </div>
        </div>
    </div>

    <!-- <van-submit-bar :price="3050" button-text="提交订单" @submit="onSubmit">
        <van-checkbox v-model="selectAll">全选</van-checkbox>
        <template #price>

        </template>
        <template #tip>
            你的收货地址不支持配送, <span @click="onClickLink">修改地址</span>
        </template>
    </van-submit-bar> -->
</template>
  
<script setup lang="ts">
import { showToast } from 'vant';
import commonUtils from '@/utils/common/index'

let route = useRoute();

const info = ref<any>({
    title: route?.meta?.title || "订单提交",
    leftPath: "/",
});

let sumAmount = ref<number>(0);
let submitLoading = ref<boolean>(false);
const submitOrder = () => {
    submitLoading.value = true;
};
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
    min-height: 100vh;
}

.content {
    flex: 1;
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
    font-size: 25px;
    color: red;
    padding-left: 15px;
}

.checkout-button {
    /* 可以根据需要添加样式 */
}
</style>
  