import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { UserInfo } from '@/types/store';

export interface LoginAdminData extends UserInfo {
	menuInfoVoList?: MenuInfoData[];
	roleInfoVo?: RoleInfoData | null;
	roleInfoVoList?: RoleInfoData[];
	orgInfoVo?: OrgInfoData | null;
	permissionContext?: {
		menuInfoVoList?: MenuInfoData[];
		roleInfoVo?: RoleInfoData | null;
		roleInfoVoList?: RoleInfoData[];
		orgInfoVo?: OrgInfoData | null;
	};
}

export interface LoginResultData {
	admin: LoginAdminData;
	token: string;
}

export interface LoginForm {
	username: string;
	password: string;
}
