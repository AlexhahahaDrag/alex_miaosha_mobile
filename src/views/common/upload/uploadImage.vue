<template>
    <van-uploader v-model="fileList" multiple :max-count="1" />
</template>

<script setup lang="ts">

const fileList = ref([]);
</script>