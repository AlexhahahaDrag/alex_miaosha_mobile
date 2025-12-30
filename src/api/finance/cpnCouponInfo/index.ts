import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseCpnCouponInfo = '/api/v1/cpn-coupon-info';

const cpnCouponInfoUrl = {
	page: '/page',
	url: '',
};

export function getCpnCouponInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.page}?pageNum=${
		pageNo ? pageNo : 1
	}&pageSize=${pageSize ? pageSize : 10}`;
	return postData(url, params);
}

export function getCpnCouponInfoDetail(id: string): Promise<any> {
	return getData(`${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url}?id=${id}`);
}

export function deleteCpnCouponInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url}?ids=${ids}`);
}

export function addOrEditCpnCouponInfo(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url, params);
	} else {
		return postData(baseService.finance + baseCpnCouponInfo + cpnCouponInfoUrl.url, params);
	}
}
