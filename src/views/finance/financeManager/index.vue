<template>
  <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="getFinancePage">
    <van-cell-group>
      <van-cell :title="userMap[item.belongTo] + '的' + item.name" v-for="(item, index) in dataSource" :key="index" is-link
        :to="{ path: 'financeManagerDetail', query: { id: item.id } }">
        <template #label>
          <div style="margin-top: 10px; display: flex">
            <div class="icon" style="background-color: #ffcc00">
              {{ item.fromSource }}
            </div>
            <div class="time-box">{{ item.belongTo }}</div>
          </div>
        </template>
        <template #right-icon>
          <div class="text-right">
            <div style="display: flex">
              <div class="van-ellipsis" style="width: 130px">
                {{ item?.infoDate ? String(item.infoDate).substring(0, 10) : '--' }}
              </div>
            </div>
            <div style="margin-top: 10px">
              {{ item.amount ? (item.incomeAndExpenses === 'income' ? item.amount : -item.amount) : '--' }}
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </van-list>
  <van-back-top />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { getFinanceMangerPage, } from '@/api/finance/financeManager/index';
import { getUserManagerList } from "@/api/user/userManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import {
  SearchInfo,
  pagination,
  pageInfo,
} from "./financeManager";
import { showToast } from 'vant';

const loading = ref(false);
const finished = ref(false);
let dataSource = ref();
let searchInfo = ref<SearchInfo>({});

function getFinancePage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getFinanceMangerPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
    .then((res) => {
      if (res.code == "200") {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
        finished.value = true;
      } else {
        showToast((res && res.message) || "查询列表失败！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

let userMap = {};
function getUserInfoList() {
  getUserManagerList({}).then((res) => {
    if (res.code == "200") {
      if (res?.data) {
        res.data.forEach((user: { id: string | number; nickName: any; }) => {
          userMap[user.id] = user.nickName;
        });
      }
    } else {
      showToast((res && res.message) || "查询列表失败！");
    }
  });
}

// function getDictInfoList() {
//   getDictList("pay_way,income_expense_type").then((res) => {
//     if (res.code == "200") {
//       fromSourceList.value = res.data.filter(
//         (item: { belongTo: string }) => item.belongTo == "pay_way"
//       );
//       incomeAndExpensesList.value = res.data.filter(
//         (item: { belongTo: string }) => item.belongTo == "income_expense_type"
//       );
//     } else {
//       message.error((res && res.message) || "查询列表失败！");
//     }
//   });
// }

function init() {
  //获取字典列表
  // getDictInfoList();
  //获取财务管理页面数据
  getFinancePage(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
}

init();
</script>