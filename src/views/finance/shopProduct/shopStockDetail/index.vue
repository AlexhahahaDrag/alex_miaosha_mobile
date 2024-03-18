<template>
    <navBar :info="info"></navBar>
    <van-form required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.shopName" name="shopName" :label="label.shopName + '：'"
                :placeholder="'请输入' + label.shopName" :maxlength="255" />
            <van-field v-model="formInfo.shopCode" name="shopCode" :label="label.shopCode + '：'" :maxlength="255"
                :readonly="true" />
            <van-field v-model="formInfo.saleAmount" name="saleAmount" :label="label.saleAmount + '：'"
                :placeholder="'请输入' + label.saleAmount" :maxlength="10" />
            <van-field v-model="isValidName" name="isValid" :label="label.isValid + '：'"
                :placeholder="'请输入' + label.isValid" readonly />
            <van-field v-model="saleDateName" name="saleDate" :label="label.saleDate + '：'"
                :placeholder="'请输入' + label.saleDate" readonly />
            <van-field v-model="categoryName" name="category" :label="label.category + '：'"
                :placeholder="'请输入' + label.category" readonly />
            <van-field v-model="purchasePlaceName" name="purchasePlace" :label="label.purchasePlace + '：'"
                :placeholder="'请输入' + label.purchasePlace" readonly />
            <van-field v-model="formInfo.saleNum" name="saleNum" :label="label.saleNum + '：'"
                :placeholder="'请输入' + label.saleNum" :maxlength="10" />
        </van-cell-group>
        <div class="subButton">
            <van-button round block type="primary" native-type="submit">
                加入购物车
            </van-button>
            <van-button round block type="primary" native-type="submit">
                直接购买
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { showFailToast } from 'vant';
import { getShopStockDetail } from '@/api/finance/shopStock/shopStockTs';
import { getDictList } from "@/api/finance/dict/dictManager";
import { label } from './shopProductDetailTs';

let route = useRoute();
const info = ref<any>({
    title: route?.meta?.title || '商店库存表',
    leftPath: '/finance/shopStock',
});

let formInfo = ref<any>({});

let isValidName = ref<string>("");

let categoryName = ref<string>("");

let purchasePlaceName = ref<string>("");

const getListName = (list: any[], value: any, code: string, name: string) => {
    if (!list?.length) {
        return "";
    }
    let listName = "";
    list.forEach((item) => {
        if (item[code] == value) {
            listName = item[name];
        }
    });
    return listName;
};

function getDictInfoList(res: any) {
    if (res?.code == "200") {
        isValidName.value = getListName(
            res.data.filter(
                (item: { belongTo: string }) => item.belongTo == "is_valid"
            ) || [],
            formInfo.value.isValid,
            "typeCode",
            "typeName"
        );
        categoryName.value = getListName(
            res.data.filter(
                (item: { belongTo: string }) => item.belongTo == "shop_category"
            ) || [],
            formInfo.value.category,
            "typeCode",
            "typeName"
        );
        purchasePlaceName.value = getListName(
            res.data.filter(
                (item: { belongTo: string }) => item.belongTo == "stock_place"
            ) || [],
            formInfo.value.purchasePlace,
            "typeCode",
            "typeName"
        );
    } else {
        showFailToast(res?.message || "查询失败，请联系管理员!");
    }
}

let saleDateName = ref<string>('');

const initInfoDate = (infoDate: Dayjs, type: string) => {
    if (infoDate) {
        switch (type) {
            case 'saleDate':
                saleDateName.value = dayjs(infoDate).format('YYYY年MM月DD');
                break;
        }
    }
}

function init() {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getShopStockDetail(id || '-1'),
            getDictList("is_valid,shop_category,stock_place"),
        ]).then((res: any) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
                console.log(`res:`, res[0])
                formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
                initInfoDate(formInfo.value.saleDate, 'saleDate');
            } else {
                showFailToast(res?.message || '查询详情失败，请联系管理员!')
            }
            getDictInfoList(res[1]);
        }).catch(() => {
            showFailToast('系统问题，请联系管理员！')
        });
    } else {
        getDictList("is_valid,shop_category,stock_place").then((res: any) => {
            getDictInfoList(res);
        });
        formInfo.value = {
            saleDate: dayjs(),
            isValid: 1,
            purchasePlace: 'sz',

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