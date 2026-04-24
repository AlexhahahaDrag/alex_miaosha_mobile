import type { Dayjs } from 'dayjs';

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
	cancelTime?: Dayjs | string;
	cancelRemarks?: string;
	cancelOperatorName?: string;
	operationRecords?: OperationRecord[];
	[key: string]: unknown;
}

// 状态筛选选项
export const statusOptions = [
	{ text: '全部', value: 'ALL' },
	{ text: '已核销', value: 'USED' },
	{ text: '已取消', value: 'UNUSED' },
];
