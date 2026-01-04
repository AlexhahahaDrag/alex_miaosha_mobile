import type { ResponseBody, CommonPageResult } from '../../../types/api';
import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseDictManager = '/api/v1/dict-info';

const dictUrl = {
	page: '/page',
	listByBelong: '/listByBelong',
	url: '',
};

export interface DictInfo {
	id?: number;
	name?: string;
	typeCode?: string;
	typeName?: string;
	belongTo?: string;
}

export function getDictManagerPage(
	params: DictInfo,
	pageNum: number | undefined,
	pageSize: number | undefined,
): Promise<ResponseBody<CommonPageResult<DictInfo>>> {
	const url = `${baseService.finance + baseDictManager + dictUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getDictList(belongTo: string): Promise<ResponseBody<DictInfo[]>> {
	return getData(`${baseService.finance + baseDictManager + dictUrl.listByBelong}`, { belongTo });
}

export function getDictManagerDetail(id: number): Promise<ResponseBody<DictInfo>> {
	return getData(`${baseService.finance + baseDictManager + dictUrl.url}`, { id });
}

export function deleteDictManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseDictManager + dictUrl.url}`, { ids });
}

export function addDictManager(params: DictInfo): Promise<ResponseBody<boolean>> {
	return postData(baseService.finance + baseDictManager + dictUrl.url, params);
}

export function editDictManager(params: DictInfo): Promise<ResponseBody<boolean>> {
	return putData(baseService.finance + baseDictManager + dictUrl.url, params);
}
