import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseAccountRecordInfoTest = '/account-record-info-test';

const AccountRecordInfoTestUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoTestPage(
	params: number | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getAccountRecordInfoTestDetail(id: number): Promise<any> {
	return getData(
		`${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url}?id=${id}`,
	);
}

export function deleteAccountRecordInfoTest(ids: string): Promise<any> {
	return deleteData(
		`${baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url}?ids=${ids}`,
	);
}

export function addAccountRecordInfoTest(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
			params,);
}

export function updateAccountRecordInfoTest(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
			params,);
}
