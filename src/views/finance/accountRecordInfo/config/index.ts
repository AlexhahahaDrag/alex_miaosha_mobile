import type { Dayjs } from 'dayjs';

export interface AccountRecordInfoData {
	id?: number;
	name?: string;
	accountName?: string;
	fromSource?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
	isSend?: number;
}
