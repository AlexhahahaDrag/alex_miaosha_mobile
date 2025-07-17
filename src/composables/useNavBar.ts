import { onMounted, onUnmounted } from 'vue';
import { useNavBarStore } from '@/store/modules/navbar';

interface NavBarConfig {
	title?: string;
	leftButton?: string;
	rightButton?: string;
	noShowLeft?: boolean;
	showRight?: boolean;
	leftPath?: string;
	visible?: boolean;
	onRightClick?: () => void;
}

export function useNavBar(config?: NavBarConfig) {
	const navBarStore = useNavBarStore();

	const setNavBar = (newConfig: NavBarConfig) => {
		// 设置NavBar信息
		if (newConfig.onRightClick) {
			navBarStore.setRightClickHandler(newConfig.onRightClick);
			// 移除onRightClick，因为store不需要存储这个函数引用在info中
			const { onRightClick, ...infoConfig } = newConfig;
			navBarStore.setNavBarInfo(infoConfig);
		} else {
			navBarStore.setNavBarInfo(newConfig);
			navBarStore.setRightClickHandler(null);
		}
	};

	const hideNavBar = () => {
		navBarStore.hideNavBar();
	};

	const showNavBar = () => {
		navBarStore.showNavBar();
	};

	// 如果传入了配置，在组件挂载时设置
	onMounted(() => {
		if (config) {
			setNavBar(config);
		}
	});

	// 组件卸载时重置NavBar（可选）
	onUnmounted(() => {
		// 可以选择在这里重置NavBar，或者让下一个页面来设置
		// navBarStore.resetNavBar();
	});

	return {
		setNavBar,
		hideNavBar,
		showNavBar,
		navBarStore,
	};
}
