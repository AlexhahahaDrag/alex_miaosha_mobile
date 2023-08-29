import { createRouter, createWebHashHistory } from 'vue-router'
import { MenuDataItem } from './typing'
import Message from '@/views/message/index.vue';
import Layout from '@/layouts/index.vue';
import Home from '@/views/home/index.vue';
import User from '@/views/user/index.vue';
import Login from '@/views/login/index.vue'
import UserManager from '@/views/user/userManager/index.vue';
import FinanceManager from '@v/finance/financeManager/index.vue';
import FinanceAnalysis from '@v/finance/financeAnalysis/index.vue';
import AccountRecordInfo from '@v/finance/accountRecordInfo/index.vue';
import FinanceManagerDetail from '@v/finance/financeManager/detail/index.vue';

export const routes: MenuDataItem[] = [
  {
    name: "home",
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    meta: {
      title: "仪表盘",
      hiedInMenu: false,
    },
    children: [
      {
        name: "dashboard",
        path: "/dashboard",
        component: Home,
        meta: { title: "仪表盘", icon: "dashboard" },
      },
    ],
  },
  {
    path: "/message",
    component: Layout,
    redirect: "/message/messageManager",
    name: "消息管理",
    meta: { title: "消息管理", icon: "messageManager", hiedInMenu: false },
    children: [
      {
        path: "/message/messageManager",
        name: "消息管理",
        component: Message,
        meta: { title: "消息管理", icon: "message", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/user",
    component: Layout,
    redirect: "/about",
    name: "用户管理",
    meta: { title: "用户管理", icon: "userManager", hiedInMenu: false },
    children: [
      {
        path: "/about",
        name: "我的",
        component: User,
        meta: { title: "我的", icon: "about", hiedInMenu: false },
      },
      {
        path: "/user/userManager",
        name: "个人信息",
        component: UserManager,
        meta: { title: "个人信息", icon: "userManager", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/finance",
    component: Layout,
    redirect: "/finance/financeManager",
    name: "财务管理",
    meta: { title: "财务管理", icon: "financeManager", hiedInMenu: false },
    children: [
      {
        path: "/finance/financeManager",
        name: "财务信息",
        component: FinanceManager,
        meta: { title: "财务信息", icon: "finance", hiedInMenu: false },
        children: [
          {
            path: '/finance/financeManagerDetail',
            name: 'financeManager',
            component: FinanceManagerDetail,
        },
        ]
      },
      {
        path: "/finance/financeAnalysis",
        name: "财务分析",
        component: FinanceAnalysis,
        meta: { title: "财务分析", icon: "financeAnalysis", hiedInMenu: false },
      },
      {
        path: "/finance/accountRecordInfo",
        name: "账号管理",
        component: AccountRecordInfo,
        meta: { title: "账号管理", icon: "accountRecordInfo", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/login",
    component: Login,
    name: "login",
    meta: { title: "登录", icon: "login", hiedInMenu: false },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const title = to?.meta?.title
  if (title) {
    document.title = title as string
  }
  next()
});

router.afterEach(() => {
  // NProgress.done() // finish progress bar
});

export default router;