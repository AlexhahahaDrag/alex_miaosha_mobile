<template>
  <NavBar :info="info"></NavBar>
  <div class="header-container">
    <div class="title">丁丁尾单</div>
  </div>
  <div class="container">
    <div class="content">
      <van-cell
        v-if="saleOrderInfo.shopOrderDetailVoList?.length"
        v-for="item in saleOrderInfo.shopOrderDetailVoList"
        :key="item?.id"
        center
      >
        <template #title>
          <div class="text-left">
            <span class="custom-title">{{ item.shopName }}</span>
            <van-tag type="primary">{{ item.oldShopCode }}</van-tag>
          </div>
        </template>
        <template #right-icon>
          <div class="text-right">
            <van-stepper
              v-model="item.saleNum"
              @change="getSumAmount"
              min="1"
              theme="round"
              button-size="20px"
            ></van-stepper>
          </div>
        </template>
        <template #label>
          <div class="amount-cell-info">
            ￥{{ commonUtils.formatAmount(item?.saleAmount || 0, 2, '') }}
          </div>
        </template>
      </van-cell>
    </div>
    <div class="footer-container">
      <div class="footer">
        <div class="amount-info">
          <van-field
            v-model="saleOrderInfo.saleAmount"
            type="number"
            @change="changeSumAmount"
            label="￥"
            placeholder="请输入金额"
          ></van-field>
          <div class="old-info" v-if="showOldAmount">
            ￥{{ commonUtils.formatAmount(sumAmount || 0, 2, '') }}
          </div>
        </div>
        <van-field
          style="width: 20%"
          v-model="payWayName"
          name="payWay"
          placeholder="请输入支付方式"
          @click="choose('payWay')"
          readonly
        />
        <div class="checkout-button">
          <van-button
            @click="submitOrderInfo"
            style="width: 100%"
            :loading="submitLoading"
            round
            type="danger"
            loading-text="提交中..."
          >
            提交订单
          </van-button>
        </div>
      </div>
    </div>
  </div>
  <SelectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></SelectPop>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import commonUtils from '@/utils/common/index';
import { getShopList } from '@/api/finance/shopStock/shopStockTs';
import { submitOrder } from '@/api/finance/shopOrder/shopOrderTs';
import { ShopStockInfo } from '@/views/finance/shopStock/shopStockTs';
import { SaleOrderInfo } from '@/views/finance/saleTicket/saleTicketTs';
import { getShopCartList } from '@/api/finance/shopCart/shopCartTs';
import dayjs from 'dayjs';
import { ShopCartInfo } from '@/views/finance/shoppingCart/shoppingCartTs';
import { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import CommonUtils from '@/utils/common/index';

let route = useRoute();
let router = useRouter();

const info = ref<any>({
  title: route?.meta?.title || '订单提交',
});

let sumAmount = ref<number>(0);
let submitLoading = ref<boolean>(false);
let showOldAmount = ref<boolean>(false);
let saleOrderInfo = ref<SaleOrderInfo>({
  saleAmount: 0,
  payWay: 'wx',
});
let payWayName = ref<string>('');
let popInfo = ref<Info>({ showFlag: false });
let payWayInfo = ref<Info>({
  label: 'payWay',
  labelName: '支付方式',
  customFieldName: {
    text: 'typeName',
    value: 'typeCode',
  },
  rule: [
    {
      required: true,
      message: '不能为空！',
    },
  ],
  selectValue: [saleOrderInfo.value.payWay],
});

const choose = (type: string) => {
  switch (type) {
    case 'payWay':
      popInfo.value = payWayInfo.value;
      break;
  }
  popInfo.value.showFlag = true;
};

const cancelInfo = () => {
  popInfo.value.showFlag = false;
};

const selectInfo = (type: string, value: any, name: string) => {
  popInfo.value.showFlag = false;
  switch (type) {
    case 'payWay':
      saleOrderInfo.value.payWay = value;
      payWayName.value = name;
      break;
  }
};
const submitOrderInfo = () => {
  submitLoading.value = true;
  // todo添加结果类型
  submitOrder(saleOrderInfo.value)
    .then((res: any) => {
      if (res?.code == '200') {
        router.push({ name: 'shopProduct' });
      } else {
        showFailToast(res?.message || '提交订单失败，请联系管理员！');
      }
    })
    .catch((error) => {
      showFailToast(error?.message || '系统异常，请联系管理员！');
    })
    .finally(() => {
      submitLoading.value = false;
    });
};

const getSumAmount = (): void => {
  if (!saleOrderInfo.value?.shopOrderDetailVoList?.length) {
    sumAmount.value = 0;
    return;
  }
  sumAmount.value = 0;
  saleOrderInfo.value.shopOrderDetailVoList.forEach((item: any) => {
    sumAmount.value = commonUtils.plus(
      sumAmount.value,
      commonUtils.multiply(item.saleAmount, item.saleNum),
    );
  });
  saleOrderInfo.value.saleAmount = sumAmount.value;
  showOldAmount.value = false;
};

const changeSumAmount = () => {
  showOldAmount.value = (saleOrderInfo.value.saleAmount || 0) < sumAmount.value;
};

const getShopListInfo = async (ids: string) => {
  await getShopList(ids).then((res: any) => {
    if (res?.code == '200') {
      if (res?.data?.length) {
        saleOrderInfo.value.shopOrderDetailVoList = res.data.map((item: ShopStockInfo) => ({
          shopName: item.shopName,
          shopCode: item.shopCode,
          oldShopCode: item.oldShopCode,
          saleAmount: item.saleAmount,
          saleDate: dayjs(),
          saleNum: 1,
          shopStockId: item.id,
        }));
      } else {
        showFailToast('获取订单失败，请联系管理员！');
      }
    }
  });
};

const getShopCartListInfo = async (ids: string) => {
  await getShopCartList(ids).then((res: any) => {
    if (res?.code == '200') {
      if (res?.data?.length) {
        saleOrderInfo.value.shopOrderDetailVoList = res.data.map((item: ShopCartInfo) => ({
          shopName: item.shopName,
          shopCode: item.shopCode,
          oldShopCode: item.oldShopCode,
          saleAmount: item.saleAmount,
          saleDate: dayjs(),
          saleNum: item.saleNum,
          shopStockId: item.shopId,
          shopCartId: item.id,
        }));
      } else {
        showFailToast('获取订单失败，请联系管理员！');
      }
    }
  });
};

const getDictInfoList = (res: any) => {
  if (res?.code == '200') {
    payWayInfo.value.list = res.data.filter(
      (item: { belongTo: string }) => item.belongTo == 'shop_pay_way',
    );
    payWayName.value = CommonUtils.getListName(
      payWayInfo.value.list || [],
      saleOrderInfo.value.payWay,
      'typeCode',
      'typeName',
    );
  } else {
    showFailToast(res?.message || '查询失败，请联系管理员!');
  }
};

onMounted(async () => {
  let params: any = route.query;
  getDictList('shop_pay_way').then((res: any) => {
    if (res?.code == '200') {
      getDictInfoList(res);
    }
  });
  switch (params.type) {
    case 'shopCart':
      await getShopCartListInfo(params.ids);
      break;
    case 'shopProduct':
      await getShopListInfo(params.ids);
      break;
  }
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

    .amount-cell-info {
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
  width: 30%;

  .van-field {
    --van-field-label-width: 5%;
    --van-field-label-color: red;
    --van-field-input-text-color: red;

    .van-field__control {
      font-size: 25px;
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
  width: 30%;
}
</style>
