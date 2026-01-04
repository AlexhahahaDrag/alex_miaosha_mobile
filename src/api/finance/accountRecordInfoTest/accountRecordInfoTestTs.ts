import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseAccountRecordInfoTest = '/api/v1//account-record-info-test';

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
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
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

export function addOrEditAccountRecordInfoTest(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseAccountRecordInfoTest + AccountRecordInfoTestUrl.url,
			params,
		);
	}
}
