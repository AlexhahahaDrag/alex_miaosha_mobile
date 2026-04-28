import type { PlatformGoodsData } from '../config';
import { getData, deleteData, baseService } from '@/views/common/api';

const baseGoods = '/api/v1';

const platformGoodsUrl = {
	list: '/goods/getGoodsList',
};

export function getPlatformList(params: PlatformGoodsData): Promise<ResponseBody<boolean>> {
	return getData(baseService.mission + baseGoods + platformGoodsUrl.list, params);
}

export function deleteBlogById(id: string) {
	return deleteData(`/api/blog/delete?id=${id}`);
}
