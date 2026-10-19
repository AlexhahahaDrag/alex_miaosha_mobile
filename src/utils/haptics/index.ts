/**
 * 移动端触觉反馈微交互中枢 (Haptic Feedback)
 * 遵循 iOS / Android 触觉设计语言，提供层级清晰的微振动模式
 * 并在不支持或用户静音时平滑静默降级
 */

export type HapticType =
	| 'selection' // 数字键盘输入、单选切换 (轻微 10ms)
	| 'light' // 选项点击、标签选中、页面微交互 (轻快 15ms)
	| 'medium' // 抽屉展开、浮层调出、卡片折叠 (适度 30ms)
	| 'heavy' // 长按手势、重要删除触发 (明显 50ms)
	| 'success' // 记账完成、保存成功 (愉悦双击 [15, 60, 25]ms)
	| 'warning' // 超支警告、未填项提醒 ([30, 80, 30]ms)
	| 'error'; // 请求失败、严重错误 ([50, 100, 50, 100, 50]ms)

/**
 * 触发指定模式的触觉振动
 * @param type 震动类型，默认为 'light'
 * @returns 是否成功触发
 */
export const triggerHaptic = (type: HapticType = 'light'): boolean => {
	if (typeof navigator === 'undefined' || !navigator.vibrate) {
		return false;
	}

	try {
		switch (type) {
			case 'selection':
				return navigator.vibrate(10);
			case 'light':
				return navigator.vibrate(15);
			case 'medium':
				return navigator.vibrate(30);
			case 'heavy':
				return navigator.vibrate(50);
			case 'success':
				return navigator.vibrate([15, 60, 25]);
			case 'warning':
				return navigator.vibrate([30, 80, 30]);
			case 'error':
				return navigator.vibrate([50, 100, 50, 100, 50]);
			default:
				return navigator.vibrate(15);
		}
	} catch (e) {
		console.warn('Trigger haptic feedback failed:', e);
		return false;
	}
};
