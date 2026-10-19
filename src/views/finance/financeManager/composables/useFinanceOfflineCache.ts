/**
 * 移动端财务账单与零花钱预算离线快照缓存管理器
 * 遵循 Stale-While-Revalidate (SWR) 范式：冷启动先使用快照秒开渲染，后台异步换新
 */
import type {
	FinanceManagerData,
	FinanceBudgetStatusVo,
} from '@/views/finance/financeManager/config';

const CACHE_KEY_RECORDS = 'alex_mobile_finance_records_cache';
const CACHE_KEY_BUDGET = 'alex_mobile_finance_budget_cache';

export interface FinanceOfflineSnapshot {
	records: FinanceManagerData[];
	total: number;
	timestamp: number;
}

export const saveFinanceOfflineSnapshot = (records: FinanceManagerData[], total: number): void => {
	try {
		if (!records || !records.length) return;
		// 仅缓存第一页最近的条目 (不超过 20 条)，避免体积过大
		const snapshot: FinanceOfflineSnapshot = {
			records: records.slice(0, 20),
			total,
			timestamp: Date.now(),
		};
		localStorage.setItem(CACHE_KEY_RECORDS, JSON.stringify(snapshot));
	} catch (e) {
		console.warn('Failed to save finance offline snapshot:', e);
	}
};

export const loadFinanceOfflineSnapshot = (): FinanceOfflineSnapshot | null => {
	try {
		const raw = localStorage.getItem(CACHE_KEY_RECORDS);
		if (raw) {
			return JSON.parse(raw) as FinanceOfflineSnapshot;
		}
	} catch (e) {
		console.warn('Failed to load finance offline snapshot:', e);
	}
	return null;
};

export const saveBudgetOfflineSnapshot = (status: FinanceBudgetStatusVo | null): void => {
	if (!status) return;
	try {
		localStorage.setItem(CACHE_KEY_BUDGET, JSON.stringify(status));
	} catch (e) {
		console.warn('Failed to save budget offline snapshot:', e);
	}
};

export const loadBudgetOfflineSnapshot = (): FinanceBudgetStatusVo | null => {
	try {
		const raw = localStorage.getItem(CACHE_KEY_BUDGET);
		if (raw) {
			return JSON.parse(raw) as FinanceBudgetStatusVo;
		}
	} catch (e) {
		console.warn('Failed to load budget offline snapshot:', e);
	}
	return null;
};
