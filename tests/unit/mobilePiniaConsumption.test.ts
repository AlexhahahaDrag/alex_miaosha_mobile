import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia , storeToRefs } from 'pinia';
import { toRaw } from 'vue';
import { useNavBarStore } from '@/store/modules/navbar';
import { useTabBarStore } from '@/store/modules/tabbar';
import { useUserStore } from '@/store/modules/user/user';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 隔离 Node 单测环境下对路由及 .vue 布局组件的级联解析
vi.mock('@/router', () => ({
	router: { addRoute: vi.fn(), hasRoute: vi.fn() },
}));

describe('移动端 Pinia 消费规范与深拷贝防污染测试 (vuejs-skills)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	describe('1. 导航与底栏 Store 的 storeToRefs 响应式解构', () => {
		it('navBarStore 经 storeToRefs 解构后，修改状态自动同步响应', () => {
			const navBarStore = useNavBarStore();
			const { getNavBarInfo: navBarInfo, getRightClickHandler } = storeToRefs(navBarStore);

			expect(navBarInfo.value.title).toBe('');
			expect(getRightClickHandler.value).toBeNull();

			// 更新导航栏状态
			navBarStore.setNavBarInfo({ title: '随礼明细', visible: true });
			expect(navBarInfo.value.title).toBe('随礼明细');
			expect(navBarInfo.value.visible).toBe(true);

			// 隐藏导航栏
			navBarStore.hideNavBar();
			expect(navBarInfo.value.visible).toBe(false);
		});

		it('tabBarStore 经 storeToRefs 解构后，路由切换激活态响应式联动', () => {
			const tabBarStore = useTabBarStore();
			const { getTabBarInfo: tabBarInfo } = storeToRefs(tabBarStore);

			expect(tabBarInfo.value.active).toBe(0);

			tabBarStore.setTabBarInfo({ active: 2 });
			expect(tabBarInfo.value.active).toBe(2);
		});
	});

	describe('2. 移动端菜单树深拷贝防污染 (toRaw + structuredClone)', () => {
		it('路由注册前对 menuInfo 执行 structuredClone(toRaw(...)) 确保无副作用', () => {
			const userStore = useUserStore();
			const mockMenuTree: MenuInfoData[] = [
				{
					id: '2001',
					name: 'mobile-finance',
					title: '移动财务',
					path: '/finance',
					children: [
						{
							id: '2002',
							name: 'mobile-gift',
							title: '移动随礼',
							path: '/finance/gift',
							children: [],
						},
					],
				},
			];

			userStore.setMenuInfo(mockMenuTree);

			// 模拟移动端 addRouter 中的深拷贝保护（通过 toRaw 剥离 Proxy）
			const clonedMenus: MenuInfoData[] = structuredClone(toRaw(userStore.getMenuInfo!));

			// 修改副本子节点
			clonedMenus[0].title = '篡改后的移动标题';
			clonedMenus[0].children![0].title = '篡改后的子页面';

			// 断言 Store 内原数据未被污染
			const original = userStore.getMenuInfo!;
			expect(original[0].title).toBe('移动财务');
			expect(original[0].children![0].title).toBe('移动随礼');
		});
	});
});
