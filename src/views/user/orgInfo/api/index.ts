import type { OrgInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseOrgInfo = '/org-info';

const OrgInfoUrl = {
	page: '/page',
	tree: '/tree',
	url: '',
};

export function getOrgInfoPage(
	params: OrgInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<OrgInfoData>>> {
	const url = `${baseService.user + baseOrgInfo + OrgInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

// 获取机构树（后端按 parentId 组装 children，复用数据权限过滤，禁止前端再用 page(1,1000) 拼树）
export function getOrgInfoTree(params?: OrgInfoData): Promise<ResponseBody<OrgInfoData[]>> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.tree, params || {});
}

export function getOrgInfoDetail(id: string): Promise<ResponseBody<OrgInfoData>> {
	return getData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}`, { id });
}

export function deleteOrgInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}`, { ids });
}

export function addOrgInfo(params: OrgInfoData): Promise<ResponseBody<OrgInfoData>> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}

export function updateOrgInfo(params: OrgInfoData): Promise<ResponseBody<OrgInfoData>> {
	return putData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}
