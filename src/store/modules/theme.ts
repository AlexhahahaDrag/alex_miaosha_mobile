import { defineStore } from 'pinia';

export const DEFAULT_PRIMARY_COLOR = '#1989fa';

export const useThemeStore = defineStore(
	'theme',
	() => {
		const primaryColor = ref<string>(DEFAULT_PRIMARY_COLOR);
		const isDark = ref<boolean>(false);

		const setPrimaryColor = (color: string) => {
			if (!color) return;
			primaryColor.value = color;
			if (typeof document !== 'undefined') {
				document.documentElement.style.setProperty('--primary-color', color);
				document.documentElement.style.setProperty('--van-primary-color', color);
			}
		};

		const toggleDark = (val?: boolean) => {
			isDark.value = val !== undefined ? val : !isDark.value;
			if (typeof document !== 'undefined') {
				document.documentElement.classList.toggle('dark', isDark.value);
				document.documentElement.classList.toggle('van-theme-dark', isDark.value);
			}
		};

		const initTheme = () => {
			if (typeof document !== 'undefined') {
				document.documentElement.style.setProperty('--primary-color', primaryColor.value);
				document.documentElement.style.setProperty('--van-primary-color', primaryColor.value);
				document.documentElement.classList.toggle('dark', isDark.value);
				document.documentElement.classList.toggle('van-theme-dark', isDark.value);
			}
		};

		return {
			primaryColor,
			isDark,
			setPrimaryColor,
			toggleDark,
			initTheme,
		};
	},
	{
		persist: {
			key: 'app-mobile-theme',
			storage: typeof window !== 'undefined' ? window.localStorage : undefined,
		},
	},
);
