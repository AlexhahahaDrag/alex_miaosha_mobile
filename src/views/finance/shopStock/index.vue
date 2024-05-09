<template>
  <navBar :info="info" @clickRight="addShopStock(null, 'add')"></navBar>
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
        v-model="searchInfo?.title || ''"
        show-action
        placeholder="请输入搜索关键词"
        @search="onSearch"
        @cancel="onCancel"
        action-text="清空"
      />
    </form>
    <van-divider
      :style="{
        color: '#1989fa',
        borderColor: 'grey',
      }"
    ></van-divider>
    <van-empty v-if="dataSource.length == 0" description="暂无数据"></van-empty>
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
            :key="index"
            is-link
            :to="{
              path: '/finance/shopStock/shopStockDetail',
              query: { id: item.id, type: 'update' },
            }"
          >
            <template #title>
              <div class="text-left">
                <van-space size="4px">
                  <span class="custom-title">{{ item.shopName }}</span>
                  <van-tag type="primary">{{ item.oldShopCode }}</van-tag>
                  <van-tag color="#7232dd" v-if="item.style">{{ item.style }}</van-tag>
                  <van-tag type="success" v-if="item.color">{{ item.color }}</van-tag>
                  <van-tag type="warning" v-if="item.size">{{ item.size }}</van-tag>
                </van-space>
              </div>
            </template>
            <template #label>
              <div class="upAndDown">
                <div style="display: flex">
                  {{ commonUtils.formatAmount(item?.costAmount || 0, 2, '元') }}
                  <br />
                  成本价
                </div>
                <div>
                  {{ commonUtils.formatAmount(item?.saleAmount || 0, 2, '元') }}
                  <br />
                  销售价
                </div>
                <div>
                  {{ commonUtils.formatAmount(item?.saleNum || 0, 0, '件') }}
                  <br />
                  库存
                </div>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button
              class="right_info"
              @click="addShopStock(item?.id || 0, 'copy')"
              square
              type="primary"
              text="复制"
            />
            <van-button
              class="right_info"
              @click="delShopStock(item?.id || 0)"
              square
              type="danger"
              text="删除"
            />
          </template>
          <van-divider class="dividerClass"></van-divider>
        </van-swipe-cell>
      </van-cell-group>
    </van-list>
  </van-pull-refresh>
  <van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { getShopStockPage, deleteShopStock } from '@/api/finance/shopStock/shopStockTs';
import { getUserManagerList } from '@/api/user/userManager';
import { SearchInfo, pagination, pageInfo, ShopStockInfo } from './shopStockTs';
import { showSuccessToast, showFailToast } from 'vant';
import commonUtils from '@/utils/common/index';

let router = useRouter();
let route = useRoute();
const info = ref<any>({
  title: route?.meta?.title || '库存管理',
  rightButton: '新增',
  leftPath: '/',
});
let loading = ref<boolean>(false);
let dataSource = ref<ShopStockInfo[]>([]);
let searchInfo = ref<SearchInfo>({});

let finished = ref<boolean>(false); //加载是否已经没有更多数据
let isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
  pagination.value.current = 1;
  dataSource.value = [];
  onRefresh();
};
const onCancel = () => {
  searchInfo.value.shopName = '';
  pagination.value.current = 0;
  dataSource.value = [];
  query(searchInfo.value, pagination.value);
};

function query(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getShopStockPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
    .then((res: any) => {
      if (res?.code == '200') {
        dataSource.value = [...dataSource.value, ...res.data.records];
        pagination.value.current = res.data.current + 1;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
        if (
          (pagination.value.total || 0) <
          (pagination.value.current || 1) * (pagination.value.pageSize || 10)
        ) {
          finished.value = true;
        }
      } else {
        showFailToast(res?.message || '查询列表失败！');
      }
    })
    .finally(() => {
      isRefresh.value = false;
      loading.value = false;
    });
}

const addShopStock = (id: number | null, type: string) => {
  router.push({ path: '/finance/shopStock/shopStockDetail', params: { id, type } });
};

let userMap = {};
function getUserInfoList() {
  getUserManagerList({}).then((res: any) => {
    if (res?.code == '200') {
      if (res?.data) {
        res.data.forEach((user: { id: string | number; nickName: any }) => {
          userMap[user.id] = user.nickName;
        });
      }
    } else {
      showFailToast(res?.message || '查询列表失败！');
    }
  });
}

const refresh = () => {
  pagination.value.current = 0;
  dataSource.value = [];
  query(searchInfo.value, pagination.value);
};

const onRefresh = () => {
  query(searchInfo.value, pagination.value);
};

const beforeClose = (e: any) => {
  console.log(e);
};

const delShopStock = (id: number) => {
  deleteShopStock(id + '').then((res: any) => {
    if (res?.code == '200') {
      refresh();
      showSuccessToast(res?.message || '删除成功！');
    } else {
      showFailToast(res?.message || '删除失败，请联系管理员！');
    }
  });
};

function init() {
  dataSource.value = [];
  pagination.value.current = 0;
  query(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
}

init();
</script>

<style lang="scss" scoped>
.right_info {
  height: 100%;
}

.rightDiv {
  margin-top: 10px;
  text-align: right;
}

.rightRedDiv {
  margin-top: 10px;
  text-align: right;
  color: red;
}

.iconClass {
  margin-top: 10px;
  display: flex;
}

.van-ellipsis {
  width: 130px;
  text-align: right;
}

.dividerClass {
  color: #1989fa;
  border-color: grey;
  padding: 0 16px;
  margin-top: 0px;
  margin-bottom: 0px;
}

.upAndDown {
  display: flex;
  justify-content: space-around;
}
</style>
