import { describe, expect, it } from 'vitest';
import { buildPermissionContext } from '@/utils/permission';

/**
 * mobile 权限上下文装配契约（RBAC-MB-SCOPE-001）。
 * 对齐 PC normalizePermissionContext：多角色 permissionCodes 去重并集 + superAdmin。
 */
describe('buildPermissionContext', () => {
	it('装配菜单、角色与机构三部分上下文', () => {
		const context = buildPermissionContext({
			menuInfoVoList: [{ id: '1', name: '用户管理' }],
			roleInfoVo: { roleCode: 'admin', roleName: '管理员' },
			orgInfoVo: { id: '10', orgName: '总公司' },
		} as never);

		expect(context.menuInfo).toEqual([{ id: '1', name: '用户管理' }]);
		expect(context.menuList).toEqual([{ id: '1', name: '用户管理' }]);
		expect(context.roleInfo).toMatchObject({ roleCode: 'admin' });
		expect(context.orgInfo).toMatchObject({ id: '10', orgName: '总公司' });
	});

	it('入参缺失时不抛异常, 返回可安全消费的空上下文', () => {
		expect(() => buildPermissionContext({} as never)).not.toThrow();
		const context = buildPermissionContext({} as never);
		expect(context.menuInfo).toEqual([]);
		expect(context.menuList).toEqual([]);
		expect(context.roleInfo).toBeNull();
		expect(context.roleList).toEqual([]);
		expect(context.orgInfo).toBeNull();
		expect(context.permissionCodes).toEqual([]);
		expect(context.buttonPermissionCodes).toEqual([]);
		expect(context.superAdmin).toBe(false);
	});

	it('优先取 permissionContext 中的首个角色作为 roleInfo（store 兼容）', () => {
		const context = buildPermissionContext({
			roleInfoVoList: [
				{ roleCode: 'user', roleName: '普通用户' },
				{ roleCode: 'admin', roleName: '管理员' },
			],
			permissionContext: {
				roleInfoVoList: [
					{ roleCode: 'manager', roleName: '机构管理员' },
					{ roleCode: 'admin', roleName: '管理员' },
				],
			},
		} as never);

		expect(context.roleInfo).toMatchObject({ roleCode: 'manager' });
		expect(context.roleList).toHaveLength(2);
	});

	it('双角色权限码取去重并集（RBAC-MB-SCOPE-001）', () => {
		const context = buildPermissionContext({
			roleInfoVoList: [
				{
					roleCode: 'role_a',
					permissionList: [
						{ permissionCode: 'p1' },
						{ permissionCode: 'shared' },
					],
				},
				{
					roleCode: 'role_b',
					permissionList: [
						{ permissionCode: 'p2' },
						{ permissionCode: 'shared' },
					],
				},
			],
			buttonPermissionCodes: ['btn_edit'],
		} as never);

		expect(context.permissionCodes).toEqual(
			expect.arrayContaining(['p1', 'p2', 'shared']),
		);
		expect(context.permissionCodes).toHaveLength(3);
		expect(context.buttonPermissionCodes).toContain('btn_edit');
	});

	it('任一角色 roleCode 为 super_super 时 superAdmin 为 true', () => {
		const context = buildPermissionContext({
			roleInfoVoList: [
				{ roleCode: 'user', roleName: '普通用户' },
				{ roleCode: 'super_super', roleName: '超级管理员' },
			],
		} as never);

		expect(context.superAdmin).toBe(true);
	});
});
