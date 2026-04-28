import type { Dayjs } from 'dayjs';

export interface AccountRecordInfoData {
	id?: string;
	name?: string;
	accountName?: string;
	fromSource?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
	isSend?: number;
}
