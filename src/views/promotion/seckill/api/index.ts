import type { SeckillData } from '../config';
import { getData, deleteData } from '@/views/common/api';

export function getSeckillList(params: SeckillData): Promise<ResponseBody<boolean>> {
	return getData('/api/blog/getList', params);
}

export function deleteBlogById(id: number) {
	return deleteData(`/api/blog/delete?id=${id}`);
}
