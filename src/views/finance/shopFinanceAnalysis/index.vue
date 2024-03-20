<template>
    <NavBar :info="info"></NavBar>
    <van-row class="topRow">
        <van-col offset="14" span="10">
            <span name="infoDate" @click="chooseDate()">
                <a> {{ infoDateName }}</a>
            </span>
            账单
        </van-col>
    </van-row>
    <van-tabs v-model:active="activeTab" sticky swipeable @change="changeTab">
        <van-tab title="店总览" name="1">
            <shopOverview v-bind="props"></shopOverview>
        </van-tab>
        <van-tab title="店收支分析" name="2">
            <shopIncomeAnalysis v-bind="props"></shopIncomeAnalysis>
        </van-tab>
        <van-tab title="店收支明细" name="3">
            <shopIncomeDetail v-bind="props"></shopIncomeDetail>
        </van-tab>
    </van-tabs>
    <monthPop :info="chooseDateInfo" @selectInfo="selectDateInfo" @cancelInfo="cancelDateInfo"></monthPop>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from "dayjs";

let route = useRoute();

const info = ref<any>({
    title: route?.meta?.title || "店财务分析",
    leftPath: "/",
});

const dateFormatter = "YYYY年MM月";
const YYYYMM = "YYYY-MM";

let activeTab = ref<number>(2);

let props = reactive<any>({
    activeTab: activeTab.value,
    dateStr: dayjs().format(YYYYMM),
});

const changeTab = (name: number) => {
    props.activeTab = name;
    activeTab.value = name;
};

let infoDateName = ref<string>(dayjs().format(dateFormatter));

const chooseDate = () => {
    chooseDateInfo.value.showFlag = true;
};

let chooseDateInfo = ref<any>({
    label: 'infoDate',
    labelName: '月份选择',
    selectValue: dayjs(),
    showFlag: false,
    columnsType: ['year', 'month'],
    formatter: (type: string, option: any) => {
        if (type === 'year') {
            option.text += '年';
        }
        if (type === 'month') {
            option.text += '月';
        }
        return option;
    },
});

const selectDateInfo = (dateInfo: Dayjs, dateName: string) => {
    chooseDateInfo.value.showFlag = false;
    props.dateStr = dayjs(dateInfo).format(YYYYMM);
    infoDateName.value = dateName;
    chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
    chooseDateInfo.value.showFlag = false;
}

</script>
<style lang="scss" scoped>
.topRow {
    padding-top: 10px;
}

a {  
    color: blue;  
    text-decoration: underline;  
}  
</style>