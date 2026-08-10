import type { MenuInfoData } from '@/views/user/menuInfo/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';

export interface PermissionRole {
	roleCode?: string;
	permissionList?: Array<{ permissionCode?: string }>;
	[key: string]: unknown;
}

export interface PermissionContext {
	orgInfo: OrgInfoData | null;
	roleList: PermissionRole[];
	/** 首个角色，兼容旧 store 的 roleInfo 读取 */
	roleInfo: RoleInfoData | null;
	permissionCodes: string[];
	buttonPermissionCodes: string[];
	menuList: MenuInfoData[];
	/** 与 menuList 同义，兼容旧 store */
	menuInfo: MenuInfoData[];
	superAdmin: boolean;
}

interface LoginAdminLike {
	menuInfoVoList?: MenuInfoData[];
	roleInfoVo?: RoleInfoData | null;
	roleInfoVoList?: RoleInfoData[];
	orgInfoVo?: OrgInfoData | null;
	permissionCodes?: string[];
	buttonPermissionCodes?: string[];
	permissionContext?: {
		menuList?: MenuInfoData[];
		menuInfoVoList?: MenuInfoData[];
		roleList?: PermissionRole[];
		roleInfoVo?: RoleInfoData | null;
		roleInfoVoList?: RoleInfoData[];
		orgInfo?: OrgInfoData | null;
		orgInfoVo?: OrgInfoData | null;
		permissionCodes?: string[];
		buttonPermissionCodes?: string[];
		superAdmin?: boolean;
	};
	[key: string]: unknown;
}

const uniq = (codes: Array<string | undefined | null>) =>
	Array.from(new Set(codes.filter((code): code is string => !!code)));

/** 解析角色列表：优先 permissionContext，再回落顶层字段 */
const resolveRoleList = (admin?: LoginAdminLike | null): PermissionRole[] => {
	const pc = admin?.permissionContext;
	if (pc?.roleList?.length) return pc.roleList;
	if (pc?.roleInfoVoList?.length) return pc.roleInfoVoList;
	if (pc?.roleInfoVo) return [pc.roleInfoVo];
	if (admin?.roleInfoVoList?.length) return admin.roleInfoVoList;
	if (admin?.roleInfoVo) return [admin.roleInfoVo];
	return [];
};

const resolveMenuList = (admin?: LoginAdminLike | null): MenuInfoData[] => {
	const pc = admin?.permissionContext;
	if (pc?.menuList?.length) return pc.menuList;
	if (pc?.menuInfoVoList?.length) return pc.menuInfoVoList;
	return admin?.menuInfoVoList || [];
};

/**
 * 对齐 PC normalizePermissionContext：
 * 多角色 permissionList 去重并集 → permissionCodes；super_super → superAdmin。
 */
export const normalizePermissionContext = (
	admin?: LoginAdminLike | null,
): PermissionContext => {
	const pc = admin?.permissionContext || {};
	const roleList = resolveRoleList(admin);
	const menuList = resolveMenuList(admin);
	const permissionCodes = uniq([
		...(pc.permissionCodes || []),
		...(admin?.permissionCodes || []),
		...roleList.flatMap((role) =>
			(role.permissionList || []).map((permission) => permission.permissionCode),
		),
	]);
	const buttonPermissionCodes = uniq([
		...(pc.buttonPermissionCodes || []),
		...(admin?.buttonPermissionCodes || []),
	]);
	const roleInfo = (roleList[0] as RoleInfoData | undefined) || null;

	return {
		orgInfo: pc.orgInfo || pc.orgInfoVo || admin?.orgInfoVo || null,
		roleList,
		roleInfo,
		permissionCodes,
		buttonPermissionCodes,
		menuList,
		menuInfo: menuList,
		superAdmin:
			pc.superAdmin === true ||
			roleList.some((role) => role?.roleCode === 'super_super'),
	};
};

/** store / 业务入口：与 normalizePermissionContext 同形 */
export const buildPermissionContext = (admin: LoginAdminLike): PermissionContext =>
	normalizePermissionContext(admin);

export interface RouteAccessOptions {
	superAdmin: boolean;
	permissionCodes: string[];
	roleCode?: string;
	permissionList?: Array<{ permissionCode?: string }>;
}

/** 动态路由注册：store 的 superAdmin / permissionCodes 优先，回落首个 role 的 permissionList */
export const canAccessRoutePermission = (
	permissionCode: string | undefined,
	options: RouteAccessOptions,
): boolean => {
	if (!permissionCode) {
		return true;
	}
	if (options.superAdmin || options.roleCode === 'super_super') {
		return true;
	}
	if (options.permissionCodes.length) {
		return options.permissionCodes.includes(permissionCode);
	}
	const list = options.permissionList;
	if (list?.length) {
		return list.some((item) => item?.permissionCode === permissionCode);
	}
	return false;
};
