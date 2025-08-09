import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/api/common/index';

const baseConsumeCardRecord = '/api/v1/prepaid-consume-record-t';

const ConsumeCardRecordUrl = {
	page: '/page',
	url: '',
};

// 消费卡交易记录类型 - 基于API文档 PrepaidConsumeRecordTVo
export interface TransactionRecord {
	id: number;
	amount: number; // 金额
	balanceAfter: number; // 余额
	cardId: number; // 卡片ID
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
 * @param params 查询参数
 * @param pageNo 页码
 * @param pageSize 每页大小
 */
export function getConsumeCardRecordPage(
	params: TransactionQueryParams,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	let url =
		baseService.finance +
		baseConsumeCardRecord +
		ConsumeCardRecordUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	return postData(url, params);
}

/**
 * 获取交易记录详情
 * @param id 记录ID
 */
export function getConsumeCardRecordDetail(
	id: number,
): Promise<TransactionRecord> {
	return getData(
		baseService.finance +
			baseConsumeCardRecord +
			ConsumeCardRecordUrl.url +
			'?id=' +
			id,
	);
}

/**
 * 删除交易记录
 * @param ids 记录ID列表
 */
export function deleteConsumeCardRecord(ids: string): Promise<any> {
	return deleteData(
		baseService.finance +
			baseConsumeCardRecord +
			ConsumeCardRecordUrl.url +
			'?ids=' +
			ids,
	);
}

/**
 * 添加或编辑交易记录
 * @param method 方法类型
 * @param params 参数
 */
export function addOrEditConsumeCardRecord(
	method: string,
	params: TransactionRecord,
): Promise<any> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseConsumeCardRecord + ConsumeCardRecordUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseConsumeCardRecord + ConsumeCardRecordUrl.url,
			params,
		);
	}
}
