import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';

interface LoginAdminLike {
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
	[key: string]: unknown;
}

const pickPrimaryRole = (admin: LoginAdminLike): RoleInfoData | null => {
	if (admin.permissionContext?.roleInfoVoList?.length)
		return admin.permissionContext.roleInfoVoList[0] || null;
	if (admin.permissionContext?.roleInfoVo) return admin.permissionContext.roleInfoVo;
	if (admin.roleInfoVoList?.length) return admin.roleInfoVoList[0] || null;
	return admin.roleInfoVo || null;
};

export const buildPermissionContext = (admin: LoginAdminLike) => {
	const menuInfo = admin.permissionContext?.menuInfoVoList?.length
		? admin.permissionContext.menuInfoVoList
		: admin.menuInfoVoList || [];
	const roleInfo = pickPrimaryRole(admin);
	const orgInfo = admin.permissionContext?.orgInfoVo || admin.orgInfoVo || null;
	return {
		menuInfo,
		roleInfo,
		orgInfo,
	};
};
