<template>
  <navBar :info="info" @clickRight="addFinance"></navBar>
  <van-pull-refresh pulling-text="加载中。。。" :style="{ height: 'calc(100% - 44px)' }" v-model="isRefresh"
    @refresh="onRefresh" ref="pullRefresh" immediate-check="false">
    <form action="/">
      <van-search v-model="searchInfo.typeCode" show-action placeholder="请输入搜索关键词" @search="onSearch" @cancel="onCancel" />
    </form>
    <van-empty v-if="dataSource.length == 0" description="暂无数据" />
    <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onRefresh">
      <van-cell-group>
        <van-cell :title="userMap[item.belongTo] + '的' + item.name" v-for="(item, index) in dataSource" :key="index"
          is-link :to="{ path: 'financeManagerDetail', query: { id: item.id } }">
          <template #label>
            <div style="margin-top: 10px; display: flex">
              <div class="icon" style="background-color: #ffcc00">
                <div v-for="fromSource in fromSourceTransferList">
                  <svgIcon v-if="item.fromSource.indexOf(fromSource.value) >= 0 && fromSource.value != ''"
                    :name="fromSource.label" class="svg"
                    style="width: 1.5em;height: 1.5em; font-size: 18px;cursor: pointer;verticle-align: middle;"></svgIcon>
                </div>
              </div>
            </div>
          </template>
          <template #right-icon>
            <div class="text-right">
              <div style="display: flex">
                <div class="van-ellipsis" style="width: 130px;text-align:right">
                  {{ item?.infoDate ? String(item.infoDate).substring(0, 10) : '--' }}
                </div>
              </div>
              <div style="margin-top: 10px;text-align: right">
                {{ item.amount ? (item.incomeAndExpenses === 'income' ? item.amount : -item.amount) : '--' }}
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
  </van-pull-refresh>
  <van-back-top />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { getFinanceMangerPage, } from '@/api/finance/financeManager/index';
import { getUserManagerList, } from "@/api/user/userManager";
import svgIcon from "@/views/common/icon/svgIcon.vue";
import navBar from '@/views/common/navBar/index.vue';

import {
  SearchInfo,
  pagination,
  pageInfo,
  fromSourceTransferList,
} from "./financeManager";
import { showToast } from 'vant';

const info = ref<any>({
  title: '财务管理',
  rightButton: '新增',
})
let loading = ref<boolean>(false);
let dataSource = ref<any[]>([]);
let searchInfo = ref<SearchInfo>({});

let finished = ref<boolean>(false); //加载是否已经没有更多数据
let isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
  pagination.value.current = 1;
  dataSource.value = [];
  onRefresh();
};
const onCancel = () => {
  searchInfo.value.typeCode = '';
};

function getFinancePage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getFinanceMangerPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
    .then((res) => {
      if (res.code == "200") {
        dataSource.value = [...dataSource.value, ...res.data.records];
        pagination.value.current = res.data.current + 1;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
        console.log(`pageInfo`, pagination.value);
      } else {
        showToast((res && res.message) || "查询列表失败！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

const addFinance = () => {
  console.log(11111);
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

const onRefresh = () => {
  getFinancePage(searchInfo.value, pagination.value);
};

function init() {
  pagination.value.current = 0;
  //获取财务管理页面数据
  getFinancePage(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
}

init();
</script>