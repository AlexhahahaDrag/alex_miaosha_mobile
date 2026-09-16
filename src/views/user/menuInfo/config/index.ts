export interface MenuInfoData {
	id?: string;
	name?: string;
	path?: string;
	title?: string;
	component?: string;
	redirect?: string;
	icon?: string;
	hideInMenu?: string;
	parentId?: string;
	summary?: string;
	status?: string;
	orderBy?: number;
	permissionCode?: string;
	children?: MenuInfoData[];
	[key: string]: unknown;
}
