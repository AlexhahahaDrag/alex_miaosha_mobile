import { describe, it, expect, beforeEach } from 'vitest';
import {
	saveBalanceSnapshot,
	loadBalanceSnapshot,
	savePieSnapshot,
	loadPieSnapshot,
	saveTrendSnapshot,
	loadTrendSnapshot,
} from '@/views/finance/financeAnalysis/composables/useAnalysisOfflineCache';

describe('useAnalysisOfflineCache - 移动端财务分析大盘离线快照测试', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('初始状态读取所有离线快照应为 null', () => {
		expect(loadBalanceSnapshot()).toBeNull();
		expect(loadPieSnapshot()).toBeNull();
		expect(loadTrendSnapshot()).toBeNull();
	});

	it('资产总览快照应能正确存盘并完整还原', () => {
		const mockList = [
			{ typeName: '银行卡', amount: 50000, typeCode: 'yhk' },
			{ typeName: '微信', amount: 3200.5, typeCode: 'wx' },
		];
		saveBalanceSnapshot(mockList, '+5.0%', '+1.2%');

		const snapshot = loadBalanceSnapshot();
		expect(snapshot).not.toBeNull();
		expect(snapshot?.list.length).toBe(2);
		expect(snapshot?.list[0].typeName).toBe('银行卡');
		expect(snapshot?.yoyTrend).toBe('+5.0%');
		expect(snapshot?.momTrend).toBe('+1.2%');
		expect(typeof snapshot?.timestamp).toBe('number');
	});

	it('收支分析分类饼图快照应能正确隔离收入与支出条目', () => {
		const mockIncome = [{ typeName: '工资', amount: 15000, typeCode: 'salary' }];
		const mockExpense = [
			{ typeName: '餐饮', amount: 1200, typeCode: 'catering' },
			{ typeName: '交通', amount: 300, typeCode: 'traffic' },
		];
		savePieSnapshot(mockIncome, mockExpense);

		const snapshot = loadPieSnapshot();
		expect(snapshot).not.toBeNull();
		expect(snapshot?.income.length).toBe(1);
		expect(snapshot?.expense.length).toBe(2);
		expect(snapshot?.expense[0].typeName).toBe('餐饮');
	});

	it('消费趋势折线图快照应能正确持久化日消费与月消费', () => {
		const mockDay = [
			{ infoDate: '2026-10-01', amount: 128 },
			{ infoDate: '2026-10-02', amount: 55 },
		];
		const mockMonth = [
			{ infoDate: '2026-08', amount: 4500 },
			{ infoDate: '2026-09', amount: 3800 },
		];
		saveTrendSnapshot(mockDay, mockMonth);

		const snapshot = loadTrendSnapshot();
		expect(snapshot).not.toBeNull();
		expect(snapshot?.dayList.length).toBe(2);
		expect(snapshot?.monthList.length).toBe(2);
		expect(snapshot?.dayList[0].amount).toBe(128);
	});
});
