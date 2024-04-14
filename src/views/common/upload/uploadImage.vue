<template>
  <van-uploader v-model="fileList" multiple :max-count="1"></van-uploader>
</template>

<script setup lang="ts">

const fileList = ref([]);
</script>