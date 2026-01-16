import { defineStore } from 'pinia';
import type { NavBarConfig } from '@/composables/useNavBar';

interface NavBarState {
	info: NavBarConfig;
	rightClickHandler: (() => void) | null;
}

export const useNavBarStore = defineStore('navbar', {
	state: (): NavBarState => ({
		info: {
			title: '',
			noShowLeft: false,
			showRight: false,
			visible: true,
		},
		rightClickHandler: null,
	}),

	actions: {
		setNavBarInfo(info: NavBarConfig) {
			this.info = { ...this.info, ...info };
		},

		setRightClickHandler(handler: (() => void) | null) {
			this.rightClickHandler = handler;
		},

		hideNavBar() {
			this.info.visible = false;
		},

		showNavBar() {
			this.info.visible = true;
		},

		resetNavBar() {
			this.info = {
				title: '',
				noShowLeft: false,
				showRight: false,
				visible: true,
			};
			this.rightClickHandler = null;
		},
	},

	getters: {
		getNavBarInfo: (state) => state.info,
		getRightClickHandler: (state) => state.rightClickHandler,
	},
});
