<template>
    <van-row gutter="20">
        <div class="mainGrid">
            <div class="div1">
                <bar-chart height="100%" width="100%" title="日消费" :data="dayData" :config="dayConfig">
                </bar-chart>
            </div>
        </div>
        <div class="mainGrid">
            <div class="div2">
                <bar-chart height="100%" width="100%" title="月消费" :data="monthData" :config="monthConfig">
                </bar-chart>
            </div>
        </div>
    </van-row>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { barItem } from "./common";
import { showFailToast } from 'vant';
import {
    getDayExpense,
    getMonthExpense,
} from "@/api/finance/financeAnalysis";
import barChart from "../chart/barChart.vue";
import dayjs, { Dayjs } from "dayjs";

interface Props {
    activeTab: string | number;
}
let props = defineProps<Props>();

let dayConfig = ref<barItem>({
    xAxis: [],
    series: [],
    xTile: "天数",
    yTitle: "金钱(元)",
    yNameGap: 30,
    tooltip: {},
    legend: [],
    color: "#aa55ff",
});

let monthData = ref<any>([]);

let monthConfig = ref<barItem>({
    xAxis: [],
    series: [],
    xTile: "月份",
    yTitle: "金钱(元)",
    yNameGap: 30,
    tooltip: {},
    legend: [],
    color: '#5555ff',
});

let dayData = ref<any>([]);

function getDayExpenseInfo(userId: number, dateStr: string) {
    getDayExpense(userId, dateStr).then(
        (res: { code: string; data: any[]; message: any }) => {
            if (res.code == "200") {
                if (res.data) {
                    let series = [] as any;
                    let xAxis = [] as any;
                    res.data.forEach((item) => {
                        series.push(item.amount);
                        xAxis.push(item.infoDate);
                    });
                    dayConfig.value = {
                        xAxis: xAxis,
                        series: series,
                        xTile: "天数",
                        yTitle: "金钱(元)",
                        yNameGap: 50,
                        tooltip: {
                            trigger: "axis",
                            axisPointer: {
                                type: "shadow",
                            },
                            formatter(param: any) {
                                let tip = "";
                                let unit = "元";
                                let name = "花费";
                                tip += `<p style="margin: 0">${param[0].axisValue}日</p>`;
                                param.forEach(
                                    (element: {
                                        axisValue: any;
                                        marker: any;
                                        value: any;
                                        seriesName: any;
                                    }) => {
                                        tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.00}${unit}</p>`;
                                    }
                                );
                                return tip;
                            },
                        },
                        color: "#aa55ff",
                    };
                    dayData.value = series;
                }
            } else {
                showFailToast((res && res.message) || "查询列表失败！");
            }
        }
    );
}

function getMonthExpenseInfo(userId: number, dateStr: string) {
    getMonthExpense(userId, dateStr).then(
        (res: { code: string; data: any[]; message: any }) => {
            if (res.code == "200") {
                if (res.data) {
                    let series = [] as any;
                    let xAxis = [] as any;
                    res.data.forEach((item) => {
                        series.push(item.amount);
                        xAxis.push(item.infoDate);
                    });
                    monthConfig.value = {
                        xAxis: xAxis,
                        series: series,
                        yTitle: "金钱(元)",
                        xTile: "月份",
                        yNameGap: 50,
                        tooltip: {
                            trigger: "axis",
                            axisPointer: {
                                type: "shadow",
                            },
                            formatter(param: any) {
                                let tip = "";
                                let unit = "元";
                                let name = "花费";
                                tip += `<p style="margin: 0">${param[0].axisValue}月</p>`;
                                param.forEach(
                                    (element: {
                                        axisValue: any;
                                        marker: any;
                                        value: any;
                                        seriesName: any;
                                    }) => {
                                        tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.00}${unit}</p>`;
                                    }
                                );
                                return tip;
                            },
                        },
                        color: "#5555ff",
                    };
                    monthData.value = series;
                    console.log(`monthData.value`, monthData.value)
                }
            } else {
                showFailToast((res && res.message) || "查询列表失败！");
            }
        }
    );
}

const dateFormatter = "YYYY-MM";
let searchDateTime = ref<Dayjs>(dayjs());

const init = () => {
    let dateStr = searchDateTime.value.format(dateFormatter);
    getDayExpenseInfo(0, dateStr);
    getMonthExpenseInfo(0, dateStr);
};

watch(
    () => props.activeTab,
    () => {
        if (props.activeTab === '3') {
            init();
        }
    }
);
</script>

<style lang="scss" scoped>
.mainGrid {
    width: 100%;
    height: 400px;

    .div1 {
        display: inline-block;
        /*转为行内块儿 */
        width: 96%;
        height: 100%;
        text-align: center;
        line-height: 100%;
        color: blue;
        background-color: white;
        margin-left: 10px;
        margin-right: 10px;
        border-radius: 5px;
        /*--调节圆周程度*/
    }

    .div2 {
        display: inline-block;
        /*转为行内块儿 */
        width: 92%;
        height: 100%;
        text-align: center;
        line-height: 100%;
        color: aliceblue;
        background-color: white;
        margin-right: 10px;
        border-radius: 5px;
        /*--调节圆周程度*/
    }
}
</style>