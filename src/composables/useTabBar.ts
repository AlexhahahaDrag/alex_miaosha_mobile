import { onActivated, onMounted } from 'vue';
import { useTabBarStore } from '@/store/modules/tabbar';

export interface TabBarItem {
	title: string;
	icon: string;
	to?: string;
	name: string;
}

export interface TabBarInfo {
	visible?: boolean;
	data?: string[];
	active?: number | string;
}

export const useTabBar = (config: Partial<TabBarInfo>) => {
	const tabBarStore = useTabBarStore();
	const updateTabBar = () => {
		console.log('set config gggggggggggg:', config);
		tabBarStore.setTabBarInfo(config);
	};

	onMounted(() => {
		updateTabBar();
	});

	onActivated(() => {
		updateTabBar();
	});
};
