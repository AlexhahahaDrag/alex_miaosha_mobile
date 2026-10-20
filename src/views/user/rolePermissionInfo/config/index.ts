export interface RolePermissionInfoData {
	id?: string;
	roleId?: string;
	permissionId?: string;
	summary?: string;
	status?: string | number | null;
	[key: string]: unknown;
}
