import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';

export interface LoginAdminData extends UserManagerData {
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
