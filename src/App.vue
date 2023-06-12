<script setup lang="ts">
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<style>
</style>