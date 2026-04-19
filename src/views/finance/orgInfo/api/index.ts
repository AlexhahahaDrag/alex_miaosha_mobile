import type { OrgInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseOrgInfo = '/org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: OrgInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<OrgInfoData>>> {
	const url = `${baseService.finance + baseOrgInfo + OrgInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getOrgInfoDetail(id: number): Promise<ResponseBody<OrgInfoData>> {
	return getData(`${baseService.finance + baseOrgInfo + OrgInfoUrl.url}`, { id });
}

export function deleteOrgInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseOrgInfo + OrgInfoUrl.url}`, { ids });
}

export function addOrgInfo(params: OrgInfoData): Promise<ResponseBody<OrgInfoData>> {
	return postData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}

export function updateOrgInfo(params: OrgInfoData): Promise<ResponseBody<OrgInfoData>> {
	return putData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}
