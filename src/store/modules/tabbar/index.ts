import { defineStore } from 'pinia';
import type { TabBarInfo } from '@/composables/useTabBar';

interface TabBarState {
	info: TabBarInfo;
}

export const useTabBarStore = defineStore('tabBar', {
	state: (): TabBarState => ({
		info: {
			visible: false,
			data: [],
			active: 0,
			badges: {},
		},
	}),

	actions: {
		setTabBarInfo(info: Partial<TabBarInfo>) {
			this.info = { ...this.info, ...info };
		},

		setVisible(visible: boolean) {
			this.info.visible = visible;
		},

		setTabBadge(name: string, badge: number | string) {
			this.info.badges = {
				...(this.info.badges || {}),
				[name]: badge,
			};
		},
	},

	getters: {
		getTabBarInfo: (state) => state.info,
	},
});
