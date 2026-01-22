import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config';

// 操作记录项
export interface OperationRecord {
	id?: number;
	action?: string;
	actionName?: string;
	operateTime?: Dayjs | string;
	operatorName?: string;
	remarks?: string;
}

export interface CpnUserCouponInfoData {
	id?: number;
	userId?: number;
	userName?: string;
	couponId?: number;
	couponName?: string;
	couponImage?: string;
	unitValue?: number;
	status?: string | null;
	redemptionQuantity?: number;
	receiveTime?: Dayjs | string;
	expireTime?: Dayjs | string;
	operateTime?: Dayjs | string;
	paymentStatus?: number;
	remarks?: string;
	// 取消核销相关
	cancelTime?: Dayjs | string;
	cancelRemarks?: string;
	cancelOperatorName?: string;
	// 操作记录列表
	operationRecords?: OperationRecord[];
}

// 状态筛选选项
export const statusOptions = [
	{ text: '全部', value: 'ALL' },
	{ text: '已核销', value: 'USED' },
	{ text: '已取消', value: 'UNUSED' },
];

export const pagination = ref<PageInfo>({
	total: 0,
	current: 1,
	pageSize: 10,
});
