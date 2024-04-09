<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.orderId" name="orderId" :label="label.orderId + '：'"
                :placeholder="'请输入' + label.orderId" :rules="rulesRef.orderId" :maxlength="19" />
            <van-field v-model="formInfo.shopName" name="shopName" :label="label.shopName + '：'"
                :placeholder="'请输入' + label.shopName" :rules="rulesRef.shopName" :maxlength="255" />
            <van-field v-model="formInfo.shopCode" name="shopCode" :label="label.shopCode + '：'"
                :placeholder="'请输入' + label.shopCode" :rules="rulesRef.shopCode" :maxlength="255" />
            <van-field v-model="formInfo.saleAmount" name="saleAmount" :label="label.saleAmount + '：'"
                :placeholder="'请输入' + label.saleAmount" :rules="rulesRef.saleAmount" :maxlength="10" />
            <van-field v-model="formInfo.isValid" name="isValid" :label="label.isValid + '：'"
                :placeholder="'请输入' + label.isValid" :rules="rulesRef.isValid" :maxlength="1" />
            <van-field v-model="saleDateName" name="saleDate" :label="label.saleDate + '：'"
                :placeholder="'请输入' + label.saleDate" :rules="rulesRef.saleDate" @click="chooseDate('saleDate')" readonly />
            <van-field v-model="formInfo.payWay" name="payWay" :label="label.payWay + '：'"
                :placeholder="'请输入' + label.payWay" :rules="rulesRef.payWay" :maxlength="64" />
            <van-field v-model="formInfo.saleNum" name="saleNum" :label="label.saleNum + '：'"
                :placeholder="'请输入' + label.saleNum" :rules="rulesRef.saleNum" :maxlength="10" />
            <van-field v-model="formInfo.shopStockId" name="shopStockId" :label="label.shopStockId + '：'"
                :placeholder="'请输入' + label.shopStockId" :rules="rulesRef.shopStockId" :maxlength="19" />
            <datePop :info="chooseDateInfo" @selectInfo="selectDateInfo" @cancelInfo="cancelDateInfo"></datePop>
        </van-cell-group>
        <div class="subButton">
            <van-button round block type="primary" native-type="submit">
                提交
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditShopOrderDetail, getShopOrderDetailDetail } from '@/api/finance/shopOrderDetail/shopOrderDetailTs';
import { label, rulesRef } from './shopOrderDetailDetailTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '商店订单明细表',
    leftPath: '/finance/shopOrderDetail',
});

let formInfo = ref<any>({});


let saleDateName = ref<string>('');
let saleDateInfo = ref<any>({
    label: 'saleDate',
    labelName: '销售日期',
    rule: rulesRef.saleDate,
    selectValue: dayjs(),
    showFlag: false,
    formatter: (type: string, option: any) => {
        if (type === 'year') {
            option.text += '年';
        }
        if (type === 'month') {
            option.text += '月';
        }
        if (type === 'day') {
            option.text += '日';
        }
        return option;
    },
});

let chooseDateInfo = ref<Info>({ showFlag: false });

const chooseDate = (type: string): void => {
    chooseDateInfo.value.showFlag = true;
    switch (type) {
        case 'saleDate':
            chooseDateInfo.value = saleDateInfo.value
            break;
    }
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string): void => {
    switch(type) {
        case 'saleDate':
            formInfo.value.saleDate = date;
            saleDateName.value = dateName;
            break;
    }
    chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = (): void => {
    chooseDateInfo.value.showFlag = false;
}

const initInfoDate = (infoDate: Dayjs, type: string): void => {
    if (infoDate) {
        switch(type) {
            case 'saleDate':
                saleDateName.value = dayjs(infoDate).format('YYYY-MM-DD');
                saleDateInfo.value.selectValue = infoDate;
                break;
        }
    }
}

const onSubmit = (): void => {
    let method = 'post';
    if (formInfo.value.id) {
        method = 'put'
    }
    addOrEditShopOrderDetail(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/finance/shopOrderDetail' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

const init = (): void => {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getShopOrderDetailDetail(id || '-1'),
        ]).then((res: any) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
                formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
                initInfoDate(formInfo.value.saleDate, 'saleDate');
            } else {
                showFailToast(res?.message || '查询详情失败，请联系管理员!')
            }
        }).catch(() => {
            showFailToast('系统问题，请联系管理员！')
        });
    } else {
        formInfo.value = {
            saleDate: dayjs(),
        };
        initInfoDate(formInfo.value.saleDate, 'saleDate');
    }
}

init();
</script>
<style lang='scss' scoped>
.subButton {
   margin: 16px;
}
</style>