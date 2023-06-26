import { Nullable } from "@/types/global";
import { RoleEnum } from "@/types/role_enum";
import { UserInfo } from "@/types/store";

export interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

export interface GetUserInfoModel {
  roles: RoleInfo[];
  // 用户id
  userId: string | number;
  // 用户名
  username: string;
  // 昵称
  nickName: string;
  // 头像
  avatar?: string;
  // 介绍
  desc?: string;
}
