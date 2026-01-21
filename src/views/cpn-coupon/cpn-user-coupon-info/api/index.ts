import type { CpnUserCouponInfoData } from '../config';
import { getData, postData, baseService } from '@/api/common/index';
import type { ResponseBody, CommonPageResult } from '@/types/api';

const baseCpnUserCouponInfo = '/api/v1/cpn-user-coupon-info';

const cpnUserCouponInfoUrl = {
	page: '/page',
	detail: '',
	cancelRedeem: '/redeem/cancel',
};

// 获取核销记录分页列表
export const getCpnUserCouponInfoPage = async (
	params: CpnUserCouponInfoData,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<CpnUserCouponInfoData>>> => {
	const url = `${baseService.finance + baseCpnUserCouponInfo + cpnUserCouponInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
};

// 获取核销记录详情
export const getCpnUserCouponInfoDetail = async (
	id: string,
): Promise<ResponseBody<CpnUserCouponInfoData>> => {
	return getData(`${baseService.finance + baseCpnUserCouponInfo + cpnUserCouponInfoUrl.detail}`, {
		id,
	});
};

// 核销消费券
export const redeemCpnUserCouponInfo = async (params: {
	userId?: string;
	couponId?: string;
	redemptionQuantity?: number;
	remarks?: string;
}): Promise<ResponseBody<boolean>> => {
	return postData(`${baseService.finance + baseCpnUserCouponInfo}/redeem`, params);
};

// 取消核销（按数量核销）
export const cancelRedeemCpnUserCouponInfo = async (params: {
	userId?: number;
	couponId?: number;
	userCouponId?: number;
	redemptionQuantity?: number;
	remarks?: string;
}): Promise<ResponseBody<boolean>> => {
	return postData(
		`${baseService.finance + baseCpnUserCouponInfo + cpnUserCouponInfoUrl.cancelRedeem}`,
		params,
	);
};
