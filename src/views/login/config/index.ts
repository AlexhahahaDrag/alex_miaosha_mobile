import type { MenuInfo, OrgInfo, RolePermissionInfo } from '@/store/modules/user/typing';
import type { UserInfo } from '@/types/store';

export interface LoginAdminData extends UserInfo {
	menuInfoVoList?: MenuInfo[];
	roleInfoVo?: RolePermissionInfo | null;
	orgInfoVo?: OrgInfo | null;
}

export interface LoginResultData {
	admin: LoginAdminData;
	token: string;
}

export interface LoginForm {
	username: string;
	password: string;
}
