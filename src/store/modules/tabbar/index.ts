import { defineStore } from 'pinia';
import type { TabBarInfo } from '@/composables/useTabBar';

interface TabBarState {
	info: TabBarInfo;
}

export const useTabBarStore = defineStore('tabBar', {
	state: (): TabBarState => ({
		info: {
			visible: true,
			data: [],
			active: 0,
		},
	}),

	actions: {
		setTabBarInfo(info: Partial<TabBarInfo>) {
			this.info = { ...this.info, ...info };
		},

		setVisible(visible: boolean) {
			this.info.visible = visible;
		},
	},

	getters: {
		getTabBarInfo: (state) => state.info,
	},
});
