<template>
    <navBar :info="info"></navBar>
    <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
        <van-cell-group>
            <van-field v-model="formInfo.saleOrderCode" name="saleOrderCode" :label="label.saleOrderCode + '：'"
                :placeholder="'请输入' + label.saleOrderCode" :rules="rulesRef.saleOrderCode" :maxlength="255" />
            <van-field v-model="formInfo.saleOrderName" name="saleOrderName" :label="label.saleOrderName + '：'"
                :placeholder="'请输入' + label.saleOrderName" :rules="rulesRef.saleOrderName" :maxlength="255" />
            <van-field v-model="formInfo.saleAmount" name="saleAmount" :label="label.saleAmount + '：'"
                :placeholder="'请输入' + label.saleAmount" :rules="rulesRef.saleAmount" :maxlength="10" />
            <van-field v-model="isValidName" name="isValid" :label="label.isValid + '：'"
                :placeholder="'请输入' + label.isValid" :rules="rulesRef.isValid" @click="choose('isValid')" readonly />
            <van-field v-model="saleDateName" name="saleDate" :label="label.saleDate + '：'"
                :placeholder="'请输入' + label.saleDate" :rules="rulesRef.saleDate" @click="chooseDate('saleDate')" readonly />
            <van-field v-model="formInfo.description" name="description" :label="label.description + '：'"
                :placeholder="'请输入' + label.description" :rules="rulesRef.description" :maxlength="65535" />
            <van-field v-model="formInfo.payWay" name="payWay" :label="label.payWay + '：'"
                :placeholder="'请输入' + label.payWay" :rules="rulesRef.payWay" :maxlength="128" />
            <van-field v-model="formInfo.saleCount" name="saleCount" :label="label.saleCount + '：'"
                :placeholder="'请输入' + label.saleCount" :rules="rulesRef.saleCount" :maxlength="10" />
            <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop>
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
import { addOrEditShopOrder, getShopOrderDetail } from '@/api/finance/shopOrder/shopOrderTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from "@/api/finance/dict/dictManager";
import { label, rulesRef } from './shopOrderDetailTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
    title: route?.meta?.title || '商店订单表',
    leftPath: '/finance/shopOrder',
});

let formInfo = ref<any>({});

let popInfo = ref<Info>({ showFlag: false });

let isValidName = ref<string>("");

let isValidInfo = ref<Info>({
    label: "isValid",
    labelName: label.isValid,
    rule: rulesRef.isValid,
    customFieldName: {
        text: "typeName",
        value: "typeCode",
    },
    selectValue: formInfo.value.isValid,
});

const choose = (type: string): void => {
    switch (type) {
        case 'isValid':
            popInfo.value = isValidInfo.value;
            break;
    }
    popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string): void => {
    popInfo.value.showFlag = false;
    switch (type) {
        case 'isValid':
           formInfo.value.isValid = value;
           isValidName.value = name;
           break;
    }
};

const cancelInfo = () => {
    popInfo.value.showFlag = false;
};

const getListName = (list: any[], value: any, code: string, name: string): void => {
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

const getDictInfoList = (res: any): void => {
   if (res?.code == "200") {
     isValidInfo.value.list = res.data.filter(
       (item: { belongTo: string }) => item.belongTo == "is_valid"
     );
     isValidName.value = getListName(
         isValidInfo.value.list || [],
         formInfo.value.isValid,
         "typeCode",
         "typeName"
     );
   } else {
     showFailToast(res?.message || "查询失败，请联系管理员!");
   }
}

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
    addOrEditShopOrder(method, formInfo.value).then((res: any) => {
        if (res?.code == '200') {
            showSuccessToast(res?.message || '保存成功!');
            router.push({ path: '/finance/shopOrder' });
        } else {
            showFailToast (res?.message || '保存失败，请联系管理员!');
        }
    });
};

const init = (): void => {
    let id: any = route?.query?.id;
    if (id) {
        Promise.all([
            getShopOrderDetail(id || '-1'),
            getDictList("is_valid"),
        ]).then((res: any) => {
            if (res[0].code == '200') {
                formInfo.value = res[0].data;
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
        getDictList("is_valid").then((res: any) => {
            getDictInfoList(res);
        });
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