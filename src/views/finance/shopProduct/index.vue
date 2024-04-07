<template>
  <NavBar :info='info'></NavBar>
  <van-pull-refresh pulling-text="加载中。。。" :style="{ height: 'calc(100% - 44px)' }" v-model='isRefresh'
    @refresh='refresh' ref='pullRefresh' immediate-check='false'>
    <form action='/'>
      <van-search v-model='searchInfo.shopName' show-action placeholder='请输入搜索关键词' @search='onSearch' @cancel='onCancel'
        action-text="清空" />
    </form>
    <van-divider :style="{
    color: '#515151',
    borderColor: '#515151',
  }"></van-divider>
    <van-empty v-if='dataSource.length == 0' description='暂无数据' />
    <van-list v-else v-model:loading='loading' :finished='finished' finished-text='没有更多了' @load='onRefresh'>
      <van-cell v-for="item in dataSource" :key="item">
        <template #title>
          <div class="text-left">
            <span class="custom-title">{{ item.shopName }}</span>
            <van-tag type="primary">{{ item.oldShopCode }}</van-tag>
          </div>
        </template>
        <template #right-icon>
          <div class="text-right">
            <div style="display: flex">
              <div class="van-ellipsis">
                ￥{{ commonUtils.formatAmount(item?.saleAmount, 2, '') }}
              </div>
            </div>
            <div class="rightRedDiv">
              <div>
                <SvgIcon name="shoppingCart" class="svg" @click="shoppingCart(item)"></SvgIcon>
                <SvgIcon name="shoppingBuy" class="svg" @click="shoppingBuy(item)"></SvgIcon>
              </div>
            </div>
          </div>
        </template>
        <template #value></template>
        <template #label>
          {{ item.description }}
        </template>
      </van-cell>
    </van-list>
  </van-pull-refresh>
  <van-back-top />
  <Tabbar :data="useTabBar"></Tabbar>
</template>
<script lang='ts' setup>
import {
  getShopStockPage,
} from '@/api/finance/shopStock/shopStockTs';
import { getUserManagerList, } from '@/api/user/userManager';
import {
  addOrEditShopCart,
} from '@/api/finance/shopCart/shopCartTs';
import {
  SearchInfo,
  pagination,
  pageInfo,
  ShopStockInfo,
} from './shopProductTs';
import { showFailToast } from 'vant';
import commonUtils from '@/utils/common/index'
import { useUserStore } from '@/store/modules/user/user';

const useTabBar = reactive([
  {
    title: "商品",
    to: "/finance/shopProduct",
    icon: "shop-o",
  },
  {
    title: "购物车",
    to: "/finance/shoppingCart",
    icon: "shopping-cart-o",
  },
]);

let router = useRouter();
let route = useRoute();
let userInfo = useUserStore()?.getUserInfo;
const info = ref<any>({
  title: route?.meta?.title || '商品详情',
  rightButton: '详情',
  leftPath: "/",
})
let loading = ref<boolean>(false);
let dataSource = ref<any[]>([]);
let searchInfo = ref<SearchInfo>({ isShopping: true });

let finished = ref<boolean>(false); //加载是否已经没有更多数据
let isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
  pagination.value.current = 1;
  dataSource.value = []
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
  getShopStockPage(param, cur?.current || 1, cur?.pageSize || 10)
    .then((res: any) => {
      if (res?.code == '200') {
        dataSource.value = [...dataSource.value, ...res.data.records];
        pagination.value.current = res.data.current + 1;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
        if ((pagination.value.total || 0) <
          (pagination.value.current || 1) * (pagination.value.pageSize || 10)) {
          finished.value = true;
        }
      } else {
        showFailToast((res?.message) || '查询列表失败！');
      }
    })
    .finally(() => {
      isRefresh.value = false;
      loading.value = false;
    });
}

let userMap = {};
function getUserInfoList() {
  getUserManagerList({}).then((res: any) => {
    if (res?.code == '200') {
      if (res?.data) {
        res.data.forEach((user: { id: string | number; nickName: any; }) => {
          userMap[user.id] = user.nickName;
        });
      }
    } else {
      showFailToast((res?.message) || '查询列表失败！');
    }
  });
}

const refresh = (): void => {
  pagination.value.current = 0;
  dataSource.value = []
  query(searchInfo.value, pagination.value);
}

const onRefresh = () => {
  query(searchInfo.value, pagination.value);
};

const shoppingBuy = (item: ShopStockInfo): void => {
  router.push({ name: 'saleTicket', query: { ids: item.id } });
};

const shoppingCart = (item: ShopStockInfo) => {
  let info = {
    shopId: item.id,
    userId: userInfo.id,
    customId: null,
    isValid: '1',
    saleNum: 1,
  };
  addOrEditShopCart('post', info);
};

function init(): void {
  dataSource.value = [];
  pagination.value.current = 0;
  query(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
}

init();
</script>

<style lang='scss' scoped>
.text-left {
  font-size: 17px;
  width: 100%;
  padding-bottom: 15px;
}

.rightRedDiv {
  margin-top: 10px;
  text-align: right;
  height: 20px;

  .svg {
    width: 1.5em;
    height: 1.5em;
    font-size: 18px;
    cursor: pointer;
    vertical-align: middle;
    padding-left: 15px;
  }
}

.iconClass {
  margin-top: 10px;
  display: flex;
}

.van-ellipsis {
  width: 130px;
  text-align: right;
  color: black;
  font-size: 20px;
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

.svg {
  width: 1.5em;
  height: 1em;
  font-size: 18px;
  cursor: pointer;
  vertical-align: middle;
}
</style>