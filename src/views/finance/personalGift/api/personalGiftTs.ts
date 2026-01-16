import type { PersonalGiftData } from '../config';
import type { ResponseBody, CommonPageResult } from '@/types/api';
import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePersonalGift = '/api/v1/personal-gift';

const PersonalGiftUrl = {
	page: '/page',
	url: '',
};

export function getPersonalGiftPage(
	params: PersonalGiftData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PersonalGiftData>>> {
	const url = `${baseService.finance + basePersonalGift + PersonalGiftUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPersonalGiftDetail(id: string): Promise<ResponseBody<PersonalGiftData>> {
	return getData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}`, { id });
}

export function deletePersonalGift(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}`, { ids });
}

export function addPersonalGift(params: PersonalGiftData): Promise<ResponseBody<boolean>> {
	return postData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}`, params);
}

export function editPersonalGift(params: PersonalGiftData): Promise<ResponseBody<boolean>> {
	return putData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}`, params);
}
