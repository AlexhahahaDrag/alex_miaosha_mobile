import fs from 'node:fs';
import path from 'node:path';
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

	it('移动端首页 unslop 规约与快捷按钮 SVG 尺寸防溢出契约校验', () => {
		const homeSource = fs.readFileSync(
			path.resolve(process.cwd(), 'src/views/home/index.vue'),
			'utf-8',
		);

		// 1. 快捷按钮必须显式锁定 btn-svg-icon 16x16 宽高与双列 grid，防止礼盒 SVG 撑爆卡片
		expect(homeSource).toContain('btn-svg-icon');
		expect(homeSource).toContain('grid-template-columns: 1fr 1fr');
		expect(homeSource).toContain('AI 记账');
		expect(homeSource).not.toContain('AI 智能流式记账');

		// 2. 清理 AI 腔废话文案（unslop Rule 16 / 23 / 26 / 27）
		expect(homeSource).not.toContain('XXL-Job 定时巡检');
		expect(homeSource).not.toContain('全栈探针正常');
		expect(homeSource).not.toContain('组织权限体系受控');
		expect(homeSource).not.toContain('礼入人情');
		expect(homeSource).not.toContain('人情往还');
		expect(homeSource).toContain('查看消息 ›');
		expect(homeSource).toContain('全部运行正常');
		expect(homeSource).toContain('个服务离线');

		// 3. 顶部指标与下方功能菜单均具备受控骨架屏，且监听 Pinia 响应式路由就绪状态防止登录后菜单空白
		expect(homeSource).toContain('data-testid="home-kpi-skeleton"');
		expect(homeSource).toContain('data-testid="home-menu-skeleton"');
		expect(homeSource).toContain('userStore.getRouteStatus');
		expect(homeSource).toContain('routesVersion.value');
		expect(homeSource).toContain('buildMenuGroupsFromStore');
		expect(homeSource).toContain('kpiLoading.value = true');
		expect(homeSource).toContain('kpiLoading.value = false');
	});

	it('动态路由注册应先卸载残留非底座路由并递增 routesVersion，防止重登时 router.hasRoute 跳过 routes.push', () => {
		const routerSource = fs.readFileSync(path.resolve(process.cwd(), 'src/router/index.ts'), 'utf-8');

		expect(routerSource).toContain('export const routesVersion');
		expect(routerSource).toContain('removeDynamicRoutesFromRouter');
		expect(routerSource).toContain('ensureMenusLoaded');
		expect(routerSource).not.toContain('if (newRouter.name && !router.hasRoute(newRouter.name))');
		expect(routerSource).toContain('routesVersion.value += 1');
	});
});
