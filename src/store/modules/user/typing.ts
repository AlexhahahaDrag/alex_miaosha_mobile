import type { Nullable } from '@/types/global';
import type { RoleEnum } from '@/types/role_enum';
import type { UserInfo } from '@/types/store';

export interface UserState {
	userInfo: Nullable<UserInfo>;
	token?: string;
	roleList: RoleEnum[];
	sessionTimeout?: boolean;
	lastUpdateTime: number;
	menuInfo: MenuInfo[] | null;
	hasMenu: boolean;
	orgInfo: any;
	roleInfo: any;
}

export interface RoleInfo {
	roleName: string;
	value: string;
}

export interface GetUserInfoModel {
	roles: RoleInfo[];
	userId: string | number;
	username: string;
	nickName: string;
	avatar?: string;
	desc?: string;
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
