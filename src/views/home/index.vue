<template>
  <navBar :info="info"></navBar>
  <van-grid :column-num="3" :square="true">
    <van-grid-item
      key="financeManager"
      text="财务信息"
      to="/finance/financeManager"
    >
      <svgIcon class="homeSvgClass" name="financeManager"></svgIcon>
      <span class="homeFontClass">财务信息</span>
    </van-grid-item>
    <van-grid-item
      key="financeAnalysis"
      text="财务分析"
      to="/finance/financeAnalysis"
    >
      <svgIcon class="homeSvgClass" name="financeAnalysis"></svgIcon>
      <span class="homeFontClass">财务分析</span>
    </van-grid-item>
    <van-grid-item
      key="accountRecordInfo"
      text="猫超管理"
      to="/finance/accountRecordInfo"
    >
      <svgIcon class="homeSvgClass" name="accountRecordInfo"></svgIcon>
      <span class="homeFontClass">猫超管理</span>
    </van-grid-item>
    <van-grid-item key="orgManagerInfo" text="机构管理" to="/user/orgInfo">
      <svgIcon class="homeSvgClass" name="orgManager"></svgIcon>
      <span class="homeFontClass">机构管理</span>
    </van-grid-item>
    <van-grid-item
      v-for="item in homeList"
      :key="item.id"
      :text="item?.meta?.title"
      :to="item.path"
    >
      <svgIcon class="homeSvgClass" :name="item.icon"></svgIcon>
      <span class="homeFontClass">{{ item?.meta?.title || "null" }}</span>
    </van-grid-item>
  </van-grid>
  <Tabbar :data="useTabBar"></Tabbar>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import Tabbar from "./tabbar/index.vue";
import navBar from "@/views/common/navBar/index.vue";
import svgIcon from "@/views/common/icons/svgIcon.vue";
import { useRouter, useRoute } from "vue-router";

let router = useRouter();
let route = useRoute();
console.log(`routerInfo:`, router, route);
let homeList = ref<any>([]);

const getHomeList = (arr: any[] | null) => {
  if (arr?.length) {
    arr.forEach((item: any) => {
      if (item) {
        console.log(item)
        if(item?.meta?.showInHome) {
            homeList.value.push(item);
        }
        if (item.children?.length) {
          getHomeList(item.children);
        }
      }
    });
  }
};

getHomeList(router.options.routes);

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
    to: "/myself",
    icon: "user-o",
  },
]);

const info = ref<any>({
  title: "主控台",
  noShowLeft: true,
});
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
