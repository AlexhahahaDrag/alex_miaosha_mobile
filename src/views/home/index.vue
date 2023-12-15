<template>
    <navBar :info="info"></navBar>
    <van-grid :column-num="3" :square="true">
        <van-grid-item key="financeManager" text="财务信息" to="/finance/financeManager">
            <svgIcon class="homeSvgClass" name="homeFinanceManager"></svgIcon>
            <span class="homeFontClass">财务信息</span>
        </van-grid-item>
        <van-grid-item key="financeAnalysis" text="财务分析" to="/finance/financeAnalysis">
            <svgIcon class="homeSvgClass" name="homeFinanceAnalysis"></svgIcon>
            <span class="homeFontClass">财务分析</span>
        </van-grid-item>
        <van-grid-item key="accountRecordInfo" text="猫超管理" to="/finance/accountRecordInfo">
            <svgIcon class="homeSvgClass" name="homeAccordManager"></svgIcon>
            <span class="homeFontClass">猫超管理</span>
        </van-grid-item>
        <van-grid-item key="orgManagerInfo" text="机构管理" to="/user/orgInfo">
            <svgIcon class="homeSvgClass" name="homeOrgManager"></svgIcon>
            <span class="homeFontClass">机构管理</span>
        </van-grid-item>
    </van-grid>
    <Tabbar :data="useTabBar"></Tabbar>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tabbar from './tabbar/index.vue';
import navBar from '@/views/common/navBar/index.vue';
import svgIcon from "@/views/common/icons/svgIcon.vue";

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

<style lang="scss">
.homeSvgClass {
    height: 100%;
    width: 100%;
    font-size: 18px;
    cursor: pointer;
    verticle-align: middle;
}

.homeFontClass {
    margin-top: 8px;
    color: darkgray;
    font-weight: bold;
    font-size: 14px;
}
</style>
