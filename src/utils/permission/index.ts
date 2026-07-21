import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';

export interface PermissionRole {
	roleCode?: string;
	permissionList?: Array<{ permissionCode?: string }>;
}

export interface PermissionContext {
	orgInfo?: OrgInfoData | null;
	roleList: PermissionRole[];
	permissionCodes: string[];
	buttonPermissionCodes: string[];
	menuList: MenuInfoData[];
	superAdmin: boolean;
}

export interface LoginAdminWithPermissionContext {
	permissionContext?: Partial<PermissionContext> & {
		menuInfoVoList?: MenuInfoData[];
		roleInfoVo?: RoleInfoData | null;
		roleInfoVoList?: RoleInfoData[];
		orgInfoVo?: OrgInfoData | null;
	};
	menuInfoVoList?: MenuInfoData[];
	roleInfoVo?: PermissionRole | RoleInfoData | null;
	roleInfoVoList?: Array<PermissionRole | RoleInfoData>;
	orgInfoVo?: OrgInfoData | null;
	permissionCodes?: string[];
	buttonPermissionCodes?: string[];
	[key: string]: unknown;
}

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

const uniq = (codes: Array<string | undefined | null>) =>
	Array.from(new Set(codes.filter((code): code is string => !!code)));

const pickPrimaryRole = (admin: LoginAdminLike): RoleInfoData | null => {
	if (admin.permissionContext?.roleInfoVoList?.length)
		return admin.permissionContext.roleInfoVoList[0] || null;
	if (admin.permissionContext?.roleInfoVo) return admin.permissionContext.roleInfoVo;
	if (admin.roleInfoVoList?.length) return admin.roleInfoVoList[0] || null;
	return admin.roleInfoVo || null;
};

/** 登录后组装菜单/角色/机构（现有路由逻辑依赖） */
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

/** 归一化按钮/页面权限码上下文（对齐 PC） */
export const normalizePermissionContext = (
	admin?: LoginAdminWithPermissionContext | null,
): PermissionContext => {
	const permissionContext = admin?.permissionContext || {};
	const legacyRoleList = admin?.roleInfoVoList?.length
		? admin.roleInfoVoList
		: admin?.roleInfoVo
			? [admin.roleInfoVo]
			: [];

	const roleList = (
		permissionContext.roleList?.length ? permissionContext.roleList : legacyRoleList
	) as PermissionRole[];

	const permissionCodes = uniq([
		...(permissionContext.permissionCodes || []),
		...(admin?.permissionCodes || []),
		...roleList.flatMap((role) =>
			(role.permissionList || []).map((permission) => permission.permissionCode),
		),
	]);
	const buttonPermissionCodes = uniq([
		...(permissionContext.buttonPermissionCodes || []),
		...(admin?.buttonPermissionCodes || []),
	]);

	return {
		orgInfo: permissionContext.orgInfo || admin?.orgInfoVo || null,
		roleList,
		permissionCodes,
		buttonPermissionCodes,
		menuList: permissionContext.menuList?.length
			? permissionContext.menuList
			: admin?.menuInfoVoList || [],
		superAdmin:
			permissionContext.superAdmin === true ||
			roleList.some((role) => role?.roleCode === 'super_super'),
	};
};

export const buildPermissionSet = (context?: Partial<PermissionContext> | null) =>
	new Set<string>([...(context?.permissionCodes || []), ...(context?.buttonPermissionCodes || [])]);

export const isSuperAdmin = (
	contextOrRole?: Partial<PermissionContext> | PermissionRole | null,
) => {
	if (!contextOrRole) return false;
	if ('superAdmin' in contextOrRole && contextOrRole.superAdmin === true) return true;
	if ('roleList' in contextOrRole) {
		return !!contextOrRole.roleList?.some((role) => role?.roleCode === 'super_super');
	}
	if ('roleCode' in contextOrRole) return contextOrRole.roleCode === 'super_super';
	return false;
};

export const canAccessPermission = (
	permissionSet: Set<string>,
	permissionCode?: string,
	superAdmin = false,
) => {
	if (superAdmin) return true;
	if (!permissionCode) return false;
	return permissionSet.has(permissionCode);
};
