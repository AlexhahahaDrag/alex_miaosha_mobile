<template>
    <van-grid :column-num="2">
        <van-grid-item :center="false">
            总金额:{{ sum }}
        </van-grid-item>
    </van-grid>
    <van-grid :column-num="2">
        <van-grid-item v-for="item in balanceList" :key="item.typeCode"
            :default="item.typeName + ':' + (item.amount ? item.amount : 0)" :center="false">
            {{ item.typeName }}:{{ item.amount }}
            <!-- <van-card :price="item.amount" :title="item.typeName" /> -->
        </van-grid-item>
    </van-grid>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { getBalance, } from '@/api/finance/financeAnalysis';
import { FinanceDetail } from "./common";
import { showNotify } from 'vant';
import * as math from 'mathjs';

interface Props {
    activeTab: number | string;
    dateStr: string,
    belongTo?: number | null,
}

let props = defineProps<Props>();

let balanceList = ref<FinanceDetail | any>([]);
let sum = ref<any>(0);

const getBalanceInfo = (userId: number | null, dateStr: string) => {
    getBalance(userId, dateStr).then(
        (res: { code: string; data: FinanceDetail[]; message: any }) => {
            if (res.code == "200") {
                sum.value = 0;
                balanceList.value = res.data;
                if (res.data && res.data.length) {
                    res.data.forEach(
                        (item) =>
                            sum.value = math.add(
                                sum.value,
                                math.bignumber(item.amount ? item.amount : 0)
                            )
                    );
                }
            } else {
                showNotify({ type: 'danger', message: (res && res.message) || "查询列表失败！" });
            }
        }
    );
}

const init = (dateStr: string, belongTo: number | null) => {
    getBalanceInfo(belongTo, dateStr);
};

watch(
    () => [props.activeTab, props.dateStr, props.belongTo],
    () => {
        if (props.activeTab === '1') {
            init(props.dateStr, props.belongTo || null);
        }
    },
    { immediate: true },
);
</script>