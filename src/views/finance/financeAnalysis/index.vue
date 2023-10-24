<template>
    <van-row style="padding-top: 10px;">
        <van-col offset="10" span="5">
            <span name="belongTo" @click="choose()">
                {{ belongToName }}
                <van-icon name="arrow-down" />
            </span>
        </van-col>
        <van-col span="7">
            <span name="infoDate" @click="chooseDate()">
                {{ infoDateName }}
                <van-icon name="arrow-down" />
            </span>
        </van-col>
    </van-row>
    <van-tabs v-model:active="activeTab" sticky swipeable @change="changeTab">
        <van-tab title="总览" name="1">
            <overview v-bind="props"></overview>
        </van-tab>
        <van-tab title="收支分析" name="2">
            <incomeAnalysis v-bind="props"></incomeAnalysis>
        </van-tab>
        <van-tab title="收支明细" name="3">
            <incomeDetail v-bind="props"></incomeDetail>
        </van-tab>
    </van-tabs>
    <monthPop :info="chooseDateInfo" @selectInfo="selectDateInfo" @cancelInfo="cancelDateInfo"></monthPop>
    <selectPop :info="popInfo" @selectInfo="selectInfo" @cancelInfo="cancelInfo"></selectPop>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import overview from './detail/overview.vue';
import incomeAnalysis from './detail/incomeAnalysis.vue';
import incomeDetail from './detail/incomeDetail.vue';
import monthPop from '@/views/common/pop/monthPop.vue';
import dayjs, { Dayjs } from "dayjs";
import { Info } from '@/views/common/pop/selectPop.vue';
import selectPop from '@/views/common/pop/selectPop.vue';
import { useUserStore } from "@/store/modules/user/user";
import { getUserManagerList } from "@/api/user/userManager";
import { showFailToast } from 'vant';

let userInfo = useUserStore()?.getUserInfo;
const dateFormatter = "YYYY年MM月";
const YYYYMM = "YYYY-MM";

let belongTo = ref<number | null>(userInfo?.id ? Number(userInfo.id) : null);

let activeTab = ref<number>(2);

let props = reactive<any>({
    activeTab: activeTab.value,
    dateStr: dayjs().format(YYYYMM),
    belongTo: belongTo.value,
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
    labelName: '业务日期',
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
    props.dateStr = dateInfo.format(YYYYMM);
    infoDateName.value = dateName;
    chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
    chooseDateInfo.value.showFlag = false;
}

let belongToName = ref<string>();
let popInfo = ref<Info>({
    showFlag: false,
    label: 'belongTo',
    labelName: '属于',
    customFieldName: {
        text: 'nickName',
        value: 'id',
    },
    list: [{ id: '0', nickName: '所有人' }],
    selectValue: [belongTo.value],
});

const selectInfo = (type: string, value: any, name: string) => {
    popInfo.value.showFlag = false;
    switch (type) {
        case 'belongTo':
            belongTo.value = value || null;
            belongToName.value = name;
            props.belongTo = value;
            break;
    }
};

const cancelInfo = () => {
    popInfo.value.showFlag = false;
};

const choose = () => {
    popInfo.value.showFlag = true;
};

const getUserInfoListInfo = () => {
    getUserManagerList({}).then((res: any) => {
        if (res.code == "200") {
            popInfo.value.list = [...popInfo.value?.list || [], ...res?.data || []];
            belongToName.value = getListName(res.data, belongTo.value, 'id', 'nickName');
        } else {
            showFailToast(res[2]?.message || '查询失败，请联系管理员!')
        }
    })
};

const getListName = (list: any[], value: any, code: string, name: string) => {
    if (!list?.length) {
        return '';
    }
    let listName = '';
    list.forEach(item => {
        if (item[code] == value) {
            listName = item[name];
        }
    });
    return listName;
};

const init = () => {
    getUserInfoListInfo();
};

init();
</script>