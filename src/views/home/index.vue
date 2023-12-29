<template>
  <navBar :info="info"></navBar>
  <van-grid :column-num="3" :square="true">
    <van-grid-item
      v-for="item in homeList"
      :key="item.id"
      :text="item?.meta?.title"
      :to="item.path"
    >
      <svgIcon class="homeSvgClass" :name="item?.meta?.icon"></svgIcon>
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
import { useRouter } from "vue-router";

let router = useRouter();
let homeList = ref<any>([]);

const getHomeList = (arr: any[] | null) => {
  if (arr?.length) {
    arr.forEach((item: any) => {
      if (item) {
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
