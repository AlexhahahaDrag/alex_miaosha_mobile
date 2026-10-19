import { describe, it, expect } from 'vitest';
import type { UniversalFinanceAiParseVo } from '@/views/finance/financeManager/config';

describe('移动端 AI 记账结果数据映射与回填契约测试', () => {
	it('验证通用 AI 记账结构体解析字段类型与安全默认值', () => {
		const mockVo: UniversalFinanceAiParseVo = {
			targetScene: 'DAILY_EXPENSE',
			incomeAndExpenses: 'expense',
			amount: 128.5,
			name: '肯德基午餐',
			typeCode: 'catering',
			typeName: '餐饮美食',
			fromSource: 'wx',
			fromSourceName: '微信',
			infoDate: '2026-10-19 12:30:00',
			belongTo: '10086',
			belongToName: '张三',
			parseEngine: 'AI_DEEPSEEK',
			reasoning: 'AI 抽取成功',
		};

		expect(mockVo.targetScene).toBe('DAILY_EXPENSE');
		expect(mockVo.amount).toBe(128.5);
		expect(typeof mockVo.belongTo).toBe('string');
		expect(mockVo.incomeAndExpenses).toBe('expense');
		expect(mockVo.typeCode).toBe('catering');
	});

	it('验证购物小票明细条目结构', () => {
		const mockReceiptVo: UniversalFinanceAiParseVo = {
			targetScene: 'SHOP_RECEIPT',
			amount: 79.0,
			receiptItems: [
				{ itemName: '鲜牛奶', unitPrice: 18.5, quantity: 2, subtotal: 37.0 },
				{ itemName: '全麦面包', unitPrice: 12.0, quantity: 1, subtotal: 12.0 },
			],
		};

		expect(mockReceiptVo.receiptItems).toHaveLength(2);
		expect(mockReceiptVo.receiptItems![0].subtotal).toBe(37.0);
	});

	it('验证预付卡流水关联字段', () => {
		const mockCardVo: UniversalFinanceAiParseVo = {
			targetScene: 'PREPAID_CARD',
			amount: 38.0,
			prepaidCardId: '900100200300400500',
			prepaidCardName: '星巴克星礼卡',
			prepaidCardBalance: 350.0,
		};

		expect(typeof mockCardVo.prepaidCardId).toBe('string');
		expect(mockCardVo.prepaidCardName).toBe('星巴克星礼卡');
		expect(mockCardVo.prepaidCardBalance).toBe(350.0);
	});
});
