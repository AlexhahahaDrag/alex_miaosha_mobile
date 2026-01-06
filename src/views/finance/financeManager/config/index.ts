import type { Dayjs } from 'dayjs';
import { type PageInfo } from '@/views/common/config';

export interface SearchInfo {
	name?: string;
	typeCode?: string;
	fromSource?: string;
	isValid?: number;
	pageNum?: number;
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
});

export interface FinanceManagerData {
	id?: string;
	name?: string;
	typeCode?: string;
	typeName?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	bigTypeCode?: string;
	belongTo?: number;
	belongToName?: string;
	incomeAndExpenses?: string;
	incomeAndExpensesName?: string;
	infoDate?: string | Dayjs | null;
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

export const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '名称不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	typeCode: [
		{
			required: true,
			message: '类别不能为空！',
		},
	],
	fromSource: [
		{
			required: true,
			message: '支付方式不能为空！',
		},
	],
	incomeAndExpenses: [
		{
			required: true,
			message: '收支类型不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	infoDate: [
		{
			required: true,
			message: '业务时间不能为空！',
		},
	],
	belongTo: [
		{
			required: true,
			message: '属于不能为空！',
		},
	],
});
