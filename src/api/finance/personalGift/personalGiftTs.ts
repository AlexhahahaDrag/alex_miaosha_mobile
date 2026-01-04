import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePersonalGift = '/api/v1//personal-gift';

const PersonalGiftUrl = {
	page: '/page',
	url: '',
};

export function getPersonalGiftPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + basePersonalGift + PersonalGiftUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPersonalGiftDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}?id=${id}`);
}

export function deletePersonalGift(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + basePersonalGift + PersonalGiftUrl.url}?ids=${ids}`);
}

export function addOrEditPersonalGift(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + basePersonalGift + PersonalGiftUrl.url, params);
	} else {
		return postData(baseService.finance + basePersonalGift + PersonalGiftUrl.url, params);
	}
}
