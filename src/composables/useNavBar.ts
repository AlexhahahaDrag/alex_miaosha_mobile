import { getCurrentScope, onScopeDispose, type MaybeRefOrGetter } from 'vue';
import { useNavBarStore } from '@/store/modules/navbar';

export interface NavBarConfig {
	title?: string;
	leftButton?: string;
	rightButton?: string;
	rightIcon?: string;
	noShowLeft?: boolean;
	showRight?: boolean;
	leftPath?: string;
	visible?: boolean;
	onRightClick?: () => void;
}

export function useNavBar(config?: MaybeRefOrGetter<NavBarConfig | undefined>) {
	const navBarStore = useNavBarStore();

	const setNavBar = (newConfig: NavBarConfig) => {
		// 如果没有传值则默认为true
		if (newConfig.noShowLeft === undefined) {
			newConfig.noShowLeft = false;
		}
		if (newConfig.rightButton === undefined) {
			newConfig.rightButton = '';
		}
		if (newConfig.rightIcon === undefined) {
			newConfig.rightIcon = '';
		}
		// 设置NavBar信息
		if (newConfig.onRightClick) {
			navBarStore.setRightClickHandler(newConfig.onRightClick);
			// 移除onRightClick，因为store不需要存储这个函数引用在info中
			const { ...infoConfig } = newConfig;
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

	// 响应式监听配置变化（兼容静态配置、Ref 或 Getter 函数）
	if (config !== undefined) {
		watchEffect(() => {
			const resolved = toValue(config);
			if (resolved) {
				setNavBar(resolved);
			}
		});
	}

	// 生命周期闭环：作用域销毁时重置右侧事件句柄，杜绝悬挂闭包导致内存泄漏
	if (getCurrentScope()) {
		onScopeDispose(() => {
			navBarStore.setRightClickHandler(null);
		});
	}

	return {
		setNavBar,
		hideNavBar,
		showNavBar,
		navBarStore,
	};
}
