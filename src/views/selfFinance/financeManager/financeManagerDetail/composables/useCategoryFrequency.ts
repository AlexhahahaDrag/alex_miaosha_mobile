/**
 * 记账分类本地使用频次记忆与最近使用排序组合式函数
 */
const STORAGE_KEY = 'alex_mobile_finance_category_freq';
const RECENT_STORAGE_KEY = 'alex_mobile_finance_recent_categories';

export interface CategoryFrequencyMap {
	[name: string]: number;
}

export const loadCategoryFrequency = (): CategoryFrequencyMap => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			return JSON.parse(raw);
		}
	} catch (e) {
		console.warn('Failed to load category frequency from localStorage:', e);
	}
	return {};
};

export const loadRecentCategories = (): string[] => {
	try {
		const raw = localStorage.getItem(RECENT_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.filter((c): c is string => typeof c === 'string' && !!c.trim() && c !== '其它');
			}
		}
	} catch (e) {
		console.warn('Failed to load recent categories from localStorage:', e);
	}
	return [];
};

export const saveRecentCategory = (categoryName: string): void => {
	if (!categoryName || !categoryName.trim()) return;
	const trimmed = categoryName.trim();
	if (trimmed === '其它') return;
	try {
		const list = loadRecentCategories().filter((c) => c !== trimmed);
		list.unshift(trimmed);
		localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
	} catch (e) {
		console.warn('Failed to save recent category:', e);
	}
};

export const recordCategoryUsage = (categoryName: string): void => {
	if (!categoryName || !categoryName.trim()) return;
	const trimmed = categoryName.trim();
	try {
		const map = loadCategoryFrequency();
		map[trimmed] = (map[trimmed] || 0) + 1;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
		saveRecentCategory(trimmed);
	} catch (e) {
		console.warn('Failed to record category usage:', e);
	}
};

/**
 * 根据本地使用频次加权对分类列表进行重排，频次高的优先排在前面
 */
export const sortCategoriesByFrequency = <T extends { name: string }>(
	categories: T[],
	freqMap: CategoryFrequencyMap = loadCategoryFrequency(),
): T[] => {
	return [...categories].sort((a, b) => {
		const scoreA = freqMap[a.name] || 0;
		const scoreB = freqMap[b.name] || 0;
		if (scoreA !== scoreB) {
			return scoreB - scoreA; // 降序排列，高频优先
		}
		return 0; // 频次相同时保持原有相对顺序
	});
};
