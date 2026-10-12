import { describe, expect, it } from 'vitest';
import {
	buildPermissionContext,
	buildPermissionSet,
	canAccessPermission,
	canAccessRoutePermission,
	isSuperAdmin,
} from '@/utils/permission';

describe('零花钱与预算管理权限矩阵契约', () => {
	const memberContext = buildPermissionContext({
		roleInfoVo: {
			roleCode: 'family_member',
			roleName: '家庭成员',
			permissionList: [
				{ permissionCode: 'finance:financeManager:query' },
				{ permissionCode: 'finance:financeManager:add' },
				{ permissionCode: 'finance:financeManager:edit' },
				{ permissionCode: 'finance:financeManager:delete' },
				{ permissionCode: 'finance:financeManager:budget:view' },
			],
		},
	} as never);

	const adminContext = buildPermissionContext({
		roleInfoVo: {
			roleCode: 'family_admin',
			roleName: '家庭管理员',
			permissionList: [
				{ permissionCode: 'finance:financeManager:query' },
				{ permissionCode: 'finance:financeManager:add' },
				{ permissionCode: 'finance:financeManager:edit' },
				{ permissionCode: 'finance:financeManager:delete' },
				{ permissionCode: 'finance:financeManager:budget:view' },
				{ permissionCode: 'finance:financeManager:budget:edit' },
			],
		},
	} as never);

	const superAdminContext = buildPermissionContext({
		roleInfoVo: {
			roleCode: 'super_super',
			roleName: '超级管理员',
			permissionList: [],
		},
	} as never);

	it('家庭成员拥有预算查看权限，但不拥有预算编辑权限', () => {
		const set = buildPermissionSet(memberContext);
		const superAdmin = isSuperAdmin(memberContext);

		expect(canAccessPermission(set, 'finance:financeManager:budget:view', superAdmin)).toBe(true);
		expect(canAccessPermission(set, 'finance:financeManager:budget:edit', superAdmin)).toBe(false);
		expect(
			canAccessPermission(
				set,
				['finance:financeManager:budget:view', 'finance:financeManager:budget:edit'],
				superAdmin,
			),
		).toBe(true);
	});

	it('家庭管理员拥有预算查看与编辑权限', () => {
		const set = buildPermissionSet(adminContext);
		const superAdmin = isSuperAdmin(adminContext);

		expect(canAccessPermission(set, 'finance:financeManager:budget:view', superAdmin)).toBe(true);
		expect(canAccessPermission(set, 'finance:financeManager:budget:edit', superAdmin)).toBe(true);
	});

	it('超管拥有全量预算权限', () => {
		const set = buildPermissionSet(superAdminContext);
		const superAdmin = isSuperAdmin(superAdminContext);

		expect(canAccessPermission(set, 'finance:financeManager:budget:view', superAdmin)).toBe(true);
		expect(canAccessPermission(set, 'finance:financeManager:budget:edit', superAdmin)).toBe(true);
	});

	it('二级独立路由 /finance/financeManager/budgetManage 访问准入校验', () => {
		// 家庭成员允许准入 (挂载 budget:view)
		expect(
			canAccessRoutePermission('finance:financeManager:budget:view', {
				superAdmin: isSuperAdmin(memberContext),
				permissionCodes: memberContext.permissionCodes,
			}),
		).toBe(true);

		// 若未配置 view 权限则拦截
		expect(
			canAccessRoutePermission('finance:financeManager:budget:view', {
				superAdmin: false,
				permissionCodes: ['finance:financeManager:query'],
			}),
		).toBe(false);
	});

	it('属主权限：家庭成员仅可操作个人流水，管理员与超管可操作全员流水', () => {
		const currentUserId = '1001';
		const myRecord = { id: '9001', belongTo: '1001' };
		const otherRecord = { id: '9002', belongTo: '1002' };

		// 判定逻辑（对齐 FinanceCard 与 Detail 视图）
		const canDeleteRecord = (item: { belongTo?: string }, ctx: typeof memberContext) => {
			const isSuper = isSuperAdmin(ctx);
			const isAdmin =
				isSuper || ctx.roleList.some((r) => r.roleCode === 'family_admin' || r.roleCode === 'admin');
			const set = buildPermissionSet(ctx);
			const hasDelete = canAccessPermission(set, 'finance:financeManager:delete', isSuper);
			if (!hasDelete) return false;
			if (isAdmin) return true;
			return String(item.belongTo || '') === String(currentUserId);
		};

		// 家庭成员测试
		expect(canDeleteRecord(myRecord, memberContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, memberContext)).toBe(false);

		// 家庭管理员测试
		expect(canDeleteRecord(myRecord, adminContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, adminContext)).toBe(true);

		// 超管测试
		expect(canDeleteRecord(myRecord, superAdminContext)).toBe(true);
		expect(canDeleteRecord(otherRecord, superAdminContext)).toBe(true);
	});
});
