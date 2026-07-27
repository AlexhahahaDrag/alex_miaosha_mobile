export type GiftDirection = 'GIVE' | 'RECEIVE' | 'RETURN';
export type GiftId = string;
export type GiftPersonScope = 'CONTACT' | 'ORG_MEMBER' | 'ALL';

export interface GiftPersonInfo {
	id?: GiftId;
	orgId?: GiftId;
	userId?: GiftId;
	bindUserId?: GiftId;
	personName?: string;
	phone?: string;
	relationType?: string;
	relationOptionId?: string;
	remark?: string;
	createTime?: string;
	totalGiveAmount?: number;
	totalReceiveAmount?: number;
}

export interface GiftPersonBusinessInfo extends GiftPersonInfo {
	netAmount?: number;
	latestRecordTime?: string;
	latestEventName?: string;
	latestDirection?: GiftDirection;
	pendingReturnAmount?: number;
}

export interface GiftPersonSummary {
	personCount?: number;
	yearTotalAmount?: number;
	pendingReturnAmount?: number;
}

export interface GiftPersonProfile {
	person?: GiftPersonBusinessInfo;
	records?: GiftRecordInfo[];
}

export interface GiftPersonQuery {
	keyword?: string;
	relationType?: string;
	personScope?: GiftPersonScope;
}

export interface GiftRelationOptionItem {
	id: string;
	name: string;
}

export interface GiftPersonRelationOptions {
	presets?: GiftRelationOptionItem[];
	customs?: GiftRelationOptionItem[];
}

export interface GiftRelationSelectOption {
	label: string;
	value: string;
}

export interface GiftRelationSelectGroup {
	label: string;
	options: GiftRelationSelectOption[];
}

export interface GiftPersonFormState extends GiftPersonInfo {
	relationMode?: string;
	customRelation?: string;
}

export interface GiftEventInfo {
	id?: GiftId;
	eventName?: string;
	eventType?: string;
	eventTime?: string;
	hostPersonId?: GiftId;
	remark?: string;
	createTime?: string;
}

export interface GiftRecordInfo {
	id?: GiftId;
	eventId?: GiftId;
	giverPersonId?: GiftId;
	receiverPersonId?: GiftId;
	relatedRecordId?: GiftId;
	direction?: GiftDirection;
	amount?: number;
	payTime?: string;
	returnedFlag?: number;
	remark?: string;
	createTime?: string;
}

