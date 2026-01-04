import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseAccountRecordInfo = '/api/v1/account-record-info';

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
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
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

export function addOrEditAccountRecordInfo(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
	} else {
		return postData(baseService.finance + baseAccountRecordInfo + AccountRecordInfoUrl.url, params);
	}
}
