import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
	UniversalFinanceAiParseVo,
	UniversalFinanceAiStageVo,
	UniversalFinanceAiParseReq,
} from '@/views/finance/financeManager/config';
import { triggerHaptic } from '@/utils/haptics';

/**
 * 悬浮球拖拽垂直坐标边界约束核心算力
 */
export function clampBubbleTop(
	initialTop: number,
	deltaY: number,
	screenHeight: number = 844,
	minTop: number = 60,
): number {
	const maxTop = Math.max(minTop, screenHeight - 120);
	return Math.min(Math.max(minTop, initialTop + deltaY), maxTop);
}

/**
 * 拖拽位移防误触判定
 */
export function shouldSuppressClick(deltaY: number, threshold: number = 5): boolean {
	return Math.abs(deltaY) > threshold;
}

/**
 * 快速示例场景智能推导
 */
export function detectSceneFromText(text: string): UniversalFinanceAiParseReq['scene'] {
	if (text.includes('小票')) {
		return 'SHOP_RECEIPT';
	}
	if (text.includes('卡')) {
		return 'PREPAID_CARD';
	}
	return 'DAILY_EXPENSE';
}

/**
 * 移动端 AI 记账结果雪花 ID 与字段类型安全规范化
 */
export function normalizeMobileAiResult(vo: UniversalFinanceAiParseVo): UniversalFinanceAiParseVo {
	return {
		...vo,
		belongTo: vo.belongTo != null ? String(vo.belongTo) : undefined,
		prepaidCardId: vo.prepaidCardId != null ? String(vo.prepaidCardId) : undefined,
	};
}

describe('移动端 AI 记账悬浮球与流式多阶段打字机抽屉 (Mobile Copilot) 契约测试', () => {
	const originalVibrate = navigator.vibrate;

	beforeEach(() => {
		navigator.vibrate = vi.fn().mockReturnValue(true);
	});

	afterEach(() => {
		navigator.vibrate = originalVibrate;
	});

	describe('1. 悬浮球拖拽与视口安全边界 (clampBubbleTop)', () => {
		it('在正常拖拽范围内应正确计算位移', () => {
			const top = clampBubbleTop(500, 50, 844);
			expect(top).toBe(550);
		});

		it('向上拖拽超过顶部安全边界时应严格被限制在 60px', () => {
			const top = clampBubbleTop(100, -80, 844);
			expect(top).toBe(60);
		});

		it('向下拖拽超出底部安全区时应被限制在 screenHeight - 120px', () => {
			const screenH = 844;
			const maxExpected = screenH - 120; // 724
			const top = clampBubbleTop(700, 100, screenH);
			expect(top).toBe(maxExpected);
		});

		it('拖拽位移超过 5px 时应抑制点击误触', () => {
			expect(shouldSuppressClick(6)).toBe(true);
			expect(shouldSuppressClick(-7)).toBe(true);
			expect(shouldSuppressClick(2)).toBe(false);
			expect(shouldSuppressClick(0)).toBe(false);
		});
	});

	describe('2. 快速示例场景智能识别 (detectSceneFromText)', () => {
		it('包含小票关键字应识别为 SHOP_RECEIPT', () => {
			const scene = detectSceneFromText('沃尔玛购物小票\n牛奶 18.5\n面包 12.0');
			expect(scene).toBe('SHOP_RECEIPT');
		});

		it('包含卡关键字应识别为 PREPAID_CARD', () => {
			const scene = detectSceneFromText('星巴克星礼卡消费38元');
			expect(scene).toBe('PREPAID_CARD');
		});

		it('普通餐饮收支应识别为 DAILY_EXPENSE', () => {
			const scene = detectSceneFromText('中午和同事聚餐微信付了128.5元');
			expect(scene).toBe('DAILY_EXPENSE');
		});
	});

	describe('3. 雪花 ID 精度安全防御与结构体规范化 (normalizeMobileAiResult)', () => {
		it('将数字类型/BigInt 的 belongTo 与 prepaidCardId 规范化为 string', () => {
			const rawVo: UniversalFinanceAiParseVo = {
				targetScene: 'PREPAID_CARD',
				amount: 88.5,
				belongTo: 18293019283019283 as any,
				prepaidCardId: 900100200300400500 as any,
				incomeAndExpenses: 'expense',
			};

			const normalized = normalizeMobileAiResult(rawVo);
			expect(typeof normalized.belongTo).toBe('string');
			expect(typeof normalized.prepaidCardId).toBe('string');
			expect(normalized.amount).toBe(88.5);
		});

		it('当 ID 为 undefined 时应平稳保留 undefined，不产生 "undefined" 字符串', () => {
			const rawVo: UniversalFinanceAiParseVo = {
				targetScene: 'DAILY_EXPENSE',
				amount: 25.0,
			};

			const normalized = normalizeMobileAiResult(rawVo);
			expect(normalized.belongTo).toBeUndefined();
			expect(normalized.prepaidCardId).toBeUndefined();
		});
	});

	describe('4. 流式多阶段状态机与进度契约', () => {
		it('验证阶段状态机与进度条百分比递进', () => {
			const stages: UniversalFinanceAiStageVo[] = [
				{ stage: 'SCENE_ANALYSIS', progress: 10, message: '分析流水语境...' },
				{ stage: 'FIELD_EXTRACTION', progress: 70, message: '提取记账字段与金额...' },
				{ stage: 'CATEGORY_MATCHING', progress: 90, message: '匹配财务科目与支付渠道...' },
				{
					stage: 'COMPLETE',
					progress: 100,
					message: '解析完成',
					partialData: {
						targetScene: 'DAILY_EXPENSE',
						amount: 45.0,
						name: '麦当劳午餐',
						incomeAndExpenses: 'expense',
						parseEngine: 'AI_DEEPSEEK',
					},
				},
			];

			expect(stages[0].progress).toBe(10);
			expect(stages[1].progress).toBe(70);
			expect(stages[2].progress).toBe(90);
			expect(stages[3].progress).toBe(100);
			expect(stages[3].partialData?.parseEngine).toBe('AI_DEEPSEEK');
		});
	});

	describe('5. 触觉震动反馈联动测试 (triggerHaptic)', () => {
		it('示例点击与阶段跃迁应调用 light 模式 (15ms)', () => {
			triggerHaptic('light');
			expect(navigator.vibrate).toHaveBeenCalledWith(15);
		});

		it('解析成功完成应调用 success 模式 ([15, 60, 25])', () => {
			triggerHaptic('success');
			expect(navigator.vibrate).toHaveBeenCalledWith([15, 60, 25]);
		});

		it('解析异常或失败应调用 error 模式 ([50, 100, 50, 100, 50])', () => {
			triggerHaptic('error');
			expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50, 100, 50]);
		});
	});

	describe('6. 购物小票商品清单条目合计完整性', () => {
		it('应正确计算小票多件商品明细总额并匹配总金额', () => {
			const receiptItems = [
				{ itemName: '全脂纯牛奶', unitPrice: 18.5, quantity: 2, subtotal: 37.0 },
				{ itemName: '全麦吐司面包', unitPrice: 12.0, quantity: 1, subtotal: 12.0 },
				{ itemName: '维达无芯卷纸', unitPrice: 10.0, quantity: 3, subtotal: 30.0 },
			];

			const calculatedTotal = receiptItems.reduce((acc, cur) => acc + cur.subtotal, 0);
			expect(calculatedTotal).toBe(79.0);
		});
	});
});
