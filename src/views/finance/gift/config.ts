import type { FileInfoData } from '@/views/file/config';

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
	/** 头像 OSS 文件 ID（读写）；清除时传 null 落库 */
	avatar?: GiftId | null;
	/** 只读：后端 OssApi 回填的 FileInfoVo */
	fileInfoVo?: FileInfoData;
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
	orgId?: GiftId;
	userId?: GiftId;
	eventName?: string;
	eventType?: string;
	eventTypeOptionId?: GiftId;
	eventTime?: string;
	hostPersonId?: GiftId;
	remark?: string;
	createTime?: string;
}

export interface GiftEventBusinessInfo extends GiftEventInfo {
	participantCount?: number;
	totalAmount?: number;
	receiveAmount?: number;
	giveAmount?: number;
	eventStatus?: string;
	locationText?: string;
}

export interface GiftEventSummary {
	monthPendingCount?: number;
	totalAmount?: number;
	activePersonCount?: number;
}

export interface GiftEventQuery {
	keyword?: string;
	eventType?: string;
	eventTimeStart?: string;
	eventTimeEnd?: string;
}

export interface GiftEventTypeOptionItem {
	id: string;
	name: string;
}

export interface GiftEventTypeOptions {
	presets?: GiftEventTypeOptionItem[];
	customs?: GiftEventTypeOptionItem[];
}

export interface GiftEventFormState extends GiftEventInfo {
	eventTypeMode?: string;
	customEventType?: string;
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
export const GIFT_EVENT_DETAIL_NAME = 'giftEventDetail';

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

/** 接口不可用时的兜底预设事由类型 */
export const FALLBACK_GIFT_EVENT_OPTIONS: GiftEventTypeOptionItem[] = [
	{ id: '9100000000000000001', name: '婚礼' },
	{ id: '9100000000000000002', name: '满月' },
	{ id: '9100000000000000003', name: '乔迁' },
	{ id: '9100000000000000004', name: '升学' },
	{ id: '9100000000000000005', name: '寿宴' },
	{ id: '9100000000000000006', name: '其他' },
];

const EVENT_PRESET_NAME_TO_CODE: Record<string, string> = {
	婚礼: 'WEDDING',
	满月: 'BIRTH',
	乔迁: 'HOUSEWARMING',
	升学: 'EDUCATION',
	寿宴: 'BIRTHDAY',
	其他: 'OTHER',
};

/** 表单「自定义事由类型」选项值，不入库 */
export const EVENT_TYPE_CUSTOM = 'CUSTOM';

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

export function resolveEventPresetCode(
	presetId: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
): string {
	const preset = presets.find((item) => item.id === presetId);
	if (!preset) {
		return presetId;
	}
	return EVENT_PRESET_NAME_TO_CODE[preset.name] || preset.name;
}

export function buildGiftEventTypeSelectOptions(
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
): GiftRelationSelectGroup[] {
	const groups: GiftRelationSelectGroup[] = [{ label: '常用', options: toSelectOptions(presets) }];
	if (customOptions.length) {
		groups.push({
			label: '家庭组',
			options: toSelectOptions(customOptions),
		});
	}
	groups.push({
		label: '其他',
		options: [{ label: '自定义…', value: EVENT_TYPE_CUSTOM }],
	});
	return groups;
}

export function isPresetEventType(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
) {
	if (!eventType) {
		return false;
	}
	return (
		Object.values(EVENT_PRESET_NAME_TO_CODE).includes(eventType) ||
		presets.some((item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType)
	);
}

export function findEventTypeOptionId(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
): string | undefined {
	if (!eventType) {
		return undefined;
	}
	const preset = presets.find((item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType);
	if (preset) {
		return preset.id;
	}
	return customOptions.find((item) => item.name === eventType)?.id;
}

export function mapEventTypeToFormFields(
	data: GiftEventInfo = {},
	customOptions: GiftEventTypeOptionItem[] = [],
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
): GiftEventFormState {
	const { eventType, eventTypeOptionId, ...rest } = data;
	if (eventTypeOptionId) {
		return {
			...rest,
			eventType,
			eventTypeOptionId,
			eventTypeMode: eventTypeOptionId,
			customEventType: '',
		};
	}
	if (!eventType) {
		return { ...rest, eventTypeMode: undefined, customEventType: '' };
	}
	const matchedId = findEventTypeOptionId(eventType, presets, customOptions);
	if (matchedId) {
		return {
			...rest,
			eventType,
			eventTypeOptionId: matchedId,
			eventTypeMode: matchedId,
			customEventType: '',
		};
	}
	return {
		...rest,
		eventType,
		eventTypeMode: EVENT_TYPE_CUSTOM,
		customEventType: eventType,
	};
}

export function buildEventTypeForSave(
	form: GiftEventFormState,
): Pick<GiftEventInfo, 'eventType' | 'eventTypeOptionId'> {
	if (form.eventTypeMode === EVENT_TYPE_CUSTOM) {
		return { eventType: form.customEventType?.trim() || '' };
	}
	if (!form.eventTypeMode) {
		return {};
	}
	return { eventTypeOptionId: form.eventTypeMode };
}

export function eventLabel(
	eventType?: string,
	presets: GiftEventTypeOptionItem[] = FALLBACK_GIFT_EVENT_OPTIONS,
	customOptions: GiftEventTypeOptionItem[] = [],
) {
	if (!eventType) return '-';
	const preset = presets.find((item) => EVENT_PRESET_NAME_TO_CODE[item.name] === eventType);
	if (preset) {
		return preset.name;
	}
	const custom = customOptions.find((item) => item.name === eventType);
	return custom?.name ?? eventType;
}

export function canSaveGiftEvent(form: GiftEventFormState): boolean {
	if (!form.eventName?.trim()) return false;
	if (!form.eventTypeMode) return false;
	if (form.eventTypeMode === EVENT_TYPE_CUSTOM) {
		return !!form.customEventType?.trim();
	}
	return true;
}

export function eventStatusText(status?: string): string {
	return status?.trim() || '进行中';
}

const CHINA_MOBILE_11 = /^1[3-9]\d{9}$/;

/** 列表/详情头像展示：缩略图优先 */
export function personAvatarSrc(person?: Pick<GiftPersonInfo, 'fileInfoVo'> | null): string {
	return person?.fileInfoVo?.preThumbnailUrl || person?.fileInfoVo?.preUrl || '';
}

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
