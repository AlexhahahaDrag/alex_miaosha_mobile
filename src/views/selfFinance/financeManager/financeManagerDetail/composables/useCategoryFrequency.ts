/**
 * 记账分类本地使用频次记忆与权重排序组合式函数
 */
const STORAGE_KEY = 'alex_mobile_finance_category_freq';

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

export const recordCategoryUsage = (categoryName: string): void => {
	if (!categoryName || !categoryName.trim()) return;
	const trimmed = categoryName.trim();
	try {
		const map = loadCategoryFrequency();
		map[trimmed] = (map[trimmed] || 0) + 1;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
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
