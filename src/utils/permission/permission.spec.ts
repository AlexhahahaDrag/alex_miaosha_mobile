import { describe, expect, it } from 'vitest';
import {
	buildPermissionSet,
	canAccessPermission,
	isSuperAdmin,
	normalizePermissionContext,
} from './index';

describe('permission utils', () => {
	it('super_super bypasses permission check', () => {
		const ctx = normalizePermissionContext({
			roleInfoVo: { roleCode: 'super_super', permissionList: [] },
		});
		expect(isSuperAdmin(ctx)).toBe(true);
		expect(canAccessPermission(buildPermissionSet(ctx), 'gift:edit', true)).toBe(true);
	});

	it('hasPermission false when code missing', () => {
		const ctx = normalizePermissionContext({
			roleInfoVo: {
				roleCode: 'gift_user',
				permissionList: [{ permissionCode: 'gift:view' }],
			},
		});
		const set = buildPermissionSet(ctx);
		expect(canAccessPermission(set, 'gift:edit', false)).toBe(false);
		expect(canAccessPermission(set, 'gift:view', false)).toBe(true);
		expect(canAccessPermission(set, ['gift:edit', 'gift:view'], false)).toBe(true);
		expect(canAccessPermission(set, ['gift:edit', 'gift:delete'], false)).toBe(false);
	});

	it('isSuperAdmin handles context roleList, roleCode, and edge cases', () => {
		expect(isSuperAdmin(null)).toBe(false);
		expect(isSuperAdmin(undefined)).toBe(false);
		expect(isSuperAdmin({ superAdmin: true })).toBe(true);
		expect(isSuperAdmin({ roleCode: 'super_super' })).toBe(true);
		expect(isSuperAdmin({ roleCode: 'admin' })).toBe(false);
		expect(isSuperAdmin({ roleList: [{ roleCode: 'super_super' }] })).toBe(true);
		expect(isSuperAdmin({ roleList: [{ roleCode: 'admin' }] })).toBe(false);
		expect(isSuperAdmin({ roleList: null as never })).toBe(false);
	});
});
