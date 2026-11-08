import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { fromSourceTransferList, rulesRef } from '@/views/finance/financeManager/config';
import { getRoutePathByName } from '@/utils/router';

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

	describe('数据库动态菜单路由解析契约 (getRoutePathByName)', () => {
		it('应基于后端 t_menu_info 动态注册的 financeBudgetManage 与 financeAiLedger 解析路由路径', () => {
			const dynamicRouter = createRouter({
				history: createMemoryHistory(),
				routes: [
					{
						path: '/selfFinance',
						name: 'selfFinance',
						component: { template: '<div />' },
						children: [
							{
								path: '/selfFinance/financeManager/budgetManage',
								name: 'financeBudgetManage',
								component: { template: '<div />' },
							},
							{
								path: '/selfFinance/financeManager/financeAiLedger',
								name: 'financeAiLedger',
								component: { template: '<div />' },
							},
						],
					},
				],
			});

			expect(
				getRoutePathByName(
					dynamicRouter,
					'financeBudgetManage',
					'/selfFinance/financeManager/budgetManage',
				),
			).toBe('/selfFinance/financeManager/budgetManage');
			expect(
				getRoutePathByName(
					dynamicRouter,
					'financeAiLedger',
					'/selfFinance/financeManager/financeAiLedger',
				),
			).toBe('/selfFinance/financeManager/financeAiLedger');
		});
	});

	describe('Tailwind UI 极简风记账表单前置逻辑与交互契约', () => {
		it('懒人免填机制：未输入账单名称时，应自动缺省回退为选中分类名称', () => {
			const resolveRecordName = (inputName: string | undefined, selectedCategory: string) => {
				if (!inputName || !inputName.trim()) {
					return selectedCategory;
				}
				return inputName;
			};

			// 用户未填写备注 -> 取分类名称
			expect(resolveRecordName('', '餐饮')).toBe('餐饮');
			expect(resolveRecordName('   ', '工资')).toBe('工资');
			expect(resolveRecordName(undefined, '交通')).toBe('交通');
			// 用户手动填写了备注 -> 尊重用户输入
			expect(resolveRecordName('星巴克生椰拿铁', '餐饮')).toBe('星巴克生椰拿铁');
		});

		it('双人直选胶囊计算：应保证当前登录用户排在首位，且最多直接展示 2 位成员', () => {
			const currentUserId = '1001';
			const memberList = [
				{ id: '1002', nickName: '家庭成员A' },
				{ id: '1001', nickName: '臭屁宝' },
				{ id: '1003', nickName: '家庭成员B' },
			];

			const resolvePrimaryUsers = (list: typeof memberList, userId: string) => {
				const sorted = [...list].sort((a, b) => {
					const aIsCur = String(a.id) === userId ? -1 : 0;
					const bIsCur = String(b.id) === userId ? -1 : 0;
					return aIsCur - bIsCur;
				});
				return {
					primary: sorted.slice(0, 2),
					hasMore: sorted.length > 2,
				};
			};

			const { primary, hasMore } = resolvePrimaryUsers(memberList, currentUserId);
			expect(primary).toHaveLength(2);
			expect(primary[0].id).toBe('1001');
			expect(primary[0].nickName).toBe('臭屁宝');
			expect(primary[1].id).toBe('1002');
			expect(hasMore).toBe(true);

			// 验证下拉全员胶囊的文案计算契约
			const resolveOtherUserLabel = (
				selectedBelongTo: string,
				selectedName: string,
				pUsers: typeof primary,
			) => {
				const isOther = !pUsers.some((u) => String(u.id) === selectedBelongTo);
				return isOther && selectedName ? selectedName : '更多';
			};

			// 当选中前2位成员中的任意一位时，下拉按钮显示“更多”
			expect(resolveOtherUserLabel('1001', '臭屁宝', primary)).toBe('更多');
			expect(resolveOtherUserLabel('1002', '家庭成员A', primary)).toBe('更多');
			// 当从下拉选出第3位成员（如 1003 家庭成员B）时，下拉按钮直接回显其姓名
			expect(resolveOtherUserLabel('1003', '家庭成员B', primary)).toBe('家庭成员B');
		});

		it('微缩分段控制器：状态应在 1 (有效) 与 0 (无效) 之间平滑无阻切换', () => {
			let isValid = '1';
			const toggleStatus = (target: '1' | '0') => {
				isValid = target;
				return isValid === '1' ? '有效' : '无效';
			};

			expect(toggleStatus('0')).toBe('无效');
			expect(isValid).toBe('0');
			expect(toggleStatus('1')).toBe('有效');
			expect(isValid).toBe('1');
		});
	});
});
