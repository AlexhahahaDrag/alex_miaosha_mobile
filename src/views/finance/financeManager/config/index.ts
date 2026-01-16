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

export interface FieldRule {
	required?: boolean;
	message?: string;
	validator?: (val: unknown) => boolean | Promise<boolean>;
	pattern?: RegExp;
	trigger?: string;
}

export interface DictFieldConfig {
	key: string;
	labelName: string;
	rule?: FieldRule[];
	belongTo?: string;
	formKey: keyof FinanceManagerData;
}

export interface FromSourceTransferItem {
	value: string;
	label: string;
	name: string;
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
	description?: string;
}

export const fromSourceTransferList: FromSourceTransferItem[] = [
	{ value: 'xj', label: 'cash', name: '现金' },
	{ value: 'yhk', label: 'card', name: '银行卡' },
	{ value: 'zfb', label: 'zhifubao', name: '支付宝' },
	{ value: 'wx', label: 'weChat', name: '微信' },
	{ value: 'mt', label: 'meituan', name: '美团' },
	{ value: 'hb', label: 'huabei', name: '花呗' },
	{ value: 'bt', label: 'whiteBar', name: '白条' },
	{ value: 'hf', label: 'telCharge', name: '话费充值' },
	{ value: 'rqf', label: 'gasCharge', name: '燃气充值' },
	{ value: 'sf', label: 'waterCharge', name: '水电费' },
	{ value: 'df', label: 'electricCharge', name: '电费' },
	{ value: 'jd', label: 'jingdong', name: '京东' },
	{ value: 'other', label: '', name: '其他' },
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
