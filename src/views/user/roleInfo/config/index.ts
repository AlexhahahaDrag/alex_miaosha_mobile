export interface RoleInfoData {
	id?: string;
	roleCode?: string;
	roleName?: string;
	summary?: string;
	status?: string | number | null;
	[key: string]: unknown;
}
