import type { PrepaidCardInfoTData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

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
export function getPrepaidCardInfoDetail(id: string): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return getData(url, { id });
}

export function addPrepaidCardInfo(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return postData(url, params);
}

export function updatePrepaidCardInfo(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return putData(url, params);
}

export function deletePrepaidCardInfo(ids: string): Promise<ResponseBody<boolean>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidCardInfoList(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.list;
	return postData(url, params);
}

export function getPrepaidCardInfoPage(
	params: PrepaidCardInfoTData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidCardInfoTData>>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function prepaidCardConsumeAndRecharge(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.consumeAndRecharge;
	return postData(url, params);
}

// 消费卡交易记录表相关接口
export function getPrepaidConsumeRecordDetail(
	id: string,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return getData(url, { id });
}

export function addPrepaidConsumeRecord(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return postData(url, params);
}

export function updatePrepaidConsumeRecord(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return putData(url, params);
}

export function deletePrepaidConsumeRecord(ids: string): Promise<ResponseBody<boolean>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidConsumeRecordPage(
	params: PrepaidCardInfoTData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidCardInfoTData>>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

// 消费卡交易记录类型 - 基于API文档 PrepaidConsumeRecordTVo
export interface TransactionRecord {
	id: string;
	amount: number; // 金额
	balanceAfter: number; // 余额
	cardId: string; // 卡片ID
	cardName: string; // 卡片名称
	consumeTime: string; // 消费时间
	createTime: string; // 创建时间
	creator: number; // 创建人
	deleteTime?: string; // 删除时间
	deleter?: number; // 删除人
	description?: string; // 描述
	isDelete: number; // 是否删除
	merchantName: string; // 商户名称
	operateTime: string; // 操作时间
	operator: number; // 操作人
	orderNo: string; // 订单号
	type: string; // 类型
	updateTime: string; // 更新时间
	updater: number; // 更新人
}

// 查询参数
export interface TransactionQueryParams {
	type?: 'all' | 'income' | 'expense'; // 交易类型筛选
	startDate?: string; // 开始日期
	endDate?: string; // 结束日期
	keyword?: string; // 关键词搜索
	cardId?: number | string; // 卡片ID
}

/**
 * 获取消费卡交易记录表分页
 */
export function getConsumeCardRecordPage(
	params: TransactionQueryParams,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<TransactionRecord>>> {
	const url = `${baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}
