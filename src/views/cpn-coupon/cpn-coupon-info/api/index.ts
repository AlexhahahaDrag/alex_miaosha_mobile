import type { CpnCouponInfoData } from '../config/index';
import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';
import type { ResponseBody, CommonPageResult } from '@/types/api';

const baseCpnCouponInfo = '/api/v1/cpn-coupon-info';

const cpnCouponInfoUrl = {
	page: '/page',
	url: '',
};

// 获取优惠券信息分页
export const getCpnCouponInfoPage = async (
	params: CpnCouponInfoData,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<CpnCouponInfoData>>> => {
	const url = `${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
};

// 获取优惠券信息详情
export const getCpnCouponInfoDetail = async (
	id: string,
): Promise<ResponseBody<CpnCouponInfoData>> => {
	return getData(`${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url}`, { id });
};

// 删除优惠券信息
export const deleteCpnCouponInfo = async (ids: string): Promise<ResponseBody<boolean>> => {
	return deleteData(`${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url}?ids=${ids}`);
};

// 添加优惠券信息
export const addCpnCouponInfo = async (
	params: CpnCouponInfoData,
): Promise<ResponseBody<boolean>> => {
	return postData(baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url, params);
};

// 编辑优惠券信息
export const editCpnCouponInfo = async (
	params: CpnCouponInfoData,
): Promise<ResponseBody<boolean>> => {
	return putData(baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url, params);
};
