import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const basePrepaidCardInfo = '/prepaid-card-info-t';
const basePrepaidConsumeRecord = '/prepaid-consume-record-t';

const PrepaidCardInfoUrl = {
	detail: '',
	list: '/list',
	page: '/page',
	consumeAndRecharge: '/consumeAndRecharge',
};

const PrepaidConsumeRecordUrl = {
	detail: '',
	page: '/page',
};

// 消费卡信息表相关接口
export function getPrepaidCardInfoDetail(id: number | string): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return getData(url, { id });
}

export function addPrepaidCardInfo(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return postData(url, params);
}

export function updatePrepaidCardInfo(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return putData(url, params);
}

export function deletePrepaidCardInfo(ids: string): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidCardInfoList(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.list;
	return postData(url, params);
}

export function getPrepaidCardInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function prepaidCardConsumeAndRecharge(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.consumeAndRecharge;
	return postData(url, params);
}

// 消费卡交易记录表相关接口
export function getPrepaidConsumeRecordDetail(id: number): Promise<any> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return getData(url, { id });
}

export function addPrepaidConsumeRecord(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return postData(url, params);
}

export function updatePrepaidConsumeRecord(params: any): Promise<any> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return putData(url, params);
}

export function deletePrepaidConsumeRecord(ids: string): Promise<any> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidConsumeRecordPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}
