<template>
  <a-breadcrumb separator=">" >
    <a-breadcrumb-item v-for="(item, index) in matchList" :to="{path:`${item.path}`}" :key="item.path">
      <span v-if="index === matchList.length - 1">
          {{ item.meta.title }}
        </span>
        <router-link v-else :to="item.path">
          {{ item.meta.title }}
        </router-link>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { reactive, watchEffect, toRefs } from "vue";
import { RouteLocationMatched, useRoute } from "vue-router";

const Route = useRoute();

// 面包屑逻辑
const currentRouteInfo = reactive({
  matchList: [] as RouteLocationMatched[],
})

watchEffect(() => {
  const { matched } = Route;
  currentRouteInfo.matchList = [...matched];
})

const { matchList } = {
  ...toRefs(currentRouteInfo),
}
</script>

<style lang="less" scoped>
.ant-breadcrumb {
  padding: 20px 24px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
