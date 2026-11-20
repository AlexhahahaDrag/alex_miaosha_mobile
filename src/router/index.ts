import { markRaw } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';
import { showFailToast } from 'vant';
import type { MenuDataItem } from './typing';
import Layout from '@/layouts/index.vue';
import { useUserStore } from '@/store/modules/user/user';
import { canAccessRoutePermission, type RouteAccessOptions } from '@/utils/permission';
import { getUserMenusApi } from '@/views/login/api';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

const modules = import.meta.glob('@/views/**/**.vue');

const pageInfo = {
	dashboard: '/src/views/home/index.vue',
	message: '/src/views/message/index.vue',
	about: '/src/views/user/index.vue',
	myself: '/src/views/user/userManager/index.vue',
	login: '/src/views/login/index.vue',
	'404': '/src/views/error/404.vue',
};

const fallbackView = modules[pageInfo['404']];

const resolveRawComponentPath = (component: string): string => {
	if (component.startsWith('/src/')) {
		return component;
	}
	if (component.startsWith('/')) {
		return `/src${component}`;
	}
	return `/src/views/${component}`;
};

const resolveViewComponent = (componentPath?: string | null) => {
	if (!componentPath) {
		return markRaw(fallbackView);
	}

	if (componentPath === 'Layout') {
		return markRaw(Layout);
	}

	const rawPath = resolveRawComponentPath(componentPath);

	// 向后兼容归一化：将正式环境老数据库中的 /src/views/finance/ 路径无缝映射到现有的 /src/views/selfFinance/，彻底杜绝 404
	const path = rawPath
		.replace('/src/views/finance/financeManager', '/src/views/selfFinance/financeManager')
		.replace('/src/views/finance/financeAnalysis', '/src/views/selfFinance/financeAnalysis')
		.replace('/src/views/finance/accountRecordInfo', '/src/views/selfFinance/accountRecordInfo');

	const comp = modules[path] ?? modules[rawPath] ?? modules[componentPath] ?? fallbackView;
	return typeof comp === 'object' && comp !== null ? markRaw(comp) : comp;
};

export const routes: MenuDataItem[] = [
	{
		name: 'home',
		path: '/',
		component: markRaw(Layout),
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

const BASE_ROUTE_COUNT = routes.length;
const BASE_ROUTE_NAMES = new Set<string>([
	'home',
	'dashboard',
	'message',
	'messageManager',
	'myself',
	'about',
	'myselfInfo',
	'login',
]);

export const routesVersion = ref<number>(0);

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

let dynamicRouter = [] as RouteRecordRaw[];
let menuLoadPromise: Promise<boolean> | null = null;

const removeDynamicRoutesFromRouter = () => {
	dynamicRouter.forEach((route) => {
		if (route.name && router.hasRoute(route.name)) {
			router.removeRoute(route.name);
		}
	});
	// 兜底清除可能残留的非底座命名路由，防止 router.hasRoute 误判导致 routes.push 被跳过
	router.getRoutes().forEach((record) => {
		if (record.name && !BASE_ROUTE_NAMES.has(String(record.name)) && router.hasRoute(record.name)) {
			router.removeRoute(record.name);
		}
	});
	dynamicRouter = [];
};

const ensureMenusLoaded = async (userStore: ReturnType<typeof useUserStore>): Promise<boolean> => {
	if (userStore.getMenuInfo?.length) {
		return true;
	}
	if (!menuLoadPromise) {
		menuLoadPromise = (async () => {
			try {
				const { code, data, message: messageInfo } = await getUserMenusApi();
				if (code == '200' && data?.length) {
					userStore.setMenuInfo(data);
					return true;
				}
				showFailToast(messageInfo || '加载菜单失败');
				userStore.resetState();
				return false;
			} catch (error: unknown) {
				console.error('加载用户菜单失败：', error);
				showFailToast('加载菜单失败，请重新登录');
				userStore.resetState();
				return false;
			} finally {
				menuLoadPromise = null;
			}
		})();
	}
	return menuLoadPromise;
};

router.beforeEach(async (to) => {
	const userStore = useUserStore();
	if (to.path == '/login') {
		if (userStore.getToken) {
			return { path: '/' };
		}
		return true;
	}

	if (userStore.getToken) {
		if (!userStore.getRouteStatus || routes.length <= BASE_ROUTE_COUNT) {
			const loaded = await ensureMenusLoaded(userStore);
			if (!loaded) {
				return { name: 'login' };
			}
			addRouter();
			if (routes.length > BASE_ROUTE_COUNT) {
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
	removeDynamicRoutesFromRouter();
	routes.splice(BASE_ROUTE_COUNT);
	const userStore = useUserStore();
	if (userStore.getMenuInfo?.length) {
		const access = buildRouteAccess(userStore);
		if (!hasAnyRouteAccess(access)) {
			userStore.changeRouteStatus(true);
			routesVersion.value += 1;
			return;
		}
		const clonedMenus: MenuInfoData[] = structuredClone(toRaw(userStore.getMenuInfo));
		clonedMenus.forEach((item: MenuInfoData) => {
			if (judgePermission(getStringField(item, 'permissionCode'), access)) {
				const newRouter = getChildren(item, access);
				if (newRouter.name) {
					if (router.hasRoute(newRouter.name)) {
						router.removeRoute(newRouter.name);
					}
					router.addRoute(newRouter);
					dynamicRouter.push(newRouter);
					routes.push(newRouter);
				}
			}
		});
	}
	userStore.changeRouteStatus(true);
	routesVersion.value += 1;
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
					if (getStringField(childItem, 'component') !== 'Layout' && cur.children?.length) {
						const nestedRoutes = cur.children.splice(0);
						routeInfo.children?.push(...nestedRoutes);
					}
				}
			}
		});
	}
	return routeInfo;
};

router.afterEach(() => {});

router.onError((error) => {
	console.error('路由导航异常：', error);
	showFailToast('页面加载失败，请刷新重试');
});

const judgePermission = (permissionCode: string | undefined, access: RouteAccessOptions) =>
	canAccessRoutePermission(permissionCode, access);

export const refreshRouter = () => {
	removeDynamicRoutesFromRouter();
	routes.splice(BASE_ROUTE_COUNT);
	useUserStore().changeRouteStatus(false);
	routesVersion.value += 1;
};

export default router;
