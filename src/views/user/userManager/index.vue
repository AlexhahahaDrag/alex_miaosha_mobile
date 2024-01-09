<template>
    <van-divider>基本信息</van-divider>
    <van-field v-model="value" label="头像">
        <template #input>
            <uploadImage></uploadImage>
        </template>
    </van-field>
</template>

<script setup lang="ts">
import uploadImage from '@/views/common/upload/uploadImage.vue'

const value = ref('');
</script>