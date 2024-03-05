<template>
    <van-grid :column-num="2">
        <!-- <div class="box-content-show">
            <div class="show-left">
                <div class="content-title">
                    <img src="@/assets/one.svg" />
                    <span>日供水量</span>
                </div>
                <div class="content-value">
                    <span>
                        {{
                            curSupplyWater.thisValue == null
                            ? '--'
                            : curSupplyWater.thisValue
                        }}
                    </span>
                    万m³
                </div>
                <div class="content-percent">
                    <div>
                        <span>同比</span>
                        <span>
                            {{
                                curSupplyWater.yearOnYear == null
                                ? '--'
                                : curSupplyWater.yearOnYear + '&nbsp;%'
                            }}
                        </span>
                        <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.yearOnYear) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" />
                    </div>
                    <div>
                        <span>环比</span>
                        <span>
                            {{
                                curSupplyWater.chain == null
                                ? '--'
                                : curSupplyWater.chain + '&nbsp;%'
                            }}
                        </span>
                        <img v-if="judgeUpOrDown(curSupplyWater.chain) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(curSupplyWater.chain) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" />
                    </div>
                </div>
            </div>
            <div class="show-right">
                <div class="content-title">
                    <img src="@/assets/one.svg" />
                    <span>本年累计水量</span>
                </div>
                <div class="content-value">
                    <span>
                        {{
                            sumSupplyWater.thisValue == null
                            ? '--'
                            : sumSupplyWater.thisValue
                        }}
                    </span>
                    万m³
                </div>
                <div class="content-percent">
                    <div>
                        <span>同比</span>
                        <span>
                            {{
                                sumSupplyWater.yearOnYear == null
                                ? '--'
                                : sumSupplyWater.yearOnYear + '&nbsp;%'
                            }}
                        </span>
                        <img v-if="judgeUpOrDown(sumSupplyWater.yearOnYear) == 1" src="@/assets/up.svg" />
                        <img v-if="judgeUpOrDown(sumSupplyWater.yearOnYear) == -1" src="@/assets/down.svg"
                            style="transform: rotate(180deg)" />
                    </div>
                </div>
            </div>
        </div> -->
    </van-grid>
<!--    <van-grid :column-num="2">-->
<!--        <van-grid-item v-for="item in balanceList" :key="item.typeCode"-->
<!--            :default="item.typeName + ':' + (item.amount ? item.amount : 0)" :center="false">-->
<!--            {{ item.typeName }}:{{ item.amount }}-->
<!--        </van-grid-item>-->
<!--    </van-grid>-->
</template>

<script lang="ts" setup>
// import { getBalance, } from '@/api/finance/financeAnalysis';
// import { FinanceDetail } from "./common";
// // import { showNotify } from 'vant';
// // import * as math from 'mathjs';
//
// interface Props {
//     activeTab: number | string;
//     dateStr: string,
//     belongTo?: number | null,
// }
//
// let props = defineProps<Props>();
//
// let balanceList = ref<FinanceDetail | any>([]);
// let sum = ref<any>(0);
//
// const getBalanceInfo = (userId: number | null, dateStr: string) => {
//     // getBalance(userId, dateStr).then(
//     //     (res: { code: string; data: FinanceDetail[]; message: any }) => {
//     //         if (res.code == "200") {
//     //             sum.value = 0;
//     //             balanceList.value = res.data;
//     //             if (res.data && res.data.length) {
//     //                 res.data.forEach(
//     //                     (item) =>
//     //                         sum.value = math.add(
//     //                             sum.value,
//     //                             math.bignumber(item.amount ? item.amount : 0)
//     //                         )
//     //                 );
//     //             }
//     //         } else {
//     //             showNotify({ type: 'danger', message: (res && res.message) || "查询列表失败！" });
//     //         }
//     //     }
//     // );
// }
//
// const init = (dateStr: string, belongTo: number | null) => {
//     getBalanceInfo(belongTo, dateStr);
// };
//
// watch(
//     () => [props.activeTab, props.dateStr, props.belongTo],
//     () => {
//         if (props.activeTab === '1') {
//             init(props.dateStr, props.belongTo || null);
//         }
//     },
//     { immediate: true },
// );
</script>