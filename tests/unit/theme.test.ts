import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref, computed } from 'vue';
import {
	useThemeStore,
	DEFAULT_PRIMARY_COLOR,
	MALE_DEFAULT_COLOR,
	FEMALE_DEFAULT_COLOR,
	NEUTRAL_LOGIN_COLOR,
	deriveThemeTokens,
} from '@/store/modules/theme';

// 为测试环境注入 ref / computed
(globalThis as any).ref = ref;
(globalThis as any).computed = computed;

describe('mobile theme store & --xxx CSS Design Tokens', () => {
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

	it('should initialize with default primary color, light mode and auto-gender mode', () => {
		const themeStore = useThemeStore();
		expect(themeStore.primaryColor).toBe(DEFAULT_PRIMARY_COLOR);
		expect(themeStore.isDark).toBe(false);
		expect(themeStore.themeMode).toBe('auto-gender');
	});

	it('should set primary color and inject full --xxx CSS tokens to :root', () => {
		const themeStore = useThemeStore();
		themeStore.setPrimaryColor('#8b5cf6');
		expect(themeStore.primaryColor).toBe('#8b5cf6');
		expect(themeStore.themeMode).toBe('custom');
		expect(styleProps.get('--primary-color')).toBe('#8b5cf6');
		expect(styleProps.get('--van-primary-color')).toBe('#8b5cf6');
		expect(styleProps.get('--theme-primary-rgb')).toBe('139, 92, 246');
		expect(styleProps.get('--theme-soft-bg')).toBe('rgba(139, 92, 246, 0.12)');
		expect(styleProps.get('--theme-border-color')).toBe('rgba(139, 92, 246, 0.28)');
		expect(styleProps.get('--theme-shadow-color')).toBe('rgba(139, 92, 246, 0.32)');
		expect(styleProps.get('--theme-hero-gradient')).toContain('#8b5cf6');
		expect(styleProps.get('--theme-btn-gradient')).toContain('linear-gradient');
	});

	it('should apply gender default theme in auto-gender mode (1 -> male blue, 2 -> female pink)', () => {
		const themeStore = useThemeStore();

		themeStore.syncUserTheme({ username: 'boy_user', gender: '1' });
		expect(themeStore.themeMode).toBe('auto-gender');
		expect(themeStore.primaryColor).toBe(MALE_DEFAULT_COLOR);
		expect(styleProps.get('--primary-color')).toBe(MALE_DEFAULT_COLOR);
		expect(themeStore.activeThemeStatusText).toBe('跟随性别 · 天际蓝');

		themeStore.syncUserTheme({ username: 'girl_user', gender: '2' });
		expect(themeStore.themeMode).toBe('auto-gender');
		expect(themeStore.primaryColor).toBe(FEMALE_DEFAULT_COLOR);
		expect(styleProps.get('--primary-color')).toBe(FEMALE_DEFAULT_COLOR);
		expect(themeStore.activeThemeStatusText).toBe('跟随性别 · 甜心粉');
	});

	it('should prioritize user custom theme over gender default once set, and restore on resetToGenderDefault', () => {
		const themeStore = useThemeStore();

		// 1. 女生登录，默认甜心粉
		themeStore.syncUserTheme({ username: 'alice', gender: '2' });
		expect(themeStore.primaryColor).toBe(FEMALE_DEFAULT_COLOR);

		// 2. 手动设置极光绿 #10b981
		themeStore.setCustomPrimaryColor('#10b981');
		expect(themeStore.themeMode).toBe('custom');
		expect(themeStore.primaryColor).toBe('#10b981');
		expect(themeStore.activeThemeStatusText).toBe('个人设置 · 极光绿');

		// 3. 再次同步用户信息或修改性别，个人设置依然优先
		themeStore.syncUserTheme({ username: 'alice', gender: '2' });
		expect(themeStore.themeMode).toBe('custom');
		expect(themeStore.primaryColor).toBe('#10b981');
		expect(styleProps.get('--primary-color')).toBe('#10b981');

		// 4. 点击恢复跟随性别默认，立即回到女生默认甜心粉
		themeStore.resetToGenderDefault('2');
		expect(themeStore.themeMode).toBe('auto-gender');
		expect(themeStore.primaryColor).toBe(FEMALE_DEFAULT_COLOR);
		expect(styleProps.get('--primary-color')).toBe(FEMALE_DEFAULT_COLOR);
	});

	it('should resolve login page theme respecting custom setting first and gender default second', () => {
		const themeStore = useThemeStore();

		// 未识别性别时兜底元气橙
		const neutralRes = themeStore.applyLoginPageTheme({ username: '' });
		expect(neutralRes.color).toBe(NEUTRAL_LOGIN_COLOR);
		expect(neutralRes.badgeText).toBe('元气卜卜');

		// 记住男生账号默认蓝调卜卜
		const maleRes = themeStore.applyLoginPageTheme({
			username: 'bob',
			gender: '1',
			isRemembered: true,
		});
		expect(maleRes.color).toBe(MALE_DEFAULT_COLOR);
		expect(maleRes.badgeText).toBe('蓝调卜卜');

		// 用户设置了个人主题后，登录页按个人主题渲染
		const customRes = themeStore.applyLoginPageTheme({
			username: 'bob',
			gender: '1',
			themeMode: 'custom',
			customColor: '#8b5cf6',
			isRemembered: true,
		});
		expect(customRes.mode).toBe('custom');
		expect(customRes.color).toBe('#8b5cf6');
		expect(customRes.badgeText).toBe('极客紫 · 专属');
		expect(styleProps.get('--primary-color')).toBe('#8b5cf6');
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

	it('should sync document state on initTheme and deriveThemeTokens', () => {
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

		const tokens = deriveThemeTokens(FEMALE_DEFAULT_COLOR);
		expect(tokens['--theme-mascot-accent']).toBe('#fb7185');
	});
});
