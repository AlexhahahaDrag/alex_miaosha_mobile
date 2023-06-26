<template>
    <van-grid :column-num="3">
        <van-grid-item key="financeManager" icon="photo-o" text="财务信息" to="/finance/financeManager"/>
        <van-grid-item key="financeManager" icon="photo-o" text="财务分析" to="/finance/financeAnalysis"/>
        <van-grid-item key="financeManager" icon="photo-o" text="账号管理" to="/finance/accountRecordInfo"/>
        <van-grid-item v-for="value in 3" :key="value" icon="photo-o" text="文字" />
    </van-grid>
</template>

<script setup lang="ts">

</script>