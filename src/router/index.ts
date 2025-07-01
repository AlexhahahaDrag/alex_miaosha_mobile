import { MenuDataItem } from './typing';
import Layout from '@/layouts/index.vue';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfo } from '@/store/modules/user/typing';
import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

const modules = import.meta.glob('@/views/**/**.vue');

const pageInfo = {
  dashboard: '/src/views/home/index.vue',
  message: '/src/views/message/index.vue',
  test: '/src/views/finance/test/index.vue',
  consumptionCard: '/src/views/test/index.vue',
  about: '/src/views/user/index.vue',
  myself: '/src/views/user/userManager/index.vue',
  login: '/src/views/login/index.vue',
  '404': '/src/views/common/error/404.vue',
};

export const routes: MenuDataItem[] = [
  {
    name: 'home',
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      title: '仪表盘',
      hiedInMenu: false,
      showInHome: false,
    },
    children: [
      {
        name: 'dashboard',
        path: '/dashboard',
        component: modules[pageInfo.dashboard],
        meta: { title: '仪表盘', icon: 'dashboard' },
      },
    ],
  },
  {
    path: '/message',
    component: Layout,
    redirect: '/message/messageManager',
    name: 'message',
    meta: { title: '消息管理', icon: 'messageManager', hiedInMenu: false, showInHome: false },
    children: [
      {
        path: '/message/messageManager',
        name: 'messageManager',
        component: modules[pageInfo.test],
        meta: { title: '消息管理', icon: 'message', hiedInMenu: false },
      },
    ],
  },
  {
    path: '/myself',
    component: Layout,
    redirect: '/myself/about',
    name: 'myself',
    meta: { title: '我的', icon: 'myself', hiedInMenu: false, showInHome: false },
    children: [
      {
        path: '/myself/about',
        name: 'about',
        component: modules[pageInfo.about],
        meta: { title: '我的', icon: 'about', hiedInMenu: false },
      },
      {
        path: '/myself/info',
        name: 'myselfInfo',
        component: modules[pageInfo.myself],
        meta: { title: '个人信息', icon: 'userManager', hiedInMenu: false },
      },
    ],
  },
  {
    path: '/login',
    component: modules[pageInfo.login],
    name: 'login',
    meta: { title: '登录', icon: 'login', hiedInMenu: false, showInHome: false },
  },
  {
    path: '/:catchAll(.*)',
    component: modules[pageInfo[404]],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

let dynamicRouter = [] as any[];

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  if (to.path == '/login') {
    next();
  } else if (userStore.getToken) {
    if (!userStore.getRouteStatus || routes.length <= 5) {
      dynamicRouter = [];
      addRouter();
      next({ ...to, replace: true });
    } else {
      next();
    }
  } else {
    next({ name: 'login' });
  }
  console.log(`router:`, router.options.routes);
});

const addRouter = () => {
  const userStore = useUserStore();
  if (userStore.getMenuInfo?.length) {
    let roleInfo = userStore.getRoleInfo;
    if (roleInfo?.roleCode !== 'super_super' && !roleInfo?.permissionList?.length) {
      return;
    }
    userStore.getMenuInfo.forEach((item: MenuInfo) => {
      if (judgePermission(roleInfo?.permissionList, item?.permissionCode, roleInfo.roleCode)) {
        let newRouter = getChildren(item, roleInfo?.permissionList, roleInfo.roleCode);
        if (!router.hasRoute(newRouter.name)) {
          router.addRoute(newRouter);
          dynamicRouter.push(newRouter);
          routes.push(newRouter);
        }
      }
    });
    userStore.changeRouteStatus(true);
  }
};

const getChildren = (item: MenuInfo, permissionList: any[], roleCode: string): any => {
  let component =
    item.component == null
      ? modules[pageInfo[404]]
      : 'Layout' === item.component
      ? Layout
      : modules[item.component];
  let routeInfo: RouteRecordRaw = {
    path: item.path,
    component: component,
    redirect: item.redirect,
    name: item.name,
    meta: {
      title: item.title,
      icon: item.icon,
      hiedInMenu: item.hideInMenu != '0',
      showInHome: item.showInHome == '1',
      permissionCode: item.permissionCode,
    },
    children: [],
  };
  if (item?.children?.length) {
    item.children.forEach((childItem: any) => {
      if (judgePermission(permissionList, childItem?.permissionCode, roleCode)) {
        let cur = getChildren(childItem, permissionList, roleCode);
        if (!router.hasRoute(routeInfo?.name || '')) {
          routeInfo.children?.push(cur);
        }
      }
    });
  }
  return routeInfo;
};

router.afterEach(() => {});

const judgePermission = (permissionList: any[], permissionCode: string, roleCode: string) => {
  if (roleCode === 'super_super') {
    return true;
  }
  if (!permissionList?.length) {
    return false;
  }
  for (const item of permissionList) {
    if (item?.permissionCode === permissionCode) {
      return true;
    }
  }
  return false;
};

export const refreshRouter = () => {
  dynamicRouter.forEach((route) => {
    router.removeRoute(route.name);
    let index = routes.findIndex((item) => item.name === route.name);
    if (index > -1) {
      routes.splice(index);
    }
  });
  dynamicRouter = []; // 清空引用
};

export default router;
