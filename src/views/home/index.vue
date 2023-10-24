<template>
    <navBar :info="info"></navBar>
    <van-grid :column-num="3">
        <van-grid-item key="financeManager" icon="photo-o" text="财务信息" to="/finance/financeManager" />
        <van-grid-item key="financeAnalysis" icon="photo-o" text="财务分析" to="/finance/financeAnalysis" />
        <van-grid-item key="accountRecordInfo" icon="photo-o" text="账号管理" to="/finance/accountRecordInfo" />
        <van-grid-item key="test" icon="photo-o" text="测试" to="/finance/test" />
        <van-grid-item v-for="value in 3" :key="value" icon="photo-o" text="文字" />
    </van-grid>
    <Tabbar :data="useTabBar"></Tabbar>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tabbar from './tabbar/index.vue';
import navBar from '@/views/common/navBar/index.vue';

const useTabBar = reactive([
    {
        title: "主控台",
        to: "/dashboard",
        icon: "home-o",
    },
    {
        title: "消息",
        to: "/message",
        icon: "user-o",
    },
    {
        title: "我的",
        to: "/user",
        icon: "user-o",
    },
]);

const info = ref<any>({
  title: '主控台',
  noShowLeft: true,
})
</script>