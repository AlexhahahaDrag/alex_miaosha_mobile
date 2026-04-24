import type { Dayjs } from 'dayjs';

export interface CpnCouponInfoData {
	id?: string;
	couponName?: string;
	totalQuantity?: number;
	startDate?: string | Dayjs | null;
	endDate?: string | Dayjs | null;
	unitValue?: number;
	minSpend?: number;
	expireStatus?: string;
	expireRangeStatus?: number;
	remainingQuantity?: number;
	consumedQuantity?: number;
	paymentStatus?: number;
	currentRate?: number;
	onlyValidAndNotFullyRedeemed?: boolean;
	[key: string]: unknown;
}

export const rulesRef = reactive({
	couponName: [
		{
			required: true,
			message: '消费券名称不能为空！',
		},
	],
	totalQuantity: [
		{
			required: true,
			message: '总数量不能为空！',
		},
	],
	unitValue: [
		{
			required: true,
			message: '面值不能为空！',
		},
	],
	endDate: [
		{
			required: true,
			message: '结束日期不能为空！',
		},
	],
});
