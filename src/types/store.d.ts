export interface UserInfo {
  userId: string | number;
  username: string;
  nickName: string;
  avatar: string;
  desc?: string;
  homePath?: string;
  roles: RoleInfo[];
  avatarUrl?: string;
}
