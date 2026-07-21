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
	});
});
