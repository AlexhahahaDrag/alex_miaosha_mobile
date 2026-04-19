import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseAccountRecordInfo = '/account-record-info';

const AccountRecordInfoUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoPage(
	params: number | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getAccountRecordInfoDetail(id: number): Promise<any> {
	return getData(
		`${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url}?id=${id}`,
	);
}

export function deleteAccountRecordInfo(ids: string): Promise<any> {
	return deleteData(
		`${baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url}?ids=${ids}`,
	);
}

export function addAccountRecordInfo(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
}

export function updateAccountRecordInfo(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
}
