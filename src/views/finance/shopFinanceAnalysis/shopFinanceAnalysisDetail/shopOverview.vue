<template>
    <van-grid :column-num="2">
        <div class="box-content-show">
            <div class="show-left">
                <div class="content-title">
                    <span>月销售额</span>
                </div>
                <div class="content-value">
                    <span>
                        {{ chainAndYear.saleAmount || '--' }}
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
import { getChainAndYear, } from "@/api/finance/shopFinanceAnalysis";
import { showNotify } from 'vant';
import { ShopFinanceChainYear } from './common';

interface Props {
    activeTab: number | string;
    dateStr: string,
    belongTo?: number | null,
}

let props = defineProps<Props>();

let chainAndYear = ref<any>({});

const getChainAndYearInfo = (dateStr: string) => {
    getChainAndYear(dateStr).then(
        (res: { code: string; data: ShopFinanceChainYear; message: any }) => {
            console.log(`res:`, res);
            if (res.code == "200") {
                chainAndYear.value = res.data;
            } else {
                showNotify({ type: 'danger', message: (res && res.message) || "查询列表失败！" });
            }
        }
    );
}

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