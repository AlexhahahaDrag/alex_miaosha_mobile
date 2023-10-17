<template>
    <van-row gutter="20">
        <div class="mainGrid">
            <div class="div2">
                <pieChart title="当月收入分析" height="100%" width="100%" :data="pieIncomeData" :tooltip="tooltip">
                </pieChart>
            </div>
        </div>
        <div class="mainGrid">
            <div class="div2">
                <pieChart title="当月支出分析" height="100%" width="100%" :data="pieExpenseData" :tooltip="tooltip">
                </pieChart>
            </div>
        </div>
    </van-row>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import pieChart from "../chart/pieChart.vue";
import { getIncomeAndExpense } from '@/api/finance/financeAnalysis/index';
import dayjs, { Dayjs } from "dayjs";
import { showFailToast } from 'vant';
import { ItemInfo } from "./common";

let pieExpenseData = ref<object[]>([]);

interface Props {
    activeTab: string|number;
}

let pieIncomeData = ref<object[]>([]);

let props = defineProps<Props>();

const getIncomeAndExpenseInfo = (userId: number, dateStr: string) => {
    getIncomeAndExpense(userId, dateStr).then(
        (res: { code: string; data: any[]; message: any }) => {
            if (res.code == "200") {
                if (res.data) {
                    let dd: ItemInfo[] = [];
                    res.data
                        .filter((item) => item.incomeAndExpenses == "income")
                        .forEach((item: { typeCode: any; amount: any }) => {
                            dd.push({ name: item.typeCode, value: item.amount });
                        });
                    pieIncomeData.value = dd;
                    let expense: ItemInfo[] = [];
                    res.data
                        .filter((item) => item.incomeAndExpenses == "expense")
                        .forEach((item: { typeCode: any; amount: any }) => {
                            expense.push({ name: item.typeCode, value: item.amount });
                        });
                    pieExpenseData.value = expense;
                    console.log(`pieExpenseData:`, pieExpenseData.value)
                }
            } else {
                showFailToast((res && res.message) || "查询列表失败！");
            }
        }
    );
};

const tooltip = ref({
    trigger: "item",
    formatter: "{b} : {c}元({d}%)",
});

const dateFormatter = "YYYY-MM";

let searchDateTime = ref<Dayjs>(dayjs());

const init = () => {
    let dateStr = searchDateTime.value.format(dateFormatter);
    getIncomeAndExpenseInfo(0, dateStr);
};

watch(
    () => props.activeTab,
    () => {
        if (props.activeTab === '2') {
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
        width: 98%;
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