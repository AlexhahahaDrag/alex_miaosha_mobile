import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config';

export interface CpnUserCouponInfoData {
	id?: number;
	userId?: number;
	userName?: string;
	couponId?: number;
	couponName?: string;
	status?: string;
	redemptionQuantity?: number;
	receiveTime?: Dayjs | string;
	expireTime?: Dayjs | string;
}

export interface SearchInfo {
	userName?: string;
	couponName?: string;
}

export const pagination = ref<PageInfo>({
	total: 0,
	current: 1,
	pageSize: 10,
});
