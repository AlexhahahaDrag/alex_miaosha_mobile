import { defineStore } from 'pinia';

interface NavBarInfo {
	title?: string;
	leftButton?: string;
	rightButton?: string;
	noShowLeft?: boolean;
	showRight?: boolean;
	leftPath?: string;
	visible?: boolean; // 控制是否显示NavBar
}

interface NavBarState {
	info: NavBarInfo;
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
		setNavBarInfo(info: NavBarInfo) {
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
