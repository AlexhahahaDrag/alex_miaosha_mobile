import Layout from "@/layout/index.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { MenuDataItem } from "./typing";
import Dashboard from '@/views/dashboard/index.vue';

export const routes: MenuDataItem[] = [
  {
    name: "home",
    path: "/",
    redirect: "/dashboard/welcome",
    component: Layout,
    meta: {
      title: "仪表盘",
      hiedInMenu: false,
    },
    children: [
      {
        path: "/dashboard/welcome",
        component: Dashboard,
        meta: { title: "仪表盘", icon: "dashboard" },
      },
    ],
  },
];
  
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  });
  
  router.beforeEach((to, from, next)  => {
    // const userStore = useUserStore();
    // NProgress.start(); // start progress bar
    // if (to.path=='/login' || userStore.getToken) {
    //   next();
    //   console.log('from' + from)
    // } else {
    //   next({ name: 'login' });
    // }
  });

  router.afterEach(() => {
    // NProgress.done() // finish progress bar
  });

  export default router;