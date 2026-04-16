import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	name?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
	isSend?: number;
}

export interface DataItem {
	name: string;
	avliDate?: Dayjs | string;
	amount: number;
	account: string;
	isSend: number;
}
