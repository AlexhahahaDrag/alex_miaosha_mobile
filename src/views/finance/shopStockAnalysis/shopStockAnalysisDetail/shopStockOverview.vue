<template>
  <van-grid :column-num="2">
    <div class="box-content-show">
      <div
        :class="index % 2 === 0 ? 'show-left' : 'show-right'"
        v-for="(item, index) in saleList"
        :key="index"
      >
        <BoardData :info="item"></BoardData>
      </div>
    </div>
    <!-- <div class="box-content-show">
      <div
        :class="index % 2 === 0 ? 'show-left' : 'show-right'"
        v-for="(item, index) in benefitList"
        :key="index"
      >
        <BoardData :info="item"></BoardData>
      </div>
    </div> -->
  </van-grid>
</template>

<script lang="ts" setup>
import { getAllStock } from '@/api/finance/shopStockAnalysis';
import { showNotify } from 'vant';
import { ShopFinanceChainYear } from './common';
import commonUtils from '@/utils/common/index';
import { Info } from '@/views/common/boardData/config';

interface Props {
  activeTab: number | string;
  dateStr: string;
  belongTo?: number | null;
}

let props = defineProps<Props>();

let stockList = ref<Info[]>([]);

const getAllStockInfo = () => {
  getAllStock().then((res: { code: string; data: ShopFinanceChainYear; message: any }) => {
    if (res.code == '200') {
      let arr: Info[] = [];
      arr.push({
        title: '库存金额',
        value:
          res.data?.saleAmount !== null
            ? commonUtils.formatAmount(res.data.saleAmount || 0, 2, '')
            : '--',
        year: res.data.saleAmountYear,
        chain: res.data.saleAmountChain,
        icon: 'saleAmount',
        unit: '元',
        showChain: false,
        showYear: false,
        color: '#55aaff',
      });
      arr.push({
        title: '库存数量',
        value:
          res.data?.saleNum !== null
            ? commonUtils.formatAmount(res.data.saleNum || 0, 2, '')
            : '--',
        year: res.data.saleNumYear,
        chain: res.data.saleNumChain,
        icon: 'saleNum',
        unit: '件',
        showChain: false,
        showYear: false,
        color: '#55aaff',
      });
      stockList.value = arr;
    } else {
      showNotify({ type: 'danger', message: (res && res.message) || '查询列表失败！' });
    }
  });
};

let benefitList = ref<Info[]>([]);

const init = () => {
  getAllStockInfo();
};

watch(
  () => [props.activeTab, props.dateStr, props.belongTo],
  () => {
    if (props.activeTab === '1') {
      init();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.box-content-show {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 10px;
  .show-left {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .show-right {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-left: 10px;
  }
}
</style>