export interface GiftRecordQuery {
	keyword?: string;
	eventId?: GiftId;
	giverPersonId?: GiftId;
	receiverPersonId?: GiftId;
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

export const giftDirectionOptions = [
	{ label: '随礼', value: 'GIVE' },
	{ label: '收礼', value: 'RECEIVE' },
	{ label: '回礼', value: 'RETURN' },
];

export const quickAmounts = [100, 200, 500, 1000];

export const GIFT_PERSON_PATH = '/finance/gift/person';
export const GIFT_PERSON_DETAIL_NAME = 'giftPersonDetail';

/** 接口不可用时的兜底预设 */
export const FALLBACK_GIFT_RELATION_OPTIONS: GiftRelationOptionItem[] = [
	{ id: '9000000000000000001', name: '亲属' },
	{ id: '9000000000000000002', name: '朋友' },
	{ id: '9000000000000000003', name: '同事' },
	{ id: '9000000000000000004', name: '邻里' },
	{ id: '9000000000000000005', name: '其他' },
];

/** 表单「自定义关系」选项值，不入库 */
export const RELATION_CUSTOM = 'CUSTOM';

const PRESET_NAME_TO_CODE: Record<string, string> = {
	亲属: 'RELATIVE',
	朋友: 'FRIEND',
	同事: 'COLLEAGUE',
	邻里: 'NEIGHBOR',
	其他: 'OTHER',
};

export const directionText = (direction?: string) =>
	directionOptions.find((item) => item.value === direction)?.text || '-';

export const directionLabel = (direction?: string) =>
	giftDirectionOptions.find((item) => item.value === direction)?.label || '-';

export const formatMoney = (value?: number | string) => {
	const amount = Number(value || 0);
	return `￥${amount.toFixed(2)}`;
};

export function formatSignedMoney(direction?: string, amount?: number | string): string {
	const money = formatMoney(amount);
	return direction === 'RECEIVE' ? `+${money}` : `-${money}`;
}

export function directionIconName(direction?: string): string {
	if (direction === 'RECEIVE') return 'gift-o';
	if (direction === 'GIVE') return 'cash-back-record';
	if (direction === 'RETURN') return 'replay';
	return 'orders-o';
}

export const directionClass = (direction?: string) => {
	if (direction === 'RECEIVE') return 'is-income';
	if (direction === 'RETURN') return 'is-return';
	return 'is-give';
};

export function toSelectOptions(items: GiftRelationOptionItem[] = []): GiftRelationSelectOption[] {
	return items.map((item) => ({ label: item.name, value: item.id }));
}

export function resolvePresetCode(
	presetId: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): string {
	const preset = presets.find((item) => item.id === presetId);
	if (!preset) {
		return presetId;
	}
	return PRESET_NAME_TO_CODE[preset.name] || preset.name;
}

export function buildGiftRelationSelectOptions(
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
	customOptions: GiftRelationOptionItem[] = [],
): GiftRelationSelectGroup[] {
	const groups: GiftRelationSelectGroup[] = [{ label: '常用', options: toSelectOptions(presets) }];
	if (customOptions.length) {
		groups.push({
			label: '我的',
			options: toSelectOptions(customOptions),
		});
	}
	groups.push({
		label: '其他',
		options: [{ label: '自定义…', value: RELATION_CUSTOM }],
	});
	return groups;
}

export function isPresetRelationType(
	relation?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
) {
	if (!relation) {
		return false;
	}
	return (
		Object.values(PRESET_NAME_TO_CODE).includes(relation) ||
		presets.some((item) => PRESET_NAME_TO_CODE[item.name] === relation)
	);
}

export function findOptionIdByRelationType(
	relationType?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
	customOptions: GiftRelationOptionItem[] = [],
): string | undefined {
	if (!relationType) {
		return undefined;
	}
	const preset = presets.find((item) => PRESET_NAME_TO_CODE[item.name] === relationType);
	if (preset) {
		return preset.id;
	}
	return customOptions.find((item) => item.name === relationType)?.id;
}

export function mapRelationToFormFields(
	data: GiftPersonInfo = {},
	customOptions: GiftRelationOptionItem[] = [],
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): GiftPersonFormState {
	const { relationType, relationOptionId, ...rest } = data;
	if (relationOptionId) {
		return {
			...rest,
			relationType,
			relationOptionId,
			relationMode: relationOptionId,
			customRelation: '',
		};
	}
	if (!relationType) {
		return { ...rest, relationMode: undefined, customRelation: '' };
	}
	const matchedId = findOptionIdByRelationType(relationType, presets, customOptions);
	if (matchedId) {
		return {
			...rest,
			relationType,
			relationOptionId: matchedId,
			relationMode: matchedId,
			customRelation: '',
		};
	}
	return {
		...rest,
		relationType,
		relationMode: RELATION_CUSTOM,
		customRelation: relationType,
	};
}

export function buildRelationTypeForSave(
	form: GiftPersonFormState,
	_presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
): Pick<GiftPersonInfo, 'relationType' | 'relationOptionId'> {
	if (form.relationMode === RELATION_CUSTOM) {
		return { relationType: form.customRelation?.trim() || '' };
	}
	if (!form.relationMode) {
		return {};
	}
	return { relationOptionId: form.relationMode };
}

export function relationLabel(
	relation?: string,
	presets: GiftRelationOptionItem[] = FALLBACK_GIFT_RELATION_OPTIONS,
) {
	if (!relation) return '-';
	const preset = presets.find((item) => PRESET_NAME_TO_CODE[item.name] === relation);
	return preset?.name ?? relation;
}

const CHINA_MOBILE_11 = /^1[3-9]\d{9}$/;

export function normalizePhoneDigits(phone?: string): string {
	return (phone ?? '').replace(/\D/g, '');
}

export function formatPhoneDisplay(phone?: string): string {
	const digits = normalizePhoneDigits(phone);
	if (digits.length !== 11) return digits || (phone?.trim() ?? '');
	return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

export function maskPhone(phone?: string): string {
	const value = phone?.trim() ?? '';
	if (!value) return '';
	if (!CHINA_MOBILE_11.test(value)) return value;
	return `${value.slice(0, 3)} **** ${value.slice(7)}`;
}

export function shouldCollapseRemark(text?: string, limit = 60): boolean {
	return (text?.trim().length ?? 0) > limit;
}

export function collapseRemark(text?: string, limit = 60): string {
	const value = text?.trim() ?? '';
	if (value.length <= limit) return value;
	return `${value.slice(0, limit)}…`;
}
