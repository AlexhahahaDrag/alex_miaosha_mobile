import type { Nullable } from '@/types/global';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

export interface UserState {
	id?: string;
	userInfo: Nullable<UserManagerData>;
	token?: string;
	roleList: RoleInfoData[];
	sessionTimeout?: boolean;
	lastUpdateTime: number;
	menuInfo: MenuInfoData[] | null;
	hasMenu: boolean;
	orgInfo: OrgInfoData | null;
	roleInfo: RoleInfoData | null;
}
