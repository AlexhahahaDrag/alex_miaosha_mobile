import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';
import type { PermissionContext } from '@/utils/permission';

export interface LoginAdminData extends UserManagerData {
	menuInfoVoList?: MenuInfoData[];
	roleInfoVo?: RoleInfoData | null;
	roleInfoVoList?: RoleInfoData[];
	orgInfoVo?: OrgInfoData | null;
	permissionContext?: Partial<PermissionContext>;
}

export interface LoginResultData {
	admin: LoginAdminData;
	token: string;
}

export interface LoginForm {
	username: string;
	password: string;
}
