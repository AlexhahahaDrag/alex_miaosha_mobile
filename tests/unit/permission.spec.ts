import { describe, expect, it } from 'vitest';
import { buildPermissionContext } from '@/utils/permission';

describe('buildPermissionContext', () => {
	it('merges permissionList from all roles instead of only using the first role', () => {
		const context = buildPermissionContext({
			permissionContext: {
				roleInfoVoList: [
					{
						id: 'role-1',
						roleCode: 'store_manager',
						permissionList: [
							{ permissionCode: 'user:view' },
							{ permissionCode: 'org:view' },
						],
					},
					{
						id: 'role-2',
						roleCode: 'finance_manager',
						permissionList: [
							{ permissionCode: 'finance:view' },
							{ permissionCode: 'org:view' },
						],
					},
				],
			},
		});

		const roleInfo = context.roleInfo as {
			permissionList?: Array<{ permissionCode?: string }>;
		};

		expect(roleInfo.permissionList?.map((item) => item.permissionCode).sort()).toEqual([
			'finance:view',
			'org:view',
			'user:view',
		]);
	});
});
