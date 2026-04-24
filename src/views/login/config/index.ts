import type { UserInfo } from '@/types/store';

export interface LoginResultData {
	admin: UserInfo;
	token: string;
}
