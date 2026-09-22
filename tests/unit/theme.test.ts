import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { useThemeStore, DEFAULT_PRIMARY_COLOR } from '@/store/modules/theme';

// 为测试环境注入 ref
(globalThis as any).ref = ref;

describe('mobile theme store', () => {
	const classList = new Set<string>();
	const styleProps = new Map<string, string>();

	beforeEach(() => {
		setActivePinia(createPinia());
		classList.clear();
		styleProps.clear();

		(globalThis as any).document = {
			documentElement: {
				classList: {
					add: (cls: string) => classList.add(cls),
					remove: (cls: string) => classList.delete(cls),
					toggle: (cls: string, force?: boolean) => {
						const shouldHave = force !== undefined ? force : !classList.has(cls);
						if (shouldHave) classList.add(cls);
						else classList.delete(cls);
						return shouldHave;
					},
					contains: (cls: string) => classList.has(cls),
				},
				style: {
					setProperty: (key: string, val: string) => styleProps.set(key, val),
					getPropertyValue: (key: string) => styleProps.get(key) || '',
				},
			},
		};
	});

	afterEach(() => {
		delete (globalThis as any).document;
	});

	it('should initialize with default primary color and light mode', () => {
		const themeStore = useThemeStore();
		expect(themeStore.primaryColor).toBe(DEFAULT_PRIMARY_COLOR);
		expect(themeStore.isDark).toBe(false);
	});

	it('should set primary color and update CSS variable', () => {
		const themeStore = useThemeStore();
		themeStore.setPrimaryColor('#07c160');
		expect(themeStore.primaryColor).toBe('#07c160');
		expect(styleProps.get('--primary-color')).toBe('#07c160');
		expect(styleProps.get('--van-primary-color')).toBe('#07c160');
	});

	it('should toggle dark mode and update html class', () => {
		const themeStore = useThemeStore();
		themeStore.toggleDark(true);
		expect(themeStore.isDark).toBe(true);
		expect(classList.has('dark')).toBe(true);
		expect(classList.has('van-theme-dark')).toBe(true);

		themeStore.toggleDark(false);
		expect(themeStore.isDark).toBe(false);
		expect(classList.has('dark')).toBe(false);
		expect(classList.has('van-theme-dark')).toBe(false);
	});

	it('should sync document state on initTheme', () => {
		const themeStore = useThemeStore();
		themeStore.setPrimaryColor('#7232dd');
		themeStore.toggleDark(true);

		classList.clear();
		styleProps.clear();

		themeStore.initTheme();
		expect(styleProps.get('--primary-color')).toBe('#7232dd');
		expect(styleProps.get('--van-primary-color')).toBe('#7232dd');
		expect(classList.has('dark')).toBe(true);
		expect(classList.has('van-theme-dark')).toBe(true);
	});
});
