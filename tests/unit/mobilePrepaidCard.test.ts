import { describe, expect, it } from 'vitest';
import {
	getBalanceParts,
	getCardColor,
	getCategoryIcon,
	getStatusLabel,
} from '@/views/selfFinance/prepaidCardInfoT/config';

/**
 * 递归规范化储值卡与流水对象的雪花 ID（string 防精度丢失护城河）
 */
export function normalizeMobilePrepaidCardIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeMobilePrepaidCardIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeMobilePrepaidCardIds(val);
		}
	}
	return result as T;
}

describe('Mobile Prepaid Card - 储值卡金额拆分与视觉映射契约', () => {
	describe('金额拆分纯函数 getBalanceParts', () => {
		it('应准确拆分标准数字金额为 integer 与 fraction', () => {
			const res = getBalanceParts(128.5);
			expect(res.integer).toBe('128');
			expect(res.fraction).toBe('.50');
		});

		it('应支持整数输入并自动补齐两位小数 .00', () => {
			const res = getBalanceParts(500);
			expect(res.integer).toBe('500');
			expect(res.fraction).toBe('.00');
		});

		it('应支持带货币符号或千分位的字符串并防御', () => {
			const res = getBalanceParts('￥1,888.66');
			expect(res.integer).toBe('1888');
			expect(res.fraction).toBe('.66');
		});

		it('遇到无效字符串或 NaN 时应安全兜底为 0 和 .00', () => {
			const res = getBalanceParts('invalid-amount');
			expect(res.integer).toBe('0');
			expect(res.fraction).toBe('.00');
		});

		it('应支持负数金额（如支出扣款）', () => {
			const res = getBalanceParts(-35.8);
			expect(res.integer).toBe('-35');
			expect(res.fraction).toBe('.80');
		});
	});

	describe('卡片色系与图标匹配', () => {
		it('getCardColor 应按索引在 6 色调色板中循环匹配', () => {
			const color0 = getCardColor(0);
			const color6 = getCardColor(6);
			expect(color0).toBe('#268CF2');
			expect(color6).toBe(color0);
			expect(getCardColor(1)).toBe('#CC66E5');
		});

		it('getStatusLabel 应准确识别 1/0 与中英文状态', () => {
			expect(getStatusLabel({ status: '1', name: '', balance: '', bgColor: '' })).toBe('正常');
			expect(getStatusLabel({ status: '0', name: '', balance: '', bgColor: '' })).toBe('禁用');
			expect(getStatusLabel({ status: 'disabled', name: '', balance: '', bgColor: '' })).toBe('禁用');
			expect(getStatusLabel(null)).toBe('正常');
		});

		it('getCategoryIcon 应为已知商户返回图标路径，未知商户兜底返回空串', () => {
			expect(getCategoryIcon('比优特w')).toBeDefined();
			expect(getCategoryIcon('未知商户不存在')).toBe('');
		});
	});

	describe('储值卡交易流水大数雪花 ID 转换', () => {
		it('normalizeMobilePrepaidCardIds 应转换 cardId 与流水 id', () => {
			const rawRecord = {
				id: 1982739182739182739n,
				cardId: 887766554433221100n,
				amount: 88.0,
				currentBalance: 500.0,
				description: '比优特超市刷卡消费',
			};
			const res = normalizeMobilePrepaidCardIds(rawRecord);
			expect(res.id).toBe('1982739182739182739');
			expect(res.cardId).toBe('887766554433221100');
			expect(res.amount).toBe(88.0);
			expect(res.currentBalance).toBe(500.0);
		});
	});
});
