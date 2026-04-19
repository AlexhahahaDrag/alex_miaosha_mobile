import type { UserInfo } from '@/types/store';

export interface LoginResultModel {
	admin: UserInfo;
	token: string;
	//   role: RoleInfo;
}
