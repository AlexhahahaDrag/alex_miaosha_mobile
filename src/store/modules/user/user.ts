import { defineStore } from 'pinia';
import { showFailToast } from 'vant';
import type { UserState } from './typing';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import { loginApi } from '@/views/login/api';
import type { LoginParams } from '@/views/login/api';
import { piniaPersistConfig } from '@/config/piniaPersist';
import { refreshRouter } from '@/router';
import {
	buildPermissionContext,
	normalizePermissionContext,
	type PermissionContext,
} from '@/utils/permission';

const createDefaultState = (): UserState => ({
	userInfo: null,
	token: '',
	roleList: [],
	sessionTimeout: false,
	lastUpdateTime: 0,
	menuInfo: null,
	hasMenu: false,
	orgInfo: null,
	roleInfo: null,
});

export const useUserStore = defineStore('app-user', {
	state: (): UserState => createDefaultState(),

	getters: {
		getUserInfo(state): UserState['userInfo'] {
			return state.userInfo;
		},
		getToken(state): string {
			return state.token || '';
		},
		getMenuInfo(state): MenuInfoData[] | null {
			return state.menuInfo;
		},
		getSessionTimeout(state): boolean {
			return !!state.sessionTimeout;
		},
		getLastUpdateTime(state): number {
			return state.lastUpdateTime;
		},
		getRouteStatus(state): boolean {
			return state.hasMenu;
		},
		getRoleInfo(state): UserState['roleInfo'] {
			return state.roleInfo;
		},
		getOrgInfo(state): UserState['orgInfo'] {
			return state.orgInfo;
		},
		getPermissionContext(): PermissionContext | null {
			const admin = this.userInfo;
			if (!admin) return null;
			return normalizePermissionContext({
				...(admin as Record<string, unknown>),
				roleInfoVo: this.roleInfo || undefined,
				roleInfoVoList: this.roleInfo ? [this.roleInfo] : [],
				menuInfoVoList: this.menuInfo || [],
				orgInfoVo: this.orgInfo,
			});
		},
	},
	actions: {
		setToken(info: string | undefined) {
			this.token = info || '';
		},
		setUserInfo(admin: UserState['userInfo']) {
			this.userInfo = admin;
		},
		setMenuInfo(info: MenuInfoData[] | null | undefined) {
			this.menuInfo = info || null;
		},
		changeRouteStatus(state: boolean) {
			this.hasMenu = state;
		},
		setRoleInfo(roleInfo: UserState['roleInfo']) {
			this.roleInfo = roleInfo;
		},
		setOrgInfo(orgInfo: UserState['orgInfo']) {
			this.orgInfo = orgInfo;
		},
		resetState() {
			Object.assign(this, createDefaultState());
			refreshRouter();
		},
		async login(
			params: LoginParams & {
				goHome?: boolean;
			},
		) {
			try {
				const { ...loginParams } = params;
				const data = await loginApi(loginParams);
				if (data?.code == '200' && data.data) {
					const { token, admin } = data.data;
					const permissionContext = buildPermissionContext(admin);
					this.setUserInfo(admin);
					this.setToken(token);
					this.setMenuInfo(permissionContext.menuInfo || null);
					this.setRoleInfo(permissionContext.roleInfo || null);
					this.setOrgInfo(permissionContext.orgInfo || null);
					this.changeRouteStatus(false);
					refreshRouter();
					return admin;
				}

				showFailToast(data?.message || '登录失败！');
			} catch (error: unknown) {
				return Promise.reject(error);
			}
		},
	},
	persist: piniaPersistConfig('app-user'),
});
