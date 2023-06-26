//响应体
export interface ResponseBody<T = any> {
    message: string;
    code: number;
    data?: T | T[];
}

//分页
export interface PageResult<T = any> {
    data: T[];
    current?: number;
    pageSize?: number;
    total?: number;
    success: boolean;
}

//请求结果
export interface RequestResult<T = any> {
    data: T;
    success: boolean;
    errorMessage: string;
}