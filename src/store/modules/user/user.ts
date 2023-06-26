import { loginApi } from "@/api/user/login";
import { defineStore } from "pinia";
import { UserState } from "./typing";
import { LoginParams } from "@/api/user/login";
import { piniaPersistConfig } from '@/config/piniaPersist';

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    userInfo: null,
    token: undefined,
    roleList: [],
    sessionTimeout: false,
    lastUpdateTime: 0,
  }),

  getters: {
    getUserInfo(): any {
      return this.userInfo;
      // return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      let sessionStorage = window.sessionStorage;
      return this.token || sessionStorage.getItem("token") || "";
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : "";
    },
    //设置用户信息
    setUserInfo(admin) {
      this.userInfo = admin;
    },
    async login(
      params: LoginParams & {
        goHome?: boolean;
      }
    ) {
      try {
        const { goHome = true, ...loginParams } = params;
        const data = await loginApi(loginParams);
        if (data.code == '200') {
          const { token, admin } = data.data;
          // save userInfo
          this.setUserInfo(admin);
          // save token
          this.setToken(token);
          return admin;
        } else {
          // todo 添加提示信息
          // message.error((data && data.message) || "删除失败！", 3);
        }
      } catch (error) {
        // message.error("系统错误，请联系管理员！", 3);
        return Promise.reject(error);
      }
    },
  },
  persist: piniaPersistConfig('app-user'),
});
