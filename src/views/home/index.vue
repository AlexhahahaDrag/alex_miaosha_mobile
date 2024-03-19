<template>
  <navBar :info="info"></navBar>
  <van-grid :column-num="3" :square="true">
    <van-grid-item
      v-for="item in homeList"
      :key="item.id"
      :text="item?.meta?.title"
      :to="item.path"
    >
      <SvgIcon class="homeSvgClass" :name="item?.meta?.icon"></SvgIcon>
      <span class="homeFontClass">{{ item?.meta?.title || "null" }}</span>
    </van-grid-item>
  </van-grid>
  <Tabbar :data="useTabBar"></Tabbar>
</template>

<script setup lang="ts">

let router = useRouter();
let homeList = ref<any>([]);

const getHomeList = (arr: readonly any[] | null) => {
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

const init = () => {
  homeList.value = [];
  getHomeList(router?.options?.routes || []);
}

init();

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

<style lang="scss" scoped>
.homeSvgClass {
  height: 80%;
  width: 80%;
  font-size: 18px;
  cursor: pointer;
  vertical-align: middle;
}

.homeFontClass {
  margin-top: 8px;
  margin-bottom: 8px;
  color: darkgray;
  font-weight: bold;
  font-size: 14px;
}
</style>
