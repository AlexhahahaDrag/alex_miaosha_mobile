import { Nullable } from '@/types/global';
import { RoleEnum } from '@/types/role_enum';
import { UserInfo } from '@/types/store';

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
	// 用户id
	userId: string | number;
	// 用户名
	username: string;
	// 昵称
	nickName: string;
	// 头像
	avatar?: string;
	// 介绍
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

export function getAuthInfo(type: string) {
	let infoStr = localStorage.getItem(type);
	if (infoStr) {
		return JSON.parse(infoStr);
	}
	return null;
}
