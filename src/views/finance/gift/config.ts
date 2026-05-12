export type GiftDirection = 'GIVE' | 'RECEIVE' | 'RETURN';

export interface GiftPersonInfo {
	id?: string | number;
	personName?: string;
	phone?: string;
	relationType?: string;
	remark?: string;
	createTime?: string;
}

export interface GiftEventInfo {
	id?: string | number;
	eventName?: string;
	eventType?: string;
	eventTime?: string;
	hostPersonId?: string | number;
	remark?: string;
	createTime?: string;
}

export interface GiftRecordInfo {
	id?: string | number;
	eventId?: string | number;
	giverPersonId?: string | number;
	receiverPersonId?: string | number;
	relatedRecordId?: string | number;
	direction?: GiftDirection;
	amount?: number;
	payTime?: string;
	returnedFlag?: number;
	remark?: string;
	createTime?: string;
}

export interface GiftRecordQuery {
	keyword?: string;
	eventId?: string | number;
	giverPersonId?: string | number;
	receiverPersonId?: string | number;
	direction?: GiftDirection;
	payTimeStart?: string;
	payTimeEnd?: string;
	amountMin?: number;
	amountMax?: number;
}

export const directionOptions = [
	{ text: '随礼', value: 'GIVE' },
	{ text: '收礼', value: 'RECEIVE' },
	{ text: '回礼', value: 'RETURN' },
];

export const quickAmounts = [100, 200, 500, 1000];

export const directionText = (direction?: string) =>
	directionOptions.find((item) => item.value === direction)?.text || '-';

export const formatMoney = (value?: number | string) => {
	const amount = Number(value || 0);
	return `￥${amount.toFixed(2)}`;
};

export const directionClass = (direction?: string) => {
	if (direction === 'RECEIVE') return 'is-income';
	if (direction === 'RETURN') return 'is-return';
	return 'is-give';
};
