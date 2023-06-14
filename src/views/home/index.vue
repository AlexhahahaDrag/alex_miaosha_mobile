<template>
    <van-grid :column-num="3">
        <van-grid-item v-for="value in 3" :key="value" icon="photo-o" text="文字" />
    </van-grid>
</template>

<script setup lang="ts">
import {computed,} from 'vue'
import { useRouter } from 'vue-router';
import { algorithm } from '@/utils/algorithm';

const router = useRouter().options.routes as [];
const routes = computed(() => algorithm.increaseIndexes(router));
debugger;
</script>