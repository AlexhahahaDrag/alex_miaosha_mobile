import { defineStore } from 'pinia';

export const DEFAULT_PRIMARY_COLOR = '#1989fa';
export const MALE_DEFAULT_COLOR = '#3b82f6';
export const FEMALE_DEFAULT_COLOR = '#f43f5e';
export const NEUTRAL_LOGIN_COLOR = '#f97316';
export const NEUTRAL_APP_COLOR = '#4f6af6';

export type ThemeMode = 'auto-gender' | 'custom';
export type NormalizedGender = '1' | '2' | '';

export interface ThemePresetItem {
	key: string;
	name: string;
	badge: string;
	value: string;
	genderHint?: string;
}

export interface UserThemeRecord {
	mode: ThemeMode;
	customColor?: string;
	gender?: NormalizedGender;
}

export const THEME_PRESETS: ThemePresetItem[] = [
	{
		key: 'male_sky',
		name: '天际蓝',
		badge: '蓝调卜卜',
		value: MALE_DEFAULT_COLOR,
		genderHint: '男生默认',
	},
	{
		key: 'female_rose',
		name: '甜心粉',
		badge: '甜心卜卜',
		value: FEMALE_DEFAULT_COLOR,
		genderHint: '女生默认',
	},
	{ key: 'nebula_indigo', name: '星云靛', badge: '星云卜卜', value: NEUTRAL_APP_COLOR },
	{ key: 'vitality_amber', name: '元气橙', badge: '元气卜卜', value: NEUTRAL_LOGIN_COLOR },
	{ key: 'aurora_emerald', name: '极光绿', badge: '极光卜卜', value: '#10b981' },
	{ key: 'geek_violet', name: '极客紫', badge: '极客卜卜', value: '#8b5cf6' },
];

export const normalizeGender = (gender?: string | number | null): NormalizedGender => {
	const raw = String(gender ?? '').trim();
	if (raw === '1' || raw.toLowerCase() === 'male' || raw === '男') return '1';
	if (raw === '2' || raw.toLowerCase() === 'female' || raw === '女') return '2';
	return '';
};

export const resolveGenderDefaultColor = (
	gender?: string | number | null,
	fallbackColor: string = DEFAULT_PRIMARY_COLOR,
): string => {
	const g = normalizeGender(gender);
	if (g === '1') return MALE_DEFAULT_COLOR;
	if (g === '2') return FEMALE_DEFAULT_COLOR;
	return fallbackColor;
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
	const clean = hex.replace('#', '').trim();
	if (clean.length === 3) {
		const r = parseInt(clean[0] + clean[0], 16);
		const g = parseInt(clean[1] + clean[1], 16);
		const b = parseInt(clean[2] + clean[2], 16);
		return {
			r: Number.isNaN(r) ? 59 : r,
			g: Number.isNaN(g) ? 130 : g,
			b: Number.isNaN(b) ? 246 : b,
		};
	}
	const r = parseInt(clean.slice(0, 2), 16);
	const g = parseInt(clean.slice(2, 4), 16);
	const b = parseInt(clean.slice(4, 6), 16);
	return {
		r: Number.isNaN(r) ? 59 : r,
		g: Number.isNaN(g) ? 130 : g,
		b: Number.isNaN(b) ? 246 : b,
	};
};

const toHexByte = (n: number): string =>
	Math.max(0, Math.min(255, Math.round(n)))
		.toString(16)
		.padStart(2, '0');

export const mixHex = (hex1: string, hex2: string, weight: number): string => {
	const c1 = hexToRgb(hex1);
	const c2 = hexToRgb(hex2);
	const w = Math.max(0, Math.min(1, weight));
	const r = c1.r * (1 - w) + c2.r * w;
	const g = c1.g * (1 - w) + c2.g * w;
	const b = c1.b * (1 - w) + c2.b * w;
	return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
};

export interface DerivedThemeTokens {
	'--primary-color': string;
	'--van-primary-color': string;
	'--theme-primary-rgb': string;
	'--theme-primary-start': string;
	'--theme-primary-end': string;
	'--theme-hero-gradient': string;
	'--theme-btn-gradient': string;
	'--theme-login-bg': string;
	'--theme-soft-bg': string;
	'--theme-border-color': string;
	'--theme-focus-ring': string;
	'--theme-shadow-color': string;
	'--theme-mascot-accent': string;
	'--theme-mascot-light': string;
}

export const deriveThemeTokens = (hex: string): DerivedThemeTokens => {
	const lower = (hex || DEFAULT_PRIMARY_COLOR).toLowerCase();
	const { r, g, b } = hexToRgb(lower);
	const rgbStr = `${r}, ${g}, ${b}`;

	let startColor = mixHex(lower, '#ffffff', 0.18);
	let endColor = mixHex(lower, '#0f172a', 0.14);
	let heroGradient = `linear-gradient(135deg, ${startColor} 0%, ${lower} 55%, ${endColor} 100%)`;
	let loginBg = `linear-gradient(165deg, rgba(${rgbStr}, 0.20) 0%, rgba(${rgbStr}, 0.06) 48%, #f8fafc 100%)`;
	let mascotAccent = lower;
	let mascotLight = mixHex(lower, '#ffffff', 0.78);

	if (lower === MALE_DEFAULT_COLOR) {
		startColor = '#3b82f6';
		endColor = '#6366f1';
		heroGradient = 'linear-gradient(135deg, #3b82f6 0%, #4f6af6 55%, #4f46e5 100%)';
		loginBg = 'linear-gradient(165deg, #dbeafe 0%, #eff6ff 48%, #e0f2fe 100%)';
		mascotAccent = '#3b82f6';
		mascotLight = '#dbeafe';
	} else if (lower === FEMALE_DEFAULT_COLOR) {
		startColor = '#fb7185';
		endColor = '#e11d48';
		heroGradient = 'linear-gradient(135deg, #fb7185 0%, #f43f5e 55%, #e11d48 100%)';
		loginBg = 'linear-gradient(165deg, #ffe4e6 0%, #fdf2f8 48%, #fff7ed 100%)';
		mascotAccent = '#fb7185';
		mascotLight = '#ffe4e6';
	} else if (lower === NEUTRAL_LOGIN_COLOR) {
		startColor = '#fb923c';
		endColor = '#ea580c';
		heroGradient = 'linear-gradient(135deg, #fb923c 0%, #f97316 55%, #ea580c 100%)';
		loginBg = 'linear-gradient(165deg, #ffedd5 0%, #fff7ed 46%, #fef3c7 100%)';
		mascotAccent = '#f97316';
		mascotLight = '#ffedd5';
	}

	const btnGradient = `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;

	return {
		'--primary-color': hex,
		'--van-primary-color': hex,
		'--theme-primary-rgb': rgbStr,
		'--theme-primary-start': startColor,
		'--theme-primary-end': endColor,
		'--theme-hero-gradient': heroGradient,
		'--theme-btn-gradient': btnGradient,
		'--theme-login-bg': loginBg,
		'--theme-soft-bg': `rgba(${rgbStr}, 0.12)`,
		'--theme-border-color': `rgba(${rgbStr}, 0.28)`,
		'--theme-focus-ring': `rgba(${rgbStr}, 0.14)`,
		'--theme-shadow-color': `rgba(${rgbStr}, 0.32)`,
		'--theme-mascot-accent': mascotAccent,
		'--theme-mascot-light': mascotLight,
	};
};

export const findThemePreset = (color?: string): ThemePresetItem | undefined => {
	if (!color) return undefined;
	const target = color.toLowerCase();
	return THEME_PRESETS.find((item) => item.value.toLowerCase() === target);
};

export const useThemeStore = defineStore(
	'theme',
	() => {
		const primaryColor = ref<string>(DEFAULT_PRIMARY_COLOR);
		const isDark = ref<boolean>(false);
		const themeMode = ref<ThemeMode>('auto-gender');
		const userGender = ref<NormalizedGender>('');
		const activeUsername = ref<string>('');
		const userThemeMap = ref<Record<string, UserThemeRecord>>({});

		const applyTokensToRoot = (color: string) => {
			if (typeof document === 'undefined') return;
			const tokens = deriveThemeTokens(color);
			const rootStyle = document.documentElement.style;
			(Object.keys(tokens) as Array<keyof DerivedThemeTokens>).forEach((key) => {
				rootStyle.setProperty(key, tokens[key]);
			});
		};

		const syncLastProfileStorage = (extra: {
			mode?: ThemeMode;
			customColor?: string;
			gender?: NormalizedGender;
		}) => {
			if (typeof localStorage === 'undefined') return;
			try {
				const raw = localStorage.getItem('alex_mobile_last_profile');
				if (!raw) return;
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				if (!parsed || typeof parsed !== 'object') return;
				if (activeUsername.value && parsed.username && parsed.username !== activeUsername.value) {
					return;
				}
				const next = {
					...parsed,
					...(extra.gender !== undefined ? { gender: extra.gender } : {}),
					...(extra.mode !== undefined ? { themeMode: extra.mode } : {}),
					...(extra.customColor !== undefined ? { customColor: extra.customColor } : {}),
				};
				localStorage.setItem('alex_mobile_last_profile', JSON.stringify(next));
			} catch {
				// 忽略本地存储异常
			}
		};

		const setPrimaryColor = (color: string, markCustom = true) => {
			if (!color) return;
			primaryColor.value = color;
			if (markCustom) {
				themeMode.value = 'custom';
				if (activeUsername.value) {
					userThemeMap.value[activeUsername.value] = {
						mode: 'custom',
						customColor: color,
						gender: userGender.value,
					};
				}
				syncLastProfileStorage({ mode: 'custom', customColor: color });
			}
			applyTokensToRoot(color);
		};

		const setCustomPrimaryColor = (color: string) => {
			setPrimaryColor(color, true);
		};

		const syncUserTheme = (
			user?: { id?: string | number; username?: string; gender?: string | number | null } | null,
		) => {
			const uname = String(user?.username || activeUsername.value || '').trim();
			const g = normalizeGender(user?.gender ?? userGender.value);
			if (uname) {
				activeUsername.value = uname;
			}
			userGender.value = g;

			const record = uname ? userThemeMap.value[uname] : undefined;
			if (record?.mode === 'custom' && record.customColor) {
				themeMode.value = 'custom';
				primaryColor.value = record.customColor;
				userThemeMap.value[uname] = {
					...record,
					gender: g,
				};
			} else if (!uname && themeMode.value === 'custom' && primaryColor.value) {
				// 未绑定账号但已手动设置过自定义色时保留
			} else {
				themeMode.value = 'auto-gender';
				primaryColor.value = resolveGenderDefaultColor(g, DEFAULT_PRIMARY_COLOR);
				if (uname) {
					userThemeMap.value[uname] = {
						mode: 'auto-gender',
						gender: g,
					};
				}
			}

			syncLastProfileStorage({
				mode: themeMode.value,
				customColor: themeMode.value === 'custom' ? primaryColor.value : '',
				gender: g,
			});
			applyTokensToRoot(primaryColor.value);
		};

		const previewGenderTheme = (gender?: string | number | null) => {
			const g = normalizeGender(gender);
			userGender.value = g;
			if (themeMode.value === 'auto-gender') {
				const nextColor = resolveGenderDefaultColor(g, DEFAULT_PRIMARY_COLOR);
				primaryColor.value = nextColor;
				applyTokensToRoot(nextColor);
			}
		};

		const resetToGenderDefault = (gender?: string | number | null) => {
			if (gender !== undefined) {
				userGender.value = normalizeGender(gender);
			}
			themeMode.value = 'auto-gender';
			const nextColor = resolveGenderDefaultColor(userGender.value, DEFAULT_PRIMARY_COLOR);
			primaryColor.value = nextColor;
			if (activeUsername.value) {
				userThemeMap.value[activeUsername.value] = {
					mode: 'auto-gender',
					gender: userGender.value,
				};
			}
			syncLastProfileStorage({ mode: 'auto-gender', customColor: '', gender: userGender.value });
			applyTokensToRoot(nextColor);
		};

		const applyLoginPageTheme = (options: {
			username?: string;
			gender?: string | number | null;
			themeMode?: ThemeMode;
			customColor?: string;
			isRemembered?: boolean;
		}): {
			mode: ThemeMode;
			gender: NormalizedGender;
			color: string;
			badgeText: string;
		} => {
			const uname = String(options.username || '').trim();
			const record = uname ? userThemeMap.value[uname] : undefined;
			const g = normalizeGender(
				options.gender ?? record?.gender ?? (options.isRemembered ? userGender.value : ''),
			);

			const effectiveMode: ThemeMode =
				options.themeMode === 'custom' && options.customColor
					? 'custom'
					: record?.mode === 'custom' && record.customColor
						? 'custom'
						: 'auto-gender';

			const customHex = options.customColor || record?.customColor || '';

			if (effectiveMode === 'custom' && customHex) {
				applyTokensToRoot(customHex);
				const preset = findThemePreset(customHex);
				return {
					mode: 'custom',
					gender: g,
					color: customHex,
					badgeText: preset ? `${preset.name} · 专属` : '专属主题',
				};
			}

			if (g === '1') {
				applyTokensToRoot(MALE_DEFAULT_COLOR);
				return {
					mode: 'auto-gender',
					gender: '1',
					color: MALE_DEFAULT_COLOR,
					badgeText: '蓝调卜卜',
				};
			}

			if (g === '2') {
				applyTokensToRoot(FEMALE_DEFAULT_COLOR);
				return {
					mode: 'auto-gender',
					gender: '2',
					color: FEMALE_DEFAULT_COLOR,
					badgeText: '甜心卜卜',
				};
			}

			applyTokensToRoot(NEUTRAL_LOGIN_COLOR);
			return {
				mode: 'auto-gender',
				gender: '',
				color: NEUTRAL_LOGIN_COLOR,
				badgeText: '元气卜卜',
			};
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
				applyTokensToRoot(primaryColor.value);
				document.documentElement.classList.toggle('dark', isDark.value);
				document.documentElement.classList.toggle('van-theme-dark', isDark.value);
			}
		};

		const activePreset = computed(() => findThemePreset(primaryColor.value));

		const activeThemeName = computed(() => {
			if (activePreset.value) return activePreset.value.name;
			if (primaryColor.value.toLowerCase() === DEFAULT_PRIMARY_COLOR) return '拂晓蓝';
			return '自定义色';
		});

		const activeThemeStatusText = computed(() => {
			if (themeMode.value === 'custom') {
				return `个人设置 · ${activeThemeName.value}`;
			}
			if (userGender.value === '1') {
				return '跟随性别 · 天际蓝';
			}
			if (userGender.value === '2') {
				return '跟随性别 · 甜心粉';
			}
			return `默认主题 · ${activeThemeName.value}`;
		});

		return {
			primaryColor,
			isDark,
			themeMode,
			userGender,
			activeUsername,
			userThemeMap,
			activePreset,
			activeThemeName,
			activeThemeStatusText,
			setPrimaryColor,
			setCustomPrimaryColor,
			syncUserTheme,
			previewGenderTheme,
			resetToGenderDefault,
			applyLoginPageTheme,
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
