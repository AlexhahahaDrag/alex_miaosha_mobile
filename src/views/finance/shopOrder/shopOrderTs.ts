import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config/index';

export interface SearchInfo {
	saleOrderCode?: string | null;
	saleOrderName?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	description?: string;
	payWay?: string;
	saleCount?: number;
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
	showSizeChange: (current: number, pageSize: any) => (
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

export const columns = [
	{
		title: '订单编码',
		dataIndex: 'saleOrderCode',
		key: 'saleOrderCode',
	},
	{
		title: '订单名称',
		dataIndex: 'saleOrderName',
		key: 'saleOrderName',
	},
	{
		title: '总销售金额',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '销售日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '支付方式',
		dataIndex: 'payWay',
		key: 'payWay',
	},
	{
		title: '销售数量',
		dataIndex: 'saleCount',
		key: 'saleCount',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
];

export interface DataItem {
	saleOrderCode: string;
	saleOrderName: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	description: string;
	payWay: string;
	saleCount: number;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
