<template>
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
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import overview from './detail/overview.vue';
import incomeAnalysis from './detail/incomeAnalysis.vue';
import incomeDetail from './detail/incomeDetail.vue';

let props = ref<any>({});

let activeTab = ref<string | number>(1);
const changeTab = (name: string | number) => {
    activeTab.value = name;
    props.value.activeTab = name;
};

</script>