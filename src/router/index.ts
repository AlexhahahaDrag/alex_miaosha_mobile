import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import type { MenuDataItem } from './typing';
import Layout from '@/layouts/index.vue';
import { useUserStore } from '@/store/modules/user/user';
import { canAccessRoutePermission, type RouteAccessOptions } from '@/utils/permission';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

const modules = import.meta.glob([
	'@/views/**/**.vue',
	'!@/views/common/nav-bar/index.vue',
	'!@/views/common/tab-bar/index.vue',
]);

const pageInfo = {
	dashboard: '/src/views/home/index.vue',
	message: '/src/views/message/index.vue',
	about: '/src/views/user/index.vue',
	myself: '/src/views/user/userManager/index.vue',
	login: '/src/views/login/index.vue',
	'404': '/src/views/common/error/404.vue',
};

const fallbackView = modules[pageInfo['404']];

const resolveViewComponent = (componentPath?: string | null) => {
	if (!componentPath) {
		return fallbackView;
	}

	if (componentPath === 'Layout') {
		return Layout;
	}

	return modules[componentPath] ?? fallbackView;
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
				component: resolveViewComponent(pageInfo.dashboard),
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
				component: resolveViewComponent(pageInfo.message),
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
			title: '我的',
			icon: 'myself',
			hideInMenu: false,
			showInHome: false,
		},
		children: [
			{
				path: '/myself/about',
				name: 'about',
				component: resolveViewComponent(pageInfo.about),
				meta: { title: '我的', icon: 'about', hideInMenu: false },
			},
			{
				path: '/myself/info',
				name: 'myselfInfo',
				component: resolveViewComponent(pageInfo.myself),
				meta: { title: '个人信息', icon: 'userManager', hideInMenu: false },
			},
		],
	},
	{
		path: '/login',
		component: resolveViewComponent(pageInfo.login),
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
		component: fallbackView,
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

const buildRouteAccess = (userStore: ReturnType<typeof useUserStore>): RouteAccessOptions => {
	const roleInfo = userStore.getRoleInfo;
	return {
		superAdmin: userStore.getSuperAdmin,
		permissionCodes: userStore.getPermissionCodes,
		roleCode: getRoleCode(roleInfo),
		permissionList: getPermissionList(roleInfo),
	};
};

const hasAnyRouteAccess = (access: RouteAccessOptions): boolean =>
	access.superAdmin ||
	access.roleCode === 'super_super' ||
	!!access.permissionCodes.length ||
	!!access.permissionList?.length;

const addRouter = () => {
	const userStore = useUserStore();
	if (userStore.getMenuInfo?.length) {
		const access = buildRouteAccess(userStore);
		if (!hasAnyRouteAccess(access)) {
			userStore.changeRouteStatus(true);
			return;
		}
		userStore.getMenuInfo.forEach((item: MenuInfoData) => {
			if (judgePermission(getStringField(item, 'permissionCode'), access)) {
				const newRouter = getChildren(item, access);
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
	permissionCode?: string;
	[key: string]: unknown;
}

const getStringField = (value: unknown, key: string): string => {
	if (!value || typeof value !== 'object') return '';
	const cur = (value as Record<string, unknown>)[key];
	return typeof cur === 'string' ? cur : '';
};

const getChildrenField = (value: unknown): MenuInfoData[] => {
	if (!value || typeof value !== 'object') return [];
	const children = (value as Record<string, unknown>).children;
	return Array.isArray(children) ? (children as MenuInfoData[]) : [];
};

const getRoleCode = (roleInfo: unknown): string => getStringField(roleInfo, 'roleCode');

const getPermissionList = (roleInfo: unknown): PermissionItem[] => {
	if (!roleInfo || typeof roleInfo !== 'object') return [];
	const list = (roleInfo as Record<string, unknown>).permissionList;
	return Array.isArray(list) ? (list as PermissionItem[]) : [];
};

const getChildren = (item: MenuInfoData, access: RouteAccessOptions): MenuDataItem => {
	const path = getStringField(item, 'path');
	const component = getStringField(item, 'component');
	const redirect = getStringField(item, 'redirect');
	const name = getStringField(item, 'name');
	const title = getStringField(item, 'title');
	const icon = getStringField(item, 'icon');
	const hideInMenu = getStringField(item, 'hideInMenu');
	const showInHome = getStringField(item, 'showInHome');
	const permissionCode = getStringField(item, 'permissionCode');

	const routeInfo: MenuDataItem = {
		path,
		component: resolveViewComponent(component),
		redirect,
		name,
		meta: {
			title,
			icon,
			hideInMenu: hideInMenu != '0',
			showInHome: showInHome == '1',
			permissionCode,
		},
		children: [],
	};
	const children = getChildrenField(item);
	if (children.length) {
		children.forEach((childItem: MenuInfoData) => {
			if (judgePermission(getStringField(childItem, 'permissionCode'), access)) {
				const cur = getChildren(childItem, access);
				if (cur.name && !router.hasRoute(cur.name)) {
					routeInfo.children?.push(cur);
				}
			}
		});
	}
	return routeInfo;
};

router.afterEach(() => {});

const judgePermission = (permissionCode: string | undefined, access: RouteAccessOptions) =>
	canAccessRoutePermission(permissionCode, access);

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
	dynamicRouter = [];
};

export default router;
