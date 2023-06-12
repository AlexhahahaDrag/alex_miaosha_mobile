<template>
  <div>
    <a-menu id="menu" mode="inline" theme="dark" :selectedKeys="props.selectedKeys">
      <Menu :routes="routes"></Menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Menu from "./menu.vue";
import { MenuDataItem } from "@/router/typing";
interface Props {
  routes: MenuDataItem[];
  selectedKeys: String[];
}
const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

const routes = ref<MenuDataItem[]>(props.routes);
</script>
