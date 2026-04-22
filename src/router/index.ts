import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import type { MenuDataItem } from './typing';
import Layout from '@/layouts/index.vue';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfo } from '@/store/modules/user/typing';

const modules = import.meta.glob([
	'@/views/**/**.vue',
	'!@/views/common/nav-bar/index.vue',
	'!@/views/common/tab-bar/index.vue',
]);

const pageInfo = {
	dashboard: '/src/views/home/index.vue',
	message: '/src/views/message/index.vue',
	test: '/src/views/finance/test/index.vue',
	testInfo: '/src/views/test/index.vue',
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
			title: '首页',
			hideInMenu: false,
			showInHome: false,
		},
		children: [
			{
				name: 'dashboard',
				path: '/dashboard',
				component: modules[pageInfo.dashboard],
				meta: { title: '首页', icon: 'dashboard' },
			},
		],
	},
	{
		path: '/message',
		component: Layout,
		redirect: '/message/messageManager',
		name: 'message',
		meta: {
			title: '消息管理',
			icon: 'messageManager',
			hideInMenu: false,
			showInHome: false,
		},
		children: [
			{
				path: '/message/messageManager',
				name: 'messageManager',
				component: modules[pageInfo.test],
				meta: { title: '消息管理', icon: 'message', hideInMenu: false },
			},
		],
	},
	{
		path: '/myself',
		component: Layout,
		redirect: '/myself/about',
		name: 'myself',
		meta: {
			title: '个人',
			icon: 'myself',
			hideInMenu: false,
			showInHome: false,
		},
		children: [
			{
				path: '/myself/about',
				name: 'about',
				component: modules[pageInfo.about],
				meta: { title: '个人', icon: 'about', hideInMenu: false },
			},
			{
				path: '/myself/info',
				name: 'myselfInfo',
				component: modules[pageInfo.myself],
				meta: { title: '个人信息', icon: 'userManager', hideInMenu: false },
			},
		],
	},
	{
		path: '/login',
		component: modules[pageInfo.login],
		name: 'login',
		meta: {
			title: '登录',
			icon: 'login',
			hideInMenu: false,
			showInHome: false,
		},
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

let dynamicRouter = [] as RouteRecordRaw[];
let isAdded = false;

router.beforeEach((to, _from) => {
	const userStore = useUserStore();
	if (to.path == '/login') {
		isAdded = false;
		return true;
	}

	if (userStore.getToken) {
		if (!userStore.getRouteStatus || !isAdded) {
			dynamicRouter = [];
			addRouter();
			isAdded = true;
			if (routes.length > 5) {
				return { ...to, replace: true };
			}
		}
		return true;
	}
	return { name: 'login' };
});

const addRouter = () => {
	const userStore = useUserStore();
	if (userStore.getMenuInfo?.length) {
		const roleInfo = userStore.getRoleInfo;
		if (roleInfo?.roleCode !== 'super_super' && !roleInfo?.permissionList?.length) {
			userStore.changeRouteStatus(true);
			return;
		}
		userStore.getMenuInfo.forEach((item: MenuInfo) => {
			if (judgePermission(roleInfo?.permissionList, item?.permissionCode, roleInfo.roleCode)) {
				const newRouter = getChildren(item, roleInfo?.permissionList, roleInfo.roleCode);
				if (newRouter.name && !router.hasRoute(newRouter.name)) {
					router.addRoute(newRouter);
					dynamicRouter.push(newRouter);
					routes.push(newRouter);
				}
			}
		});
	}
	userStore.changeRouteStatus(true);
};

interface PermissionItem {
	permissionCode: string;
	[key: string]: any;
}

const getChildren = (
	item: MenuInfo,
	permissionList: PermissionItem[] | undefined,
	roleCode: string,
): MenuDataItem => {
	const component =
		item.component == null
			? modules[pageInfo[404]]
			: 'Layout' === item.component
				? Layout
				: modules[item.component];
	const routeInfo: MenuDataItem = {
		path: item.path,
		component,
		redirect: item.redirect,
		name: item.name,
		meta: {
			title: item.title,
			icon: item.icon,
			hideInMenu: item.hideInMenu != '0',
			showInHome: item.showInHome == '1',
			permissionCode: item.permissionCode,
		},
		children: [],
	};
	if (item?.children?.length) {
		item.children.forEach((childItem: MenuInfo) => {
			if (judgePermission(permissionList, childItem?.permissionCode, roleCode)) {
				const cur = getChildren(childItem, permissionList, roleCode);
				if (routeInfo.name && !router.hasRoute(routeInfo.name)) {
					routeInfo.children?.push(cur);
				}
			}
		});
	}
	return routeInfo;
};

router.afterEach(() => {});

const judgePermission = (
	permissionList: PermissionItem[] | undefined,
	permissionCode: string,
	roleCode: string,
) => {
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
		if (route.name) {
			router.removeRoute(route.name);
			const index = routes.findIndex((item) => item.name === route.name);
			if (index > -1) {
				routes.splice(index, 1);
			}
		}
	});
	dynamicRouter = []; // 清空引用
};

export default router;
