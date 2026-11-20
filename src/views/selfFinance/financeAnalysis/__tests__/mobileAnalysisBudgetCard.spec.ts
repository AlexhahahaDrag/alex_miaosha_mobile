import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCategoryEmoji } from '@/views/selfFinance/financeManager/config';

describe('移动端财务分析 style-update 与零钱消费统计契约测试', () => {
	it('客户标准账户分组（可动产 / 不动产 / 生活缴费）应严格保留且不发生错位', () => {
		const overviewSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/financeAnalysisDetail/overview.vue',
			),
			'utf-8',
		);

		expect(overviewSource).toContain('[\'银行卡\', \'微信\', \'花呗\', \'白条\']');
		expect(overviewSource).toContain('[\'现金\', \'支付宝\', \'京东\']');
		expect(overviewSource).toContain('可动产');
		expect(overviewSource).toContain('不动产');
		expect(overviewSource).toContain('生活缴费');
	});

	it('顶部筛选栏应修复月份默认初始化为空导致只显示“账单”的缺陷，并支持上/下月快捷步进', () => {
		const indexSource = fs.readFileSync(
			path.resolve(process.cwd(), 'src/views/selfFinance/financeAnalysis/index.vue'),
			'utf-8',
		);

		expect(indexSource).toContain('formatDate(currentMonthDayjs.value, DATE_FORMATTER)');
		expect(indexSource).not.toContain('formatDate(undefined, DATE_FORMATTER)');
		expect(indexSource).toContain('stepMonth(-1)');
		expect(indexSource).toContain('stepMonth(1)');
	});

	it('收支分析页应集成 MobileAnalysisBudgetCard 零钱统计双舱卡片并移除假环比硬编码', () => {
		const incomeAnalysisSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue',
			),
			'utf-8',
		);
		const budgetCardSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/components/MobileAnalysisBudgetCard.vue',
			),
			'utf-8',
		);

		expect(incomeAnalysisSource).toContain('mobile-analysis-budget-card');
		expect(incomeAnalysisSource).toContain('getBudgetStatus');
		expect(incomeAnalysisSource).not.toContain('item.value % 2 === 0');

		expect(budgetCardSource).toContain('当月零钱消费与预算分析');
		expect(budgetCardSource).toContain('剩余可用零钱');
		expect(budgetCardSource).toContain('时间参考');
		expect(budgetCardSource).toContain('主要开销项');
		expect(budgetCardSource).toContain('为当月首要支出项，占零钱开销');
	});

	it('getCategoryEmoji 应为常见收支分类返回语义化 Emoji 图标，未知分类返回兜底标签', () => {
		expect(getCategoryEmoji('餐饮')).toBe('🍱');
		expect(getCategoryEmoji('日常交通')).toBe('🚗');
		expect(getCategoryEmoji('工资')).toBe('💰');
		expect(getCategoryEmoji('未知自定义分类')).toBe('🏷️');
	});

	it('三个核心 Tab（总览 / 收支分析 / 收支明细）在查询数据时均应具备 try/finally 受控流光骨架屏', () => {
		const overviewSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/financeAnalysisDetail/overview.vue',
			),
			'utf-8',
		);
		const incomeAnalysisSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue',
			),
			'utf-8',
		);
		const incomeDetailSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue',
			),
			'utf-8',
		);
		const budgetCardSource = fs.readFileSync(
			path.resolve(
				process.cwd(),
				'src/views/selfFinance/financeAnalysis/components/MobileAnalysisBudgetCard.vue',
			),
			'utf-8',
		);

		expect(overviewSource).toContain('data-testid="overview-skeleton"');
		expect(overviewSource).toContain('loading.value = true');
		expect(overviewSource).toContain('loading.value = false');

		expect(incomeAnalysisSource).toContain('data-testid="income-analysis-skeleton"');
		expect(incomeAnalysisSource).toContain('data-testid="expense-structure-skeleton"');
		expect(incomeAnalysisSource).toContain('data-testid="income-structure-skeleton"');
		expect(incomeAnalysisSource).toContain('analysisLoading.value = true');
		expect(incomeAnalysisSource).toContain('analysisLoading.value = false');
		expect(budgetCardSource).toContain('data-testid="budget-card-skeleton"');

		expect(incomeDetailSource).toContain('data-testid="income-detail-skeleton"');
		expect(incomeDetailSource).toContain('data-testid="high-value-list-skeleton"');
		expect(incomeDetailSource).toContain('detailLoading.value = true');
		expect(incomeDetailSource).toContain('detailLoading.value = false');
	});
});
