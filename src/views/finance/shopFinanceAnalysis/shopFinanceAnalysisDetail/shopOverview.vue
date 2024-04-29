<template>
  <van-grid :column-num="2">
    <div class="box-content-show">
      <div class="show-left">
        <div class="content-title">
          <SvgIcon name="saleAmount" class="content-svg"></SvgIcon>
          <div class="content-title-desc">
            <span>月销售额</span>
          </div>
        </div>

        <div class="content-value">
          <span>
            {{ commonUtils.formatAmount(chainAndYear.saleAmount, 2, '') }}
          </span>
          元
        </div>
        <div class="content-percent">
          <div>
            <span>同比</span>
            <span>
              {{ chainAndYear.saleAmountYear || '--' }}
            </span>
            <!-- <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" /> -->
          </div>
          <div>
            <span>环比</span>
            <span>
              {{ chainAndYear.saleAmountChain || '--' }}
            </span>
            <!-- <img v-if="judgeUpOrDown(curSupplyWater.chain) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.chain) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" /> -->
          </div>
        </div>
      </div>
      <div class="show-right">
        <div class="content-title">
          <span>月销售数量</span>
        </div>
        <div class="content-value">
          <span>
            {{ chainAndYear.saleNum || '--' }}
          </span>
          件
        </div>
        <div class="content-percent">
          <div>
            <span>同比</span>
            <span>
              {{ chainAndYear.saleNumYear || '--' }}
            </span>
            <!-- <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" /> -->
          </div>
          <div>
            <span>环比</span>
            <span>
              {{ chainAndYear.saleNumChain || '--' }}
            </span>
            <!-- <img v-if="judgeUpOrDown(curSupplyWater.chain) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.chain) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" /> -->
          </div>
        </div>
      </div>
    </div>
  </van-grid>
  <!--    <van-grid :column-num="2">-->
  <!--        <van-grid-item v-for="item in balanceList" :key="item.typeCode"-->
  <!--            :default="item.typeName + ':' + (item.amount ? item.amount : 0)" :center="false">-->
  <!--            {{ item.typeName }}:{{ item.amount }}-->
  <!--        </van-grid-item>-->
  <!--    </van-grid>-->
</template>

<script lang="ts" setup>
import { getChainAndYear } from '@/api/finance/shopFinanceAnalysis';
import { showNotify } from 'vant';
import { ShopFinanceChainYear } from './common';
import commonUtils from '@/utils/common/index';

interface Props {
  activeTab: number | string;
  dateStr: string;
  belongTo?: number | null;
}

let props = defineProps<Props>();

let chainAndYear = ref<any>({});

const getChainAndYearInfo = (dateStr: string) => {
  getChainAndYear(dateStr).then(
    (res: { code: string; data: ShopFinanceChainYear; message: any }) => {
      console.log(`dataaaaaaaaaaaaaaaa:`, res.data);
      if (res.code == '200') {
        chainAndYear.value = res.data;
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

  .show-left {
    width: 40%;
    background: #00e5ee;
    border-radius: 8%;
    padding: 10px 0 0 10px;

    .content-title {
      display: flex;
      align-items: center;

      .content-svg {
        width: 2em;
        height: 2em;
        font-size: 18px;
        cursor: pointer;
      }

      .content-title-desc {
        padding: 5px 0px 5px 5px;
        vertical-align: bottom;

        span {
          font-size: 15px;
          font-weight: 400;
          color: #ffffff;
          bottom: 0;
        }
      }
    }

    .content-value {
      margin-top: 5px;
      color: #ffffff;

      span {
        font-size: 25px;
      }
    }

    .content-percent {
      color: #ffffff;
      span {
        font-size: 10px;
      }
    }
  }
}
</style>
