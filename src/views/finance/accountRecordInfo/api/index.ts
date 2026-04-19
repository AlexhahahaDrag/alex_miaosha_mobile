import type { AccountRecordInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseAccountRecordInfo = '/account-record-info';

const AccountRecordInfoUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoPage(
	params: AccountRecordInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<AccountRecordInfoData>>> {
	const url = `${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getAccountRecordInfoDetail(
	id: number,
): Promise<ResponseBody<AccountRecordInfoData>> {
	return getData(
		`${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url}?id=${id}`,
	);
}

export function deleteAccountRecordInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url}?ids=${ids}`,
	);
}

export function addAccountRecordInfo(
	params: AccountRecordInfoData,
): Promise<ResponseBody<AccountRecordInfoData>> {
	return postData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
}

export function updateAccountRecordInfo(
	params: AccountRecordInfoData,
): Promise<ResponseBody<AccountRecordInfoData>> {
	return putData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
}
