import { createRouter, createWebHashHistory } from 'vue-router'
import { MenuDataItem } from './typing'
import Message from '@/views/message/index.vue';
import Layout from '@/layouts/index.vue';
import Home from '@/views/home/index.vue';
import User from '@/views/user/index.vue';

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
    redirect: "/user/userManager",
    name: "用户管理",
    meta: { title: "用户管理", icon: "userManager", hiedInMenu: false },
    children: [
      {
        path: "/user/userManager",
        name: "用户管理",
        component: User,
        meta: { title: "用户信息", icon: "user", hiedInMenu: false },
      },
    ],
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