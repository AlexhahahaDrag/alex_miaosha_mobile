import { describe, expect, it } from 'vitest';
import { canAccessRoutePermission } from '@/utils/permission';

describe('canAccessRoutePermission', () => {
	it('无 permissionCode 时放行', () => {
		expect(
			canAccessRoutePermission(undefined, {
				superAdmin: false,
				permissionCodes: [],
			}),
		).toBe(true);
	});

	it('store superAdmin 优先于 permissionCodes', () => {
		expect(
			canAccessRoutePermission('any_code', {
				superAdmin: true,
				permissionCodes: [],
			}),
		).toBe(true);
	});

	it('使用 permissionCodes 并集而非仅首个 role 的 permissionList', () => {
		expect(
			canAccessRoutePermission('from_role_b', {
				superAdmin: false,
				permissionCodes: ['from_role_b'],
				roleCode: 'role_a',
				permissionList: [{ permissionCode: 'only_role_a' }],
			}),
		).toBe(true);
		expect(
			canAccessRoutePermission('only_role_a', {
				superAdmin: false,
				permissionCodes: ['from_role_b'],
				permissionList: [{ permissionCode: 'only_role_a' }],
			}),
		).toBe(false);
	});

	it('permissionCodes 为空时回落 permissionList（兼容）', () => {
		expect(
			canAccessRoutePermission('legacy', {
				superAdmin: false,
				permissionCodes: [],
				permissionList: [{ permissionCode: 'legacy' }],
			}),
		).toBe(true);
	});

	it('roleCode super_super 兼容放行', () => {
		expect(
			canAccessRoutePermission('x', {
				superAdmin: false,
				permissionCodes: [],
				roleCode: 'super_super',
			}),
		).toBe(true);
	});
});
