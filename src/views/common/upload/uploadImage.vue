<template>
    <van-uploader v-model="fileList" multiple :max-count="1" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileList = ref([]);
</script>