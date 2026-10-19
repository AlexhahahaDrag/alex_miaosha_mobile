import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '@/utils/haptics';

describe('triggerHaptic - 触觉微交互标准工具测试', () => {
	const originalVibrate = navigator.vibrate;

	beforeEach(() => {
		navigator.vibrate = vi.fn().mockReturnValue(true);
	});

	afterEach(() => {
		navigator.vibrate = originalVibrate;
	});

	it('触发 selection 模式应调用 10ms', () => {
		const res = triggerHaptic('selection');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith(10);
	});

	it('触发 light 模式应调用 15ms', () => {
		const res = triggerHaptic('light');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith(15);
	});

	it('触发 medium 模式应调用 30ms', () => {
		const res = triggerHaptic('medium');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith(30);
	});

	it('触发 heavy 模式应调用 50ms', () => {
		const res = triggerHaptic('heavy');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith(50);
	});

	it('触发 success 模式应调用双重微振 [15, 60, 25]', () => {
		const res = triggerHaptic('success');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith([15, 60, 25]);
	});

	it('触发 warning 模式应调用预警微振 [30, 80, 30]', () => {
		const res = triggerHaptic('warning');
		expect(res).toBe(true);
		expect(navigator.vibrate).toHaveBeenCalledWith([30, 80, 30]);
	});

	it('若 navigator.vibrate 未定义应安全静默返回 false', () => {
		// @ts-expect-error mock unsupported
		navigator.vibrate = undefined;
		const res = triggerHaptic('light');
		expect(res).toBe(false);
	});
});
