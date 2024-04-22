<template>
  <NavBar :info="info"></NavBar>
  <van-form @submit="onSubmit" :rules="rulesRef" required="auto">
    <van-cell-group>
      <van-field
        v-model="formInfo.shopName"
        name="shopName"
        :label="label.shopName + '：'"
        :placeholder="'请输入' + label.shopName"
        :rules="rulesRef.shopName"
        :maxlength="255"
      />
      <van-field
        v-model="formInfo.oldShopCode"
        name="oldShopCode"
        :label="label.oldShopCode + '：'"
        :maxlength="255"
      />
      <van-field
        v-model="formInfo.shopCode"
        name="shopCode"
        :label="label.shopCode + '：'"
        :maxlength="255"
        :readonly="true"
      />
      <van-field
        v-model="formInfo.costAmount"
        name="costAmount"
        :label="label.costAmount + '：'"
        :placeholder="'请输入' + label.costAmount"
        :rules="rulesRef.costAmount"
        :maxlength="10"
      />
      <van-field
        v-model="formInfo.saleAmount"
        name="saleAmount"
        :label="label.saleAmount + '：'"
        :placeholder="'请输入' + label.saleAmount"
        :rules="rulesRef.saleAmount"
        :maxlength="10"
      />
      <van-field
        v-model="isValidName"
        name="isValid"
        :label="label.isValid + '：'"
        :placeholder="'请输入' + label.isValid"
        :rules="rulesRef.isValid"
        @click="choose('isValid')"
        readonly
      />
      <van-field
        v-model="saleDateName"
        name="saleDate"
        :label="label.saleDate + '：'"
        :placeholder="'请输入' + label.saleDate"
        :rules="rulesRef.saleDate"
        @click="chooseDate('saleDate')"
        readonly
      />
      <van-field
        v-model="categoryName"
        name="category"
        :label="label.category + '：'"
        :placeholder="'请输入' + label.category"
        :rules="rulesRef.category"
        @click="choose('category')"
        readonly
      />
      <van-field
        v-model="purchasePlaceName"
        name="purchasePlace"
        :label="label.purchasePlace + '：'"
        :placeholder="'请输入' + label.purchasePlace"
        :rules="rulesRef.purchasePlace"
        @click="choose('purchasePlace')"
        readonly
      />
      <van-field
        v-model="formInfo.saleNum"
        name="saleNum"
        :label="label.saleNum + '：'"
        :placeholder="'请输入' + label.saleNum"
        :rules="rulesRef.saleNum"
        :maxlength="10"
      />
      <van-field v-model="formInfo.size" name="size" :label="label.size + '：'"></van-field>
      <van-field v-model="formInfo.color" name="color" :label="label.color + '：'"></van-field>
      <van-field v-model="formInfo.style" name="style" :label="label.style + '：'"></van-field>
      <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop>
      <datePop
        :info="chooseDateInfo"
        @selectInfo="selectDateInfo"
        @cancelInfo="cancelDateInfo"
      ></datePop>
    </van-cell-group>
    <div class="subButton">
      <van-button round block type="primary" native-type="submit">提交</van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { addOrEditShopStock, getShopStockDetail } from '@/api/finance/shopStock/shopStockTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import { label, rulesRef } from './shopStockDetailTs';
import { ShopStockInfo } from '../shopStockTs';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
  title: route?.meta?.title || '商店库存表',
  leftPath: '/finance/shopStock',
});

let formInfo = ref<ShopStockInfo>({});

let popInfo = ref<Info>({ showFlag: false });

let isValidName = ref<string>('');

let isValidInfo = ref<Info>({
  label: 'isValid',
  labelName: label.isValid,
  rule: rulesRef.isValid,
  customFieldName: {
    text: 'typeName',
    value: 'typeCode',
  },
  selectValue: formInfo.value.isValid,
});
let categoryName = ref<string>('');

let categoryInfo = ref<Info>({
  label: 'category',
  labelName: label.category,
  rule: rulesRef.category,
  customFieldName: {
    text: 'typeName',
    value: 'typeCode',
  },
  selectValue: formInfo.value.category,
});
let purchasePlaceName = ref<string>('');

let purchasePlaceInfo = ref<Info>({
  label: 'purchasePlace',
  labelName: label.purchasePlace,
  rule: rulesRef.purchasePlace,
  customFieldName: {
    text: 'typeName',
    value: 'typeCode',
  },
  selectValue: formInfo.value.purchasePlace,
});

const choose = (type: string) => {
  switch (type) {
    case 'isValid':
      popInfo.value = isValidInfo.value;
      break;
    case 'category':
      popInfo.value = categoryInfo.value;
      break;
    case 'purchasePlace':
      popInfo.value = purchasePlaceInfo.value;
      break;
  }
  popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
  popInfo.value.showFlag = false;
  switch (type) {
    case 'isValid':
      formInfo.value.isValid = value;
      isValidName.value = name;
      break;
    case 'category':
      formInfo.value.category = value;
      categoryName.value = name;
      break;
    case 'purchasePlace':
      formInfo.value.purchasePlace = value;
      purchasePlaceName.value = name;
      break;
  }
};

const cancelInfo = () => {
  popInfo.value.showFlag = false;
};

const getListName = (list: any[], value: any, code: string, name: string) => {
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

function getDictInfoList(res: any) {
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
    categoryInfo.value.list = res.data.filter(
      (item: { belongTo: string }) => item.belongTo == 'shop_category',
    );
    categoryName.value = getListName(
      categoryInfo.value.list || [],
      formInfo.value.category,
      'typeCode',
      'typeName',
    );
    purchasePlaceInfo.value.list = res.data.filter(
      (item: { belongTo: string }) => item.belongTo == 'stock_place',
    );
    purchasePlaceName.value = getListName(
      purchasePlaceInfo.value.list || [],
      formInfo.value.purchasePlace,
      'typeCode',
      'typeName',
    );
  } else {
    showFailToast(res?.message || '查询失败，请联系管理员!');
  }
}

let saleDateName = ref<string>('');
let saleDateInfo = ref<any>({
  label: 'saleDate',
  labelName: '进货日期',
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

const chooseDate = (type: string) => {
  chooseDateInfo.value.showFlag = true;
  switch (type) {
    case 'saleDate':
      chooseDateInfo.value = saleDateInfo.value;
      break;
  }
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string) => {
  switch (type) {
    case 'saleDate':
      formInfo.value.saleDate = date;
      saleDateName.value = dateName;
      break;
  }
  chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
  chooseDateInfo.value.showFlag = false;
};

const initInfoDate = (infoDate: Dayjs, type: string) => {
  if (infoDate) {
    switch (type) {
      case 'saleDate':
        saleDateName.value = dayjs(infoDate).format('YYYY年MM月DD');
        saleDateInfo.value.selectValue = infoDate;
        break;
    }
  }
};

const onSubmit = () => {
  let method = 'post';
  if (formInfo.value.id) {
    method = 'put';
  }
  addOrEditShopStock(method, formInfo.value).then((res: any) => {
    if (res?.code == '200') {
      showSuccessToast(res?.message || '保存成功!');
      router.push({ path: '/finance/shopStock' });
    } else {
      showFailToast(res?.message || '保存失败，请联系管理员!');
    }
  });
};

function init() {
  let id: any = route?.query?.id;
  if (id) {
    Promise.all([getShopStockDetail(id || '-1'), getDictList('is_valid,shop_category,stock_place')])
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
    getDictList('is_valid,shop_category,stock_place').then((res: any) => {
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
<style lang="scss" scoped>
.subButton {
  margin: 16px;
}
</style>
