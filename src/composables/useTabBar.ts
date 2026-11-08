import { useTabBarStore } from '@/store/modules/tabbar';

export interface TabBarItem {
	title: string;
	icon: string;
	to?: string;
	name: string;
}

export interface TabBarItemConfig {
	name: string;
	title?: string;
	icon?: string;
}

export interface TabBarInfo {
	visible?: boolean;
	data?: (string | TabBarItemConfig)[];
	active?: number | string;
	badges?: Record<string, number | string>;
}

export const useTabBar = (config?: Partial<TabBarInfo>) => {
	const tabBarStore = useTabBarStore();
	const updateTabBar = () => {
		if (config) {
			tabBarStore.setTabBarInfo(config);
		}
	};

	onMounted(() => {
		updateTabBar();
	});

	onActivated(() => {
		updateTabBar();
	});

	return {
		setTabBarVisible: (visible: boolean) => tabBarStore.setVisible(visible),
		setTabBarInfo: (info: Partial<TabBarInfo>) => tabBarStore.setTabBarInfo(info),
	};
};
