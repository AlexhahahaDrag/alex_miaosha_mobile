/**
 * 移动端财务分析大盘离线快照管理器
 * 遵循 Stale-While-Revalidate (SWR) 范式：
 * 1. 资产总览（总额、同比环比、动产/不动产）
 * 2. 收支分析（分类饼图）
 * 3. 收支明细（日消费、月消费折线图）
 */
import type { FinanceDetail } from '@/views/finance/financeAnalysis/financeAnalysisDetail/common';

const KEY_BALANCE = 'alex_mobile_analysis_balance_cache';
const KEY_PIE = 'alex_mobile_analysis_pie_cache';
const KEY_TREND = 'alex_mobile_analysis_trend_cache';

export interface BalanceSnapshot {
	list: FinanceDetail[];
	yoyTrend?: string;
	momTrend?: string;
	timestamp: number;
}

export interface PieSnapshot {
	income: FinanceDetail[];
	expense: FinanceDetail[];
	timestamp: number;
}

export interface TrendSnapshot {
	dayList: FinanceDetail[];
	monthList: FinanceDetail[];
	timestamp: number;
}

// 1. 资产总览快照
export const saveBalanceSnapshot = (
	list: FinanceDetail[],
	yoyTrend?: string,
	momTrend?: string,
): void => {
	try {
		if (!list || !list.length) return;
		const snapshot: BalanceSnapshot = {
			list,
			yoyTrend,
			momTrend,
			timestamp: Date.now(),
		};
		localStorage.setItem(KEY_BALANCE, JSON.stringify(snapshot));
	} catch (e) {
		console.warn('Failed to save balance snapshot:', e);
	}
};

export const loadBalanceSnapshot = (): BalanceSnapshot | null => {
	try {
		const raw = localStorage.getItem(KEY_BALANCE);
		if (raw) {
			return JSON.parse(raw) as BalanceSnapshot;
		}
	} catch (e) {
		console.warn('Failed to load balance snapshot:', e);
	}
	return null;
};

// 2. 收支分析分类饼图快照
export const savePieSnapshot = (income: FinanceDetail[], expense: FinanceDetail[]): void => {
	try {
		const snapshot: PieSnapshot = {
			income: income || [],
			expense: expense || [],
			timestamp: Date.now(),
		};
		localStorage.setItem(KEY_PIE, JSON.stringify(snapshot));
	} catch (e) {
		console.warn('Failed to save pie snapshot:', e);
	}
};

export const loadPieSnapshot = (): PieSnapshot | null => {
	try {
		const raw = localStorage.getItem(KEY_PIE);
		if (raw) {
			return JSON.parse(raw) as PieSnapshot;
		}
	} catch (e) {
		console.warn('Failed to load pie snapshot:', e);
	}
	return null;
};

// 3. 消费趋势折线图快照
export const saveTrendSnapshot = (dayList: FinanceDetail[], monthList: FinanceDetail[]): void => {
	try {
		const snapshot: TrendSnapshot = {
			dayList: dayList || [],
			monthList: monthList || [],
			timestamp: Date.now(),
		};
		localStorage.setItem(KEY_TREND, JSON.stringify(snapshot));
	} catch (e) {
		console.warn('Failed to save trend snapshot:', e);
	}
};

export const loadTrendSnapshot = (): TrendSnapshot | null => {
	try {
		const raw = localStorage.getItem(KEY_TREND);
		if (raw) {
			return JSON.parse(raw) as TrendSnapshot;
		}
	} catch (e) {
		console.warn('Failed to load trend snapshot:', e);
	}
	return null;
};
