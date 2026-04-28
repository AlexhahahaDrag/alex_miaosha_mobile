import type { Dayjs } from 'dayjs';

export interface ShopFinanceData {
	id?: string;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	incomeAndExpenses?: string;
	payWay?: string;
	saleNum?: number;
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

export const label = reactive({
	shopName: '商品名称',
	shopCode: '商品编码',
	saleAmount: '售价',
	isValid: '是否有效',
	saleDate: '销售日期',
	incomeAndExpenses: '收支类型',
	payWay: '支付方式',
	saleNum: '销售件数',
});

export const rulesRef = reactive({
	shopName: [
		{
			required: true,
			message: `${label.shopName}不能为空！`,
		},
	],
	shopCode: [
		{
			required: true,
			message: `${label.shopCode}不能为空！`,
		},
	],
	saleAmount: [
		{
			required: true,
			message: `${label.saleAmount}不能为空！`,
		},
		{ pattern: /^\d+(\.\d+)?$/, message: `请输入正确的价格${label.saleDate}` },
	],
	isValid: [
		{
			required: true,
			message: `${label.isValid}不能为空！`,
		},
	],
	saleDate: [
		{
			required: true,
			message: `${label.saleDate}不能为空！`,
		},
	],
	payWay: [
		{
			required: true,
			message: `${label.payWay}不能为空！`,
		},
	],
	incomeAndExpenses: [
		{
			required: true,
			message: `${label.incomeAndExpenses}不能为空！`,
		},
	],
	saleNum: [
		{
			required: true,
			message: `${label.saleNum}不能为空！`,
		},
		{ pattern: /^\d+(\.\d+)?$/, message: '请输入正确的数量' },
	],
});
