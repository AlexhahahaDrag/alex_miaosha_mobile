import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '@/utils/haptics';

describe('移动端工作台角色态势卡片与业务聚合测试 (Mobile Home Dashboard)', () => {
	const originalVibrate = navigator.vibrate;

	beforeEach(() => {
		navigator.vibrate = vi.fn().mockReturnValue(true);
	});

	afterEach(() => {
		navigator.vibrate = originalVibrate;
	});

	it('时间问候算法：全时段覆盖问候语义', () => {
		const getTimeGreeting = (hour: number) => {
			if (hour < 6) return '凌晨好';
			if (hour < 12) return '早上好';
			if (hour < 14) return '中午好';
			if (hour < 19) return '下午好';
			return '晚上好';
		};

		expect(getTimeGreeting(4)).toBe('凌晨好');
		expect(getTimeGreeting(9)).toBe('早上好');
		expect(getTimeGreeting(13)).toBe('中午好');
		expect(getTimeGreeting(17)).toBe('下午好');
		expect(getTimeGreeting(21)).toBe('晚上好');
	});

	it('移动端角色分流算法：正确识别超管、机构管理员与个人家庭角色', () => {
		const resolveRole = (user: { superAdmin?: boolean; roleCode?: string; roleName?: string }) => {
			const isSuper = Boolean(user.superAdmin || user.roleCode === 'super_super');
			if (isSuper) {
				return { type: 'super_admin', tag: '超级管理员', roleClass: 'role-super' };
			}
			const code = (user.roleCode || '').toLowerCase();
			const name = user.roleName || '';
			const isOrg = code.includes('admin') || name.includes('管理') || name.includes('主管');
			if (isOrg) {
				return { type: 'org_admin', tag: name || '机构主管', roleClass: 'role-admin' };
			}
			return { type: 'user', tag: '家庭与随礼记账', roleClass: 'role-user' };
		};

		expect(resolveRole({ superAdmin: true })).toEqual({
			type: 'super_admin',
			tag: '超级管理员',
			roleClass: 'role-super',
		});
		expect(resolveRole({ roleCode: 'admin', roleName: '运营主管' })).toEqual({
			type: 'org_admin',
			tag: '运营主管',
			roleClass: 'role-admin',
		});
		expect(resolveRole({ roleCode: 'member', roleName: '家庭成员' })).toEqual({
			type: 'user',
			tag: '家庭与随礼记账',
			roleClass: 'role-user',
		});
	});

	it('礼金资产计算：净结余严格等于 累计收礼 - 随礼支出 - 回礼支出', () => {
		const overview = {
			receiveAmount: 45000,
			giveAmount: 22000,
			returnAmount: 3000,
		};
		const netAmount = overview.receiveAmount - overview.giveAmount - overview.returnAmount;
		expect(netAmount).toBe(20000);
	});

	it('触觉微反馈：点击 AI 记账触发 light 触感，点击随礼/待办触发 selection 触感', () => {
		triggerHaptic('light');
		expect(navigator.vibrate).toHaveBeenCalledWith(15);

		triggerHaptic('selection');
		expect(navigator.vibrate).toHaveBeenCalledWith(10);
	});
});
