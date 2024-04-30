<template>
  <van-grid :column-num="2">
    <div class="box-content-show">
      <div class="show-left">
        <BoardData :info="amountDataInfo"></BoardData>
      </div>
      <div class="show-right">
        <BoardData :info="numDataInfo"></BoardData>
      </div>
    </div>
  </van-grid>
</template>

<script lang="ts" setup>
import { getChainAndYear } from '@/api/finance/shopFinanceAnalysis';
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

let chainAndYear = ref<any>({});

let amountDataInfo = ref<Info>({});
let numDataInfo = ref<Info>({});

const getChainAndYearInfo = (dateStr: string) => {
  getChainAndYear(dateStr).then(
    (res: { code: string; data: ShopFinanceChainYear; message: any }) => {
      if (res.code == '200') {
        chainAndYear.value = res.data;
        amountDataInfo.value = {
          title: '月销售额',
          value:
            res.data?.saleAmount !== null
              ? commonUtils.formatAmount(res.data.saleAmount || 0, 2, '')
              : '--',
          year: res.data.saleAmountYear,
          chain: res.data.saleAmountChain,
          icon: 'saleAmount',
          unit: '元',
          showChain: true,
          showYear: true,
        };
        numDataInfo.value = {
          title: '月销售量',
          value:
            res.data?.saleNum !== null
              ? commonUtils.formatAmount(res.data.saleNum || 0, 2, '')
              : '--',
          year: res.data.saleNumYear,
          chain: res.data.saleNumChain,
          icon: 'saleNum',
          unit: '件',
          showChain: true,
          showYear: true,
        };
      } else {
        showNotify({ type: 'danger', message: (res && res.message) || '查询列表失败！' });
      }
    },
  );
};

const init = (dateStr: string) => {
  getChainAndYearInfo(dateStr);
};

watch(
  () => [props.activeTab, props.dateStr, props.belongTo],
  () => {
    if (props.activeTab === '1') {
      init(props.dateStr);
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
  .show-left {
    margin-top: 10px;
    width: 48%;
    background: #3b85f7;
    border-radius: 5%;
  }
  .show-right {
    margin-top: 10px;
    width: 48%;
    background: #3b85f7;
    border-radius: 5%;
  }
}
</style>
