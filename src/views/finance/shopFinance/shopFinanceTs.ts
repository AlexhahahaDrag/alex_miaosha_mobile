import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
}

export interface DataItem {
	shopName: string;
	shopCode: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
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
