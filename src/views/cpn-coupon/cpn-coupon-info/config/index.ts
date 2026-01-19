import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config';

export const pagination = ref<PageInfo>({
	// 数据总数
	total: 50,
	// 当前页数
	current: 1,
	// 每页条数
	pageSize: 10,
});

export interface SearchInfo {
	couponName?: string;
	onlyValidAndNotFullyRedeemed?: boolean;
}

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
	// 为了列表的环形图展示
	currentRate?: number;
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
	endDate: [
		{
			required: true,
			message: '结束日期不能为空！',
		},
	],
});
