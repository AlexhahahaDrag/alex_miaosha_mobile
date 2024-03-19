<template>
  <navBar :info="info" @clickRight="addFinance"></navBar>
  <van-pull-refresh
    pulling-text="加载中。。。"
    :style="{ height: 'calc(100% - 44px)' }"
    v-model="isRefresh"
    @refresh="refresh"
    ref="pullRefresh"
    immediate-check="false"
  >
    <form action="/">
      <van-search
        v-model="searchInfo.bigTypeCode"
        show-action
        placeholder="请输入搜索关键词"
        @search="onSearch"
        @cancel="onCancel"
        action-text="清空"
      />
    </form>
    <van-divider :style="{ color: '#1989fa', borderColor: 'grey' }">
    </van-divider>
    <van-empty v-if="dataSource.length == 0" description="暂无数据" />
    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onRefresh"
    >
      <van-cell-group>
        <van-swipe-cell
          v-for="(item, index) in dataSource"
          :before-close="beforeClose"
          :key="index"
        >
          <van-cell
            :title-class="item.isValid == '1' ? 'validClass' : 'notValidClass'"
            :title="
              userMap[item.belongTo] +
              '的' +
              item.name +
              '(' +
              item.typeCode +
              ')'
            "
            :key="index"
            is-link
            :to="{
              path: '/finance/financeManager/financeManagerDetail',
              query: { id: item.id },
            }"
          >
            <template #label>
              <div class="svgInfo">
                <div
                  class="svgDiv"
                  v-for="(fromSource, index) in fromSourceTransferList"
                  :key="index"
                >
                  <SvgIcon v-if="item.fromSource.indexOf(fromSource.value) >= 0 && fromSource.value != ''"
                          :name="fromSource.label" class="svg"></SvgIcon>
                </div>
              </div>
            </template>
            <template #right-icon>
              <div class="text-right">
                <div style="display: flex">
                  <div class="van-ellipsis">
                    {{
                      item?.infoDate
                        ? String(item.infoDate).substring(0, 10)
                        : "--"
                    }}
                  </div>
                </div>
                <div
                  :class="
                    item.incomeAndExpenses === 'income'
                      ? 'rightGreenDiv'
                      : 'rightRedDiv'
                  "
                >
                  {{
                    item.amount
                      ? (item.incomeAndExpenses === "income"
                          ? item.amount
                          : -item.amount) + "元"
                      : "--"
                  }}
                </div>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button
              class="right_info"
              @click="delFinance(item.id)"
              square
              type="danger"
              text="删除"
            />
          </template>
          <van-divider
            :style="{
              color: '#1989fa',
              borderColor: 'grey',
              padding: '0 16px',
              'margin-top': '0px',
              'margin-bottom': '0px',
            }"
          >
          </van-divider>
        </van-swipe-cell>
      </van-cell-group>
    </van-list>
  </van-pull-refresh>
  <van-back-top />
</template>
<script lang="ts" setup>
import {
  getFinanceMangerPage,
  deleteFinanceManager,
} from "@/api/finance/financeManager";
import { getUserManagerList } from "@/api/user/userManager";
import {
  SearchInfo,
  pagination,
  pageInfo,
  fromSourceTransferList,
} from "./financeManager";
import { showSuccessToast, showFailToast } from "vant";

// window.onpopstate = function(event) {
//   alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
// };

let router = useRouter();
let route = useRoute();
const info = ref<any>({
  title: route?.meta?.title || "财务管理",
  rightButton: "新增",
  leftPath: "/",
});
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
  searchInfo.value.bigTypeCode = "";
  pagination.value.current = 0;
  dataSource.value = [];
  getFinancePage(searchInfo.value, pagination.value);
};

function getFinancePage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getFinanceMangerPage(
    param,
    cur?.current ? cur.current : 1,
    cur?.pageSize || 10
  )
    .then((res) => {
      if (res?.code == "200") {
        dataSource.value = [...dataSource.value, ...res.data.records];
        pagination.value.current = res.data.current + 1;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
        if (
          (pagination.value.total || 0) < (pagination.value.current || 1) * (pagination.value.pageSize || 10)  
        ) {
          finished.value = true;
        }
      } else {
        showFailToast((res && res.message) || "查询列表失败！");
      }
    })
    .finally(() => {
      isRefresh.value = false;
      loading.value = false;
    });
}

const addFinance = () => {
  router.push({ path: "/finance/financeManager/financeManagerDetail" });
};

let userMap = {};
function getUserInfoList() {
  getUserManagerList({}).then((res) => {
    if (res.code == "200") {
      if (res?.data) {
        res.data.forEach((user: { id: string | number; nickName: any }) => {
          userMap[user.id] = user.nickName;
        });
      }
    } else {
      showFailToast((res && res.message) || "查询列表失败！");
    }
  });
}

const refresh = () => {
  pagination.value.current = 0;
  dataSource.value = [];
  getFinancePage(searchInfo.value, pagination.value);
};

const onRefresh = () => {
  getFinancePage(searchInfo.value, pagination.value);
};

const beforeClose = (e: any) => {
  console.log(e);
};

const delFinance = (id: number) => {
  deleteFinanceManager(id + "").then((res: any) => {
    if (res?.code == "200") {
      refresh();
      showSuccessToast((res && res.message) || "删除成功！");
    } else {
      showFailToast((res && res.message) || "删除失败，请联系管理员！");
    }
  });
};

function init() {
  dataSource.value = [];
  pagination.value.current = 0;
  //获取财务管理页面数据
  getFinancePage(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
}

init();
</script>

<style lang="scss" scoped>
.right_info {
  height: 100%;
}
.svgInfo {
  margin-top: 10px; 
  display: flex;
  .svgDiv {
    height: 30px;
    .svgClass {
      height: 100%;
    }
    .svg {
      width: 1.5em;
      height: 1.5em;
      font-size: 18px;
      cursor: pointer;
      vertical-align: middle;
    }
  }
}

.van-ellipsis {
  width: 130px; 
  text-align: right;
}

.rightDiv {
  margin-top: 10px;
  text-align: right;
}

.rightGreenDiv {
  margin-top: 10px;
  text-align: right;
  color: green;
}

.rightRedDiv {
  margin-top: 10px;
  text-align: right;
  color: red;
}

.validClass {
  font-weight: bolder;
}

.notValidClass {
  color: gray;
}
</style>
