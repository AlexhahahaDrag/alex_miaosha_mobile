import { loginApi } from '@/api/user/login';
import { defineStore } from 'pinia';
import { UserState, getAuthInfo } from './typing';
import { LoginParams } from '@/api/user/login';
import { piniaPersistConfig } from '@/config/piniaPersist';
import { showFailToast } from 'vant';
import type { MenuInfo } from './typing';
import { refreshRouter } from '@/router';

export const useUserStore = defineStore({
	id: 'app-user',
	state: (): UserState => ({
		userInfo: null,
		token: undefined,
		roleList: [],
		sessionTimeout: false,
		lastUpdateTime: 0,
		menuInfo: null,
		hasMenu: false,
		orgInfo: null,
		roleInfo: null,
	}),

	getters: {
		getUserInfo(): any {
			return this.userInfo;
			// return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
		},
		getToken(): string {
			let localStorage = window.localStorage;
			return this.token || localStorage.getItem('token') || '';
		},
		getMenuInfo(): MenuInfo[] | null {
			return this.menuInfo || getAuthInfo('menuInfo');
		},
		getSessionTimeout(): boolean {
			return !!this.sessionTimeout;
		},
		getLastUpdateTime(): number {
			return this.lastUpdateTime;
		},
		getRouteStatus(): Boolean {
			return this.hasMenu || localStorage.getItem('hasRoute') === 'true';
		},
		getRoleInfo(): any {
			return this.roleInfo || getAuthInfo('roleInfo');
		},
		getOrgInfo(): any {
			return this.orgInfo || getAuthInfo('orgInfo');
		},
	},
	actions: {
		setToken(info: string | undefined) {
			this.token = info ? info : '';
			localStorage.setItem('token', this.token);
		},
		//设置用户信息
		setUserInfo(admin: any) {
			this.userInfo = admin;
			localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
		},
		setMenuInfo(info: MenuInfo[]) {
			this.menuInfo = info ? info : null;
			localStorage.setItem('menuInfo', JSON.stringify(this.menuInfo));
		},
		changeRouteStatus(state: any) {
			this.hasMenu = state;
			localStorage.setItem('hasRoute', state);
		},
		//设置用户信息
		setRoleInfo(roleInfo: any) {
			this.roleInfo = roleInfo;
			localStorage.setItem('roleInfo', JSON.stringify(this.roleInfo));
		},
		setOrgInfo(orgInfo: any) {
			this.orgInfo = orgInfo;
			localStorage.setItem('orgInfo', JSON.stringify(this.orgInfo));
		},
		async login(
			params: LoginParams & {
				goHome?: boolean;
			},
		) {
			try {
				const { goHome = true, ...loginParams } = params;
				const data = await loginApi(loginParams);
				if (data?.code == '200') {
					const { token, admin } = data.data;
					this.setUserInfo(admin);
					this.setToken(token);
					this.setMenuInfo(admin.menuInfoVoList);
					this.setRoleInfo(admin.roleInfoVo);
					this.setOrgInfo(admin.orgInfoVo);
					this.changeRouteStatus(false);
					refreshRouter();
					return admin;
				} else {
					showFailToast(data?.message || '登录失败！');
				}
			} catch (error) {
				// message.error("系统错误，请联系管理员！", 3);
				return Promise.reject(error);
			}
		},
	},
	persist: piniaPersistConfig('app-user'),
});
