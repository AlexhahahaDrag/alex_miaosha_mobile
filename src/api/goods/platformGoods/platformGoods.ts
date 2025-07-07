import { getData, deleteData, baseService } from '@/api/common/index';

const baseGoods = '/api/v1';

const platformGoodsUrl = {
	list: '/goods/getGoodsList',
};

export function getPlatformList(params: any): Promise<any> {
	return getData(
		baseService.mission + baseGoods + platformGoodsUrl.list,
		params,
	);
}

export function deleteBlogById(id: number) {
	return deleteData('/api/blog/delete?id=' + id);
}
