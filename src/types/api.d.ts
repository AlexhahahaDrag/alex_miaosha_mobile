//响应体
export interface ResponseBody<T = unknown> {
	message: string;
	code: string;
	data?: T;
}

//分页
export interface CommonPageResult<T = unknown> {
	countId?: number;
	current?: number;
	maxLimit?: number;
	pages?: number;
	records?: T[];
	searchCount?: boolean;
	size?: number;
	total?: number;
}

//请求结果
export interface RequestResult<T = unknown> {
	data: T;
	success: boolean;
	errorMessage: string;
}
