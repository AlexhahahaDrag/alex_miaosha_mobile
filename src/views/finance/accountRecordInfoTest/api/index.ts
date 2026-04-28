import type { AccountRecordInfoTestData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseAccountRecordInfoTest = '/account-record-info-test';

const AccountRecordInfoTestUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoTestPage(
	params: number | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<AccountRecordInfoTestData>>> {
	const url = `${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getAccountRecordInfoTestDetail(
	id: string,
): Promise<ResponseBody<AccountRecordInfoTestData>> {
	return getData(
		`${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url}?id=${id}`,
	);
}

export function deleteAccountRecordInfoTest(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url}?ids=${ids}`,
	);
}

export function addAccountRecordInfoTest(
	params: AccountRecordInfoTestData,
): Promise<ResponseBody<AccountRecordInfoTestData>> {
	return postData(
		baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
		params,
	);
}

export function updateAccountRecordInfoTest(
	params: AccountRecordInfoTestData,
): Promise<ResponseBody<AccountRecordInfoTestData>> {
	return putData(
		baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
		params,
	);
}
