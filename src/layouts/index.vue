<template>
  <van-nav-bar :title="title" left-text="返回" right-text="按钮" left-arrow @click-left="onClickLeft"
    @click-right="onClickRight" />
  <router-view />
  <Tabbar :data="useTabBar"></Tabbar>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Tabbar from './tabbar/index.vue';
import { reactive } from 'vue';
import { showToast } from 'vant';

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

let title = ref<string>(useTabBar[0].title);

const onClickLeft = () => history.back();
const onClickRight = () => showToast('按钮');
</script>