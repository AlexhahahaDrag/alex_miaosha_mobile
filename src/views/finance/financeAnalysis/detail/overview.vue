<template>
    <h1>总览</h1>
    <van-row>
        <van-col span="8">span: 8</van-col>
        <van-col span="8">span: 8</van-col>
        <van-col span="8">span: 8</van-col>
    </van-row>
    <van-row>
        <van-col span="16">span: 16</van-col>
        <van-col span="16">span: 16</van-col>
    </van-row>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { getBalance, } from '@/api/finance/financeAnalysis';
import { FinanceDetail } from "./common";
import { showNotify } from 'vant';
import * as math from 'mathjs';

interface Props {
    activeTab: Number;
    dateStr: string,
    belongTo: number | null,
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
                        (sum.value = math.add(
                            sum.value,
                            math.bignumber(item.amount ? item.amount : 0)
                        ))
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
    () => [props.activeTab],
    () => {
        console.log(`overviews`)
        if (props.activeTab === 1 && props.dateStr) {
            init(props.dateStr, props.belongTo || null);
        }
    },
    { immediate: true },
);
</script>