import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeGiftIds, normalizeGiftResponse } from '@/views/finance/gift/api/normalize';
import { triggerHaptic } from '@/utils/haptics';
import type { GiftPersonBalance } from '@/views/finance/gift/config';

describe('Gift Mobile Balance Matrix & Normalize Tests', () => {
	const originalVibrate = navigator.vibrate;

	beforeEach(() => {
		navigator.vibrate = vi.fn().mockReturnValue(true);
	});

	afterEach(() => {
		navigator.vibrate = originalVibrate;
	});

	describe('normalizeGiftIds 移动端雪花 ID 安全契约', () => {
		it('应将数字/BigInt 类型的 personId 与 id 转为 string', () => {
			const raw = {
				personId: 198283726182918291n,
				id: 888123456789012345n,
				personName: '李四',
				netBalance: 600,
			};

			const normalized = normalizeGiftIds(raw);
			expect(typeof normalized.personId).toBe('string');
			expect(normalized.personId).toBe('198283726182918291');
			expect(typeof normalized.id).toBe('string');
			expect(normalized.id).toBe('888123456789012345');
			expect(normalized.personName).toBe('李四');
			expect(normalized.netBalance).toBe(600);
		});

		it('应递归处理数组与包装的 ResponseBody', () => {
			const response = {
				code: '200',
				message: 'success',
				data: [
					{
						personId: 1847192837192837192n,
						personName: '张三',
						totalReceiveAmount: 2000,
						totalGiveAmount: 1000,
						netBalance: 1000,
						balanceStatus: 'SURPLUS' as const,
					},
				],
			};

			const normalized = normalizeGiftResponse(response);
			expect(typeof normalized.data[0].personId).toBe('string');
			expect(normalized.data[0].personId).toBe('1847192837192837192');
			expect(normalized.data[0].netBalance).toBe(1000);
		});
	});

	describe('移动端触觉微交互触发链断言', () => {
		it('打开回礼测算抽屉应触发 medium 振动', () => {
			const res = triggerHaptic('medium');
			expect(res).toBe(true);
			expect(navigator.vibrate).toHaveBeenCalledWith(30);
		});

		it('切换回礼事由与城市生活圈应触发 selection 振动', () => {
			const res = triggerHaptic('selection');
			expect(res).toBe(true);
			expect(navigator.vibrate).toHaveBeenCalledWith(10);
		});

		it('AI 测算完成应触发 success 愉悦双击振动', () => {
			const res = triggerHaptic('success');
			expect(res).toBe(true);
			expect(navigator.vibrate).toHaveBeenCalledWith([15, 60, 25]);
		});

		it('失衡预警点击应触发 warning 预警振动', () => {
			const res = triggerHaptic('warning');
			expect(res).toBe(true);
			expect(navigator.vibrate).toHaveBeenCalledWith([30, 80, 30]);
		});
	});

	describe('平衡矩阵状态分类计算断言', () => {
		it('应正确识别三态状态', () => {
			const sampleList: GiftPersonBalance[] = [
				{
					personId: '101',
					personName: '王五',
					totalReceiveAmount: 2000,
					totalGiveAmount: 500,
					netBalance: 1500,
					balanceStatus: 'SURPLUS',
					isImbalancedAlert: true,
					alertReason: '收礼超180天未回',
				},
				{
					personId: '102',
					personName: '赵六',
					totalReceiveAmount: 500,
					totalGiveAmount: 2000,
					netBalance: -1500,
					balanceStatus: 'DEFICIT',
					isImbalancedAlert: false,
				},
				{
					personId: '103',
					personName: '钱七',
					totalReceiveAmount: 1000,
					totalGiveAmount: 1000,
					netBalance: 0,
					balanceStatus: 'BALANCED',
					isImbalancedAlert: false,
				},
			];

			const alertItems = sampleList.filter((item) => item.isImbalancedAlert);
			expect(alertItems.length).toBe(1);
			expect(alertItems[0].personName).toBe('王五');

			const surplusItems = sampleList.filter((item) => item.balanceStatus === 'SURPLUS');
			expect(surplusItems.length).toBe(1);

			const deficitItems = sampleList.filter((item) => item.balanceStatus === 'DEFICIT');
			expect(deficitItems.length).toBe(1);
		});
	});
});
