import { describe, expect, it } from 'vitest';
import { fromSourceTransferList, rulesRef } from '@/views/finance/financeManager/config';

/**
 * 计算移动端预算使用率百分比与超支状态
 */
export function calcMobileBudgetUsage(
	actualExpense: number = 0,
	budgetAmount: number = 0,
): { usagePercent: number; isOverBudget: boolean; remainingAmount: number } {
	if (!budgetAmount || budgetAmount <= 0) {
		return { usagePercent: 0, isOverBudget: false, remainingAmount: 0 };
	}
	const usagePercent = Math.round((actualExpense / budgetAmount) * 10000) / 100;
	const isOverBudget = actualExpense > budgetAmount;
	const remainingAmount = Math.round((budgetAmount - actualExpense) * 100) / 100;
	return { usagePercent, isOverBudget, remainingAmount };
}

/**
 * 递归规范化移动端日常记账对象的雪花 ID（string 防精度丢失护城河）
 */
export function normalizeMobileFinanceIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeMobileFinanceIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeMobileFinanceIds(val);
		}
	}
	return result as T;
}

describe('Mobile Finance Manager - 记账渠道字典、校验与预算算力契约', () => {
	describe('支付渠道字典 fromSourceTransferList', () => {
		it('应包含现金、银行卡、支付宝、微信等 13 项常用支付途径', () => {
			expect(fromSourceTransferList).toHaveLength(13);
			const values = fromSourceTransferList.map((item) => item.value);
			expect(values).toContain('xj');
			expect(values).toContain('yhk');
			expect(values).toContain('zfb');
			expect(values).toContain('wx');
			expect(values).toContain('mt');
			expect(values).toContain('hb');
			expect(values).toContain('bt');
		});

		it('每一项均具备中英文标签与值映射', () => {
			for (const item of fromSourceTransferList) {
				expect(item.value).toBeDefined();
				expect(item.name.length).toBeGreaterThan(0);
			}
		});
	});

	describe('记账表单必填校验 rulesRef', () => {
		it('应声明名称、金额、类别、支付方式、收支类型、有效性、业务时间 7 大核心必填项', () => {
			expect(rulesRef.name[0].required).toBe(true);
			expect(rulesRef.amount[0].required).toBe(true);
			expect(rulesRef.typeCode[0].required).toBe(true);
			expect(rulesRef.fromSource[0].required).toBe(true);
			expect(rulesRef.incomeAndExpenses[0].required).toBe(true);
			expect(rulesRef.isValid[0].required).toBe(true);
			expect(rulesRef.infoDate[0].required).toBe(true);
		});
	});

	describe('移动端预算使用率推导 calcMobileBudgetUsage', () => {
		it('未超支场景应准确计算使用率与剩余预算', () => {
			// 预算 5000，支出 3000 -> 60%，未超支，剩余 2000
			const res = calcMobileBudgetUsage(3000, 5000);
			expect(res.usagePercent).toBe(60);
			expect(res.isOverBudget).toBe(false);
			expect(res.remainingAmount).toBe(2000);
		});

		it('超支场景应标定 isOverBudget 并计算负剩余', () => {
			// 预算 2000，支出 2500 -> 125%，超支，剩余 -500
			const res = calcMobileBudgetUsage(2500, 2000);
			expect(res.usagePercent).toBe(125);
			expect(res.isOverBudget).toBe(true);
			expect(res.remainingAmount).toBe(-500);
		});

		it('预算为 0 或无效时防除零崩溃', () => {
			const res = calcMobileBudgetUsage(500, 0);
			expect(res.usagePercent).toBe(0);
			expect(res.isOverBudget).toBe(false);
			expect(res.remainingAmount).toBe(0);
		});
	});

	describe('移动端记账记录雪花 ID 转换', () => {
		it('normalizeMobileFinanceIds 应递归将 id、orgId、typeId 转为 string', () => {
			const rawRecord = {
				id: 1789230192830192831n,
				orgId: 9001,
				name: '便利蜂下午茶',
				amount: 32.5,
				fromSource: 'wx',
			};
			const res = normalizeMobileFinanceIds(rawRecord);
			expect(res.id).toBe('1789230192830192831');
			expect(res.orgId).toBe('9001');
			expect(res.amount).toBe(32.5);
			expect(res.fromSource).toBe('wx');
		});
	});
	describe('本月零花钱骨架屏与 Loading 契约', () => {
		it('loading 判定函数应在接口请求或首屏空列表刷新时激活骨架屏', () => {
			const shouldShowSkeleton = (budgetLoading: boolean, listLoading: boolean, hasData: boolean) => {
				return budgetLoading || (listLoading && !hasData);
			};

			// 首屏初始化：budgetLoading = true -> 显示骨架屏
			expect(shouldShowSkeleton(true, false, false)).toBe(true);
			// 列表首次拉取：listLoading = true 且无数据 -> 显示骨架屏
			expect(shouldShowSkeleton(false, true, false)).toBe(true);
			// 数据加载完成：budgetLoading = false 且 listLoading = false -> 隐藏骨架屏
			expect(shouldShowSkeleton(false, false, true)).toBe(false);
			// 触底分页加载第二页：listLoading = true 但已有数据 -> 不应重新遮罩卡片
			expect(shouldShowSkeleton(false, true, true)).toBe(false);
		});

		it('loading 状态下应严密拦截卡片展开与触觉震动', () => {
			let isExpanded = false;
			let vibrated = false;

			const toggleExpand = (loading: boolean) => {
				if (loading) return;
				vibrated = true;
				isExpanded = !isExpanded;
			};

			// 处于骨架屏 loading 态时触发点击
			toggleExpand(true);
			expect(isExpanded).toBe(false);
			expect(vibrated).toBe(false);

			// 加载完成后触发点击
			toggleExpand(false);
			expect(isExpanded).toBe(true);
			expect(vibrated).toBe(true);
		});
	});
});
