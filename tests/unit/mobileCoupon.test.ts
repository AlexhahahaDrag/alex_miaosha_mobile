import { describe, expect, it } from 'vitest';
import { rulesRef } from '@/views/cpn-coupon/cpn-coupon-info/config';

/**
 * 计算消费券核销进度比率 (0~1)
 */
export function calcMobileCouponProgress(
	remainingQuantity?: number,
	totalQuantity?: number,
): number {
	if (!totalQuantity || totalQuantity <= 0) return 0;
	if (!remainingQuantity || remainingQuantity <= 0) return 1; // 剩余0表示100%已核销
	const redeemed = totalQuantity - remainingQuantity;
	if (redeemed <= 0) return 0;
	return Math.min(1, Math.round((redeemed / totalQuantity) * 100) / 100);
}

/**
 * 递归规范化移动端消费券对象的雪花 ID（string 防精度丢失护城河）
 */
export function normalizeMobileCouponIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeMobileCouponIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeMobileCouponIds(val);
		}
	}
	return result as T;
}

describe('Mobile Coupon Center - 移动端消费券表单校验与契约测试', () => {
	describe('消费券发券表单必填校验 rulesRef', () => {
		it('应声明券名、发行量、面值与截止日期 4 大核心必填项', () => {
			expect(rulesRef.couponName).toBeDefined();
			expect(rulesRef.couponName[0].required).toBe(true);
			expect(rulesRef.couponName[0].message).toContain('消费券名称');

			expect(rulesRef.totalQuantity).toBeDefined();
			expect(rulesRef.totalQuantity[0].required).toBe(true);

			expect(rulesRef.unitValue).toBeDefined();
			expect(rulesRef.unitValue[0].required).toBe(true);

			expect(rulesRef.endDate).toBeDefined();
			expect(rulesRef.endDate[0].required).toBe(true);
		});
	});

	describe('calcMobileCouponProgress 进度计算', () => {
		it('应准确计算已核销百分比并处理边界', () => {
			// 发行 100，剩余 40 -> 已核销 60 -> 0.6
			expect(calcMobileCouponProgress(40, 100)).toBe(0.6);
			// 发行 100，剩余 100 -> 0
			expect(calcMobileCouponProgress(100, 100)).toBe(0);
			// 剩余 0 -> 1 (已全部核销)
			expect(calcMobileCouponProgress(0, 100)).toBe(1);
			// 发行量无效
			expect(calcMobileCouponProgress(10, 0)).toBe(0);
		});
	});

	describe('移动端大数雪花 ID 安全转换 normalizeMobileCouponIds', () => {
		it('应将券 ID、用户券 ID、商户 ID 稳定转换为 string', () => {
			const payload = {
				id: 1849182938192839182n,
				couponId: 987654321987654321n,
				userCouponId: 20033,
				merchantId: 30044,
				couponName: '移动端 50 元立减券',
				unitValue: 50,
			};
			const res = normalizeMobileCouponIds(payload);
			expect(res.id).toBe('1849182938192839182');
			expect(res.couponId).toBe('987654321987654321');
			expect(res.userCouponId).toBe('20033');
			expect(res.merchantId).toBe('30044');
			expect(res.unitValue).toBe(50);
		});
	});
});
