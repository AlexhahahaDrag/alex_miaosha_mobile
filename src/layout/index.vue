<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <Navbar :routes="routes" :selectedKeys="selectedKeys"></Navbar>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <div class="navbar">
          <Breadcrumb class="breadcrumb-container"></Breadcrumb>
          <div class="right-menu">
            <RightInfo></RightInfo>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 20px 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        alex-miaosha
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { algorithm } from '@/utils/algorithm';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "./components/navbar/index.vue";
import Breadcrumb from "./components/breadcrumb/index.vue";
import RightInfo from "./components/rightInfo/index.vue";

const router = useRouter().options.routes as [];
const routes = computed(() => algorithm.increaseIndexes(router));
let collapsed = ref<boolean>(false);
let selectedKeys = ref<string[]>(['1']);

</script>
<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    margin-right: 50px;
    &:focus {
      outline: none;
    }
  }
}
</style>

<!-- <template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider :collapsed="collapsed" collapsible>
      <Navbar :routes="routes" :selectedKeys="selectedKeys" :openKeys="openKeys"></Navbar>
    </a-layout-sider>
    <a-layout>
      <Breadcrumb></Breadcrumb>
      <a-layout-content style="margin: 0 16px">
        <router-view />
      </a-layout-content>
      <a-layout-footer style="text-align: center"> alex blog </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import Navbar from "./components/navbar/index.vue";
import Breadcrumb from "./components/breadcrumb/index.vue";
import { useRouter } from "vue-router";
import { algorithm } from "@/utils/algorithm/index";

const router = useRouter().options.routes as [];
const routes = computed(() => algorithm.increaseIndexes(router));
let collapsed = ref(false);
let selectedKeys = ref([]);
let openKeys= ref([]);
</script>
<style>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 206px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme="dark"] .site-layout .site-layout-background {
  background: dark;
}
</style> -->
