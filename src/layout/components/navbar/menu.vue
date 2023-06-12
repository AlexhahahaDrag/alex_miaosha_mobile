[] as unknown[] as unknown[] as unknown[] as unknown
<template>
  <template v-for="route in p" :key="route.path" :item="route" :base-path="route.path">
    <template v-if="route.children && route.children.length > 0">
      <a-sub-menu :key="route.path">
        <template #icon>
          <template v-if="route.meta" style="text-align:center">
            <template v-if="route.meta.icon == 'home'">
              <Home />
            </template>
            <template v-else-if="route.meta.icon == 'goodsManager'">
              <GoodsManager />
            </template>
            <template v-else-if="route.meta.icon == 'orderManager'">
              <OrderManager />
            </template>
            <template v-else-if="route.meta.icon == 'promotion'">
              <Promotion />
            </template>
            <template v-else-if="route.meta.icon == 'userManager'">
              <UserManager />
            </template>
            <template v-else-if="route.meta.icon == 'financeManager'">
              <FinanceManager />
            </template>
          </template>
        </template>
        <template #title>{{ route.meta ? route.meta.title : "未知" }}</template>
        <Menu :routes="route.children"></Menu>
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item :key="route.path" :item="route" :base-path="route.path">
        <template #title>{{ route.meta ? route.meta.title : "未知" }}</template>
        <template #icon>
          <template v-if="route.meta" style="vertical-align:middle">
            <template v-if="route.meta.icon == 'home'">
              <Home />
            </template>
            <template v-else-if="route.meta.icon == 'goods'">
              <Goods />
            </template>
            <template v-else-if="route.meta.icon == 'order'">
              <Order />
            </template>
            <template v-else-if="route.meta.icon == 'seckill'">
              <Seckill />
            </template>
            <template v-else-if="route.meta.icon == 'finance'">
              <Finance />
            </template>
            <template v-else-if="route.meta.icon == 'financeAnalysis'">
              <FinanceAnalysis />
            </template>
            <template v-else-if="route.meta.icon == 'user'">
              <User />
            </template>
            <template v-else-if="route.meta.icon == 'dict'">
              <Dict />
            </template>
            <template v-else-if="route.meta.icon == 'accountRecordInfo'">
              <AccountRecordInfo />
            </template>
          </template>
        </template>
        <router-link :to="route.path">
          {{ route.meta && route.meta.title }}
        </router-link>
      </a-menu-item>
    </template>
  </template>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { MenuDataItem } from "@/router/typing";
import Home from '@v/common/icons/menu/home.vue';
import Goods from '@/views/common/icons/menu/goods.vue';
import Order from '@v/common/icons/menu/order.vue';
import Seckill from '@v/common/icons/menu/seckill.vue';
import GoodsManager from '@v/common/icons/menu/goodsManager.vue';
import OrderManager from '@v/common/icons/menu/orderManager.vue';
import Promotion from '@v/common/icons/menu/promotion.vue';
import Finance from '@v/common/icons/menu/finance.vue';
import FinanceManager from '@v/common/icons/menu/financeManager.vue';
import FinanceAnalysis from '@v/common/icons/menu/financeAnalysis.vue';
import Dict from '@v/common/icons/menu/dict.vue';
import User from '@v/common/icons/menu/user.vue';
import UserManager from '@v/common/icons/menu/userManager.vue';
import AccountRecordInfo from '@v/common/icons/menu/accountRecordInfo.vue';


interface Props {
  routes: MenuDataItem[];
}
const props = withDefaults(defineProps<Props>(), {
  routes: () => [],
});

const p = ref<MenuDataItem[]>(props.routes);

</script>
