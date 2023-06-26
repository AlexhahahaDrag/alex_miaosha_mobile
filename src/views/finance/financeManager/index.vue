<template>
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="getFinancePage">
        <van-cell v-for="item in list" :key="item" :title="item"></van-cell>
    </van-list>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { getFinanceMangerPage } from '@/api/finance/financeManager/index.ts';
import {
  SearchInfo,
  pagination,
  columns,
  DataItem,
  fromSourceTransferList,
  pageInfo,
} from "./financeManager";

const list = ref<number[]>([]);
const loading = ref(false);
const finished = ref(false);
let dataSource = ref();
let searchInfo = ref<SearchInfo>({});

function getFinancePage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getFinanceMangerPage(param, cur.current, cur.pageSize)
    .then((res: { code: string; data: { records: any; current: number | undefined; size: number | undefined; total: number | undefined; }; }) => {
      if (res.code == "200") {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        // message.error((res && res.message) || "查询列表失败！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

getFinancePage(searchInfo.value, pagination.value);
</script>