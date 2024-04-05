<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.shopId" name="shopId" :label="label.shopId + '：'"
                :placeholder="'请输入' + label.shopId" :rules="rulesRef.shopId" :maxlength="19" />
            <van-field v-model="formInfo.userId" name="userId" :label="label.userId + '：'"
                :placeholder="'请输入' + label.userId" :rules="rulesRef.userId" :maxlength="19" />
            <van-field v-model="formInfo.customerId" name="customerId" :label="label.customerId + '：'"
                :placeholder="'请输入' + label.customerId" :rules="rulesRef.customerId" :maxlength="19" />
            <van-field v-model="formInfo.isValid" name="isValid" :label="label.isValid + '：'"
                :placeholder="'请输入' + label.isValid" :rules="rulesRef.isValid" :maxlength="1" />
            <van-field v-model="formInfo.saleNum" name="saleNum" :label="label.saleNum + '：'"
                :placeholder="'请输入' + label.saleNum" :rules="rulesRef.saleNum" :maxlength="10" />
        </van-cell-group>
        <div class="subButton">
            <van-button round block type="primary" native-type="submit">
                提交
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditShopCart, getShopCartDetail } from '@/api/finance/shopCart/shopCartTs';
import { label, rulesRef } from './shopCartDetailTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '购物车表',
    leftPath: '/finance/shopCart',
});

let formInfo = ref<any>({});



const onSubmit = (): void => {
    let method = 'post';
    if (formInfo.value.id) {
        method = 'put'
    }
    addOrEditShopCart(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/finance/shopCart' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

const init = (): void => {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getShopCartDetail(id || '-1'),
        ]).then((res: any) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
            } else {
                showFailToast(res?.message || '查询详情失败，请联系管理员!')
            }
        }).catch(() => {
            showFailToast('系统问题，请联系管理员！')
        });
    } else {
        formInfo.value = {
        };
    }
}

init();
</script>
<style lang='scss' scoped>
.subButton {
   margin: 16px;
}
</style>