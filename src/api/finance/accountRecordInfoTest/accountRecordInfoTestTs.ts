import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/api/common/index';

const baseAccountRecordInfoTest = '/api/v1//account-record-info-test';

const AccountRecordInfoTestUrl = {
	page: '/page',
	url: '',
};

export function getAccountRecordInfoTestPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	let url =
		baseService.finance +
		baseAccountRecordInfoTest +
		AccountRecordInfoTestUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

export function getAccountRecordInfoTestDetail(id: number): Promise<any> {
	return getData(
		baseService.finance +
			baseAccountRecordInfoTest +
			AccountRecordInfoTestUrl.url +
			'?id=' +
			id,
	);
}

export function deleteAccountRecordInfoTest(ids: string): Promise<any> {
	return deleteData(
		baseService.finance +
			baseAccountRecordInfoTest +
			AccountRecordInfoTestUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditAccountRecordInfoTest(
	method: string,
	params: any,
): Promise<any> {
	if ('put' == method) {
		return putData(
			baseService.finance +
				baseAccountRecordInfoTest +
				AccountRecordInfoTestUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance +
				baseAccountRecordInfoTest +
				AccountRecordInfoTestUrl.url,
			params,
		);
	}
}
