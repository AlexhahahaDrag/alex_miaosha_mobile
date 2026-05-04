import type { Nullable } from '@/types/global';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';

export interface UserState {
	id?: string;
	userInfo: Nullable<UserManagerData>;
	token?: string;
	roleList: RoleInfoData[];
	sessionTimeout?: boolean;
	lastUpdateTime: number;
	menuInfo: MenuInfo[] | null;
	hasMenu: boolean;
	orgInfo: OrgInfoData | null;
	roleInfo: RolePermissionInfo | null;
}

export interface RoleInfo {
	roleName: string;
	value: string;
}

export interface RolePermissionInfo {
	roleCode?: string;
	roleName?: string;
	permissionList?: MenuInfo[];
	[key: string]: unknown;
}

export interface MenuInfo {
	id: string;
	name: string;
	path: string;
	title: string;
	component: string;
	redirect: string;
	icon: string;
	hideInMenu: string;
	showInHome: string;
	parentId: string;
	summary: string;
	status: string;
	children: MenuInfo[];
	permissionCode: string;
}
