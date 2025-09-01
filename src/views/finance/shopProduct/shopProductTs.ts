import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config/index';

export interface SearchInfo {
	shopName?: string;
	shopCode?: string;
	costAmount?: number;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	category?: string;
	purchasePlace?: string;
	saleNum?: number;
	isShopping?: boolean;
	title?: string;
}

export const pagination = ref<PageInfo>({
	// 数据总数
	total: 0,
	// 当前页数
	current: 1,
	// 每页条数
	pageSize: 10,
	// 展示总数
	showTotal: (total: number) => `共 ${total} 条`,
	// 是否可以改变pageSize
	showSizeChanger: true,
	// 设置每页可以展示多少条的选项
	pageSizeOptions: ['10', '20', '50', '100'],
	// 改变pageSize后触发
	showSizeChange: (current: number, pageSize: number) => (
		(pagination.value.current = current),
		(pagination.value.pageSize = pageSize)
	),
	// 小尺寸分页
	size: 'small',
	// 是否可以快速跳转至某页
	showQuickJumper: true,
	//默认条数
	defaultPageSize: 10,
});

export interface ShopStockInfo {
	id?: number;
	shopName: string;
	shopCode: string;
	costAmount: number;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	category: string;
	purchasePlace: string;
	saleNum: number;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
