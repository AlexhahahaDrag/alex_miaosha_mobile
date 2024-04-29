<template>
  <navBar :info="info"></navBar>
  <van-form required="auto">
    <van-cell-group>
      <van-field
        v-model="formInfo.saleOrderCode"
        name="saleOrderCode"
        :label="label.saleOrderCode + '：'"
        :placeholder="'请输入' + label.saleOrderCode"
        :maxlength="255"
        readonly
      />
      <van-field
        v-model="formInfo.saleOrderName"
        name="saleOrderName"
        :label="label.saleOrderName + '：'"
        :placeholder="'请输入' + label.saleOrderName"
        :maxlength="255"
      />
      <van-field
        v-model="formInfo.saleAmount"
        name="saleAmount"
        :label="label.saleAmount + '：'"
        :placeholder="'请输入' + label.saleAmount"
        :maxlength="10"
      />
      <van-field
        v-model="isValidName"
        name="isValid"
        :label="label.isValid + '：'"
        :placeholder="'请输入' + label.isValid"
        @click="choose('isValid')"
        readonly
      />
      <van-field
        v-model="saleDateName"
        name="saleDate"
        :label="label.saleDate + '：'"
        :placeholder="'请输入' + label.saleDate"
        @click="chooseDate('saleDate')"
        readonly
      />
      <van-field
        v-model="formInfo.description"
        name="description"
        :label="label.description + '：'"
        :placeholder="'请输入' + label.description"
        :maxlength="65535"
      />
      <van-field
        v-model="formInfo.payWay"
        name="payWay"
        :label="label.payWay + '：'"
        :placeholder="'请输入' + label.payWay"
        :maxlength="128"
      />
      <van-field
        v-model="formInfo.saleCount"
        name="saleCount"
        :label="label.saleCount + '：'"
        :placeholder="'请输入' + label.saleCount"
        :maxlength="10"
      />
    </van-cell-group>
  </van-form>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { showFailToast } from 'vant';
import { getShopOrderDetail } from '@/api/finance/shopOrder/shopOrderTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import { label } from './shopOrderDetailTs';

let route = useRoute();
const info = ref<any>({
  title: route?.meta?.title || '商店订单表',
  leftPath: '/finance/shopOrder',
});

let formInfo = ref<any>({});

let popInfo = ref<Info>({ showFlag: false });

let isValidName = ref<string>('');

let isValidInfo = ref<Info>({
  label: 'isValid',
  labelName: label.isValid,
  customFieldName: {
    text: 'typeName',
    value: 'typeCode',
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

const getListName = (list: any[], value: any, code: string, name: string): string => {
  if (!list?.length) {
    return '';
  }
  let listName = '';
  list.forEach((item) => {
    if (item[code] == value) {
      listName = item[name];
    }
  });
  return listName;
};

const getDictInfoList = (res: any): void => {
  if (res?.code == '200') {
    isValidInfo.value.list = res.data.filter(
      (item: { belongTo: string }) => item.belongTo == 'is_valid',
    );
    isValidName.value = getListName(
      isValidInfo.value.list || [],
      formInfo.value.isValid,
      'typeCode',
      'typeName',
    );
  } else {
    showFailToast(res?.message || '查询失败，请联系管理员!');
  }
};

let saleDateName = ref<string>('');
let saleDateInfo = ref<any>({
  label: 'saleDate',
  labelName: '销售日期',
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
      chooseDateInfo.value = saleDateInfo.value;
      break;
  }
};

const initInfoDate = (infoDate: Dayjs, type: string): void => {
  if (infoDate) {
    switch (type) {
      case 'saleDate':
        saleDateName.value = dayjs(infoDate).format('YYYY-MM-DD');
        saleDateInfo.value.selectValue = infoDate;
        break;
    }
  }
};

const init = (): void => {
  let id: any = route?.query?.id;
  if (id) {
    Promise.all([getShopOrderDetail(id || '-1'), getDictList('is_valid')])
      .then((res: any) => {
        if (res[0].code == '200') {
          formInfo.value = res[0].data;
          formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
          initInfoDate(formInfo.value.saleDate, 'saleDate');
        } else {
          showFailToast(res?.message || '查询详情失败，请联系管理员!');
        }
        getDictInfoList(res[1]);
      })
      .catch(() => {
        showFailToast('系统问题，请联系管理员！');
      });
  } else {
    getDictList('is_valid').then((res: any) => {
      getDictInfoList(res);
    });
    formInfo.value = {
      saleDate: dayjs(),
    };
    initInfoDate(formInfo.value.saleDate, 'saleDate');
  }
};

init();
</script>
<style lang="scss" scoped>
.subButton {
  margin: 16px;
}
</style>
