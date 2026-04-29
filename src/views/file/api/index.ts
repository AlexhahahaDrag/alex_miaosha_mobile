import type { FileInfoData, FileInfoFormData } from '../config';
import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
	postFileData,
} from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseFileManager = '/file-info';

const fileUrl = {
	page: '/page',
	url: '',
};

export function getFilePage(
	params: FileInfoData | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<FileInfoData>>> {
	const url = `${baseService.file + baseFileManager + fileUrl.page}?pageNum=${
		pageNum ?? 1
	}&pageSize=${pageSize ?? 10}`;
	return postData(url, params);
}

export function getFileDetail(id: string): Promise<ResponseBody<FileInfoData>> {
	return getData(`${baseService.file + baseFileManager + fileUrl.url}?id=${id}`);
}

export function addFileManager(
	type: string,
	params: FileInfoFormData,
): Promise<ResponseBody<boolean>> {
	return postFileData(`${baseService.file + baseFileManager + fileUrl.url}?type=${type}`, params);
}

export function editFileManager(params: FileInfoFormData): Promise<ResponseBody<boolean>> {
	return putData(baseService.file + baseFileManager + fileUrl.url, params);
}

export function deleteDictManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.file + baseFileManager + fileUrl.url}?ids=${ids}`);
}
