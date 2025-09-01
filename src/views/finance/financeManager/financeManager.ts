import { type PageInfo } from '@/views/common/config/index';

export interface SearchInfo {
	name?: string;
	typeCode?: string;
	fromSource?: string;
	isValid?: number;
	pageNo?: number;
	pageSize?: number;
	incomeAndExpenses?: string;
	belongTo?: number;
	infoDateStart?: string | null;
	infoDateEnd?: string | null;
	bigTypeCode?: string;
}

export const pagination = ref<PageInfo>({
	// 数据总数
	total: 50,
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

export interface DataItem {
	name: string;
	typeCode: string;
	typeName: string;
	amount: number;
	fromSource: string;
	fromSourceName: string;
	isValid: number;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash' },
	{ value: 'yhk', label: 'card' },
	{ value: 'zfb', label: 'zhifubao' },
	{ value: 'wx', label: 'weChat' },
	{ value: 'mt', label: 'meituan' },
	{ value: 'hb', label: 'huabei' },
	{ value: 'bt', label: 'whiteBar' },
	{ value: 'hf', label: 'telCharge' },
	{ value: 'rqf', label: 'gasCharge' },
	{ value: 'sf', label: 'waterCharge' },
	{ value: 'df', label: 'electricCharge' },
	{ value: 'jd', label: 'jingdong' },
	{ value: 'other', label: '' },
];
