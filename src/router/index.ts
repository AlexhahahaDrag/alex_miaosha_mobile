import { MenuDataItem } from './typing'
import Message from '@/views/message/index.vue';
import Layout from '@/layouts/index.vue';
import Home from '@/views/home/index.vue';
import User from '@/views/user/index.vue';
import Login from '@/views/login/index.vue'
import UserManager from '@/views/user/userManager/index.vue';
import { useUserStore } from "@/store/modules/user/user";
import type { MenuInfo } from "@/store/modules/user/typing";
import Error404 from '@/views/common/error/404.vue';
import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

const modules = import.meta.glob("@/views/**/**.vue");

export const routes: MenuDataItem[] = [
  {
    name: "home",
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    meta: {
      title: "仪表盘",
      hiedInMenu: false,
      showInHome: false,
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
    name: "message",
    meta: { title: "消息管理", icon: "messageManager", hiedInMenu: false, showInHome: false, },
    children: [
      {
        path: "/message/messageManager",
        name: "messageManager",
        component: Message,
        meta: { title: "消息管理", icon: "message", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/myself",
    component: Layout,
    redirect: "/myself/about",
    name: "myself",
    meta: { title: "我的", icon: "myself", hiedInMenu: false, showInHome: false, },
    children: [
      {
        path: "/myself/about",
        name: "about",
        component: User,
        meta: { title: "我的", icon: "about", hiedInMenu: false },
      },
      {
        path: "/myself/info",
        name: "myselfInfo",
        component: UserManager,
        meta: { title: "个人信息", icon: "userManager", hiedInMenu: false },
      },
    ],
  },
  {
    path: "/login",
    component: Login,
    name: "login",
    meta: { title: "登录", icon: "login", hiedInMenu: false, showInHome: false, },
  },
  {
    path: '/:catchAll(.*)',
    component: () => import("@/views/common/error/404.vue")
  }
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
      next({ ...to, replace: true })
    } else {
      next();
    }
  } else {
    next({ name: 'login' });
  }
});

const addRouter = () => {
  const userStore = useUserStore();
  if (userStore.menuInfo?.length) {
    let roleInfo = userStore.getRoleInfo;
    if (roleInfo?.roleCode !== 'super_super' && !roleInfo?.permissionList?.length) {
      return;
    }
    userStore.menuInfo.forEach((item: MenuInfo) => {
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
  let component = item.component == null ? Error404 : 
    ("Layout" === item.component ? Layout : 
      modules[item.component]);
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
        if (!router.hasRoute(routeInfo?.name|| '')) {
          routeInfo.children?.push(cur);
        }
      }
    });
  }
  return routeInfo;
};

router.afterEach(() => {
});

const judgePermission = (permissionList: any[], permissionCode: string,  roleCode: string) => {
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
}

export const refreshRouter = () => {
  dynamicRouter.forEach(route => {
    router.removeRoute(route.name);
    let index = routes.findIndex(item => item.name === route.name);
    if(index >-1) {
      routes.splice(index);
    }
  });
  dynamicRouter = []; // 清空引用
}

export default router;