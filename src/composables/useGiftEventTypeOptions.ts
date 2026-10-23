import type { MaybeRefOrGetter } from 'vue';
import { getGiftEventTypeOptions } from '@/views/finance/gift/event/api';
import {
	FALLBACK_GIFT_EVENT_OPTIONS,
	buildGiftEventTypeSelectOptions,
	findEventTypeOptionId,
	isPresetEventType as matchPresetEventType,
	mapEventTypeToFormFields as mapEventFields,
	eventLabel as resolveEventLabel,
	resolveEventPresetCode,
	toSelectOptions,
	type GiftEventFormState,
	type GiftEventInfo,
	type GiftEventTypeOptionItem,
	type GiftRelationSelectGroup,
} from '@/views/finance/gift/config';

const presetOptions = ref<GiftEventTypeOptionItem[]>([...FALLBACK_GIFT_EVENT_OPTIONS]);
const customOptions = ref<GiftEventTypeOptionItem[]>([]);
const loading = ref<boolean>(false);
const loaded = ref<boolean>(false);

export function useGiftEventTypeOptions() {
	const giftEventTypeOptions = computed(() => toSelectOptions(presetOptions.value));

	const eventTypeSelectOptions = computed<GiftRelationSelectGroup[]>(() =>
		buildGiftEventTypeSelectOptions(presetOptions.value, customOptions.value),
	);

	const quickEvents = computed(() => presetOptions.value.slice(0, 3));

	const isPresetEventType = (eventType?: MaybeRefOrGetter<string | undefined>) =>
		matchPresetEventType(toValue(eventType), presetOptions.value);

	const eventLabel = (eventType?: MaybeRefOrGetter<string | undefined>) =>
		resolveEventLabel(toValue(eventType), presetOptions.value, customOptions.value);

	const resolveFilterEventType = (presetId: MaybeRefOrGetter<string | undefined>) => {
		const val = toValue(presetId);
		return val ? resolveEventPresetCode(val, presetOptions.value) : undefined;
	};

	const mapEventTypeToFormFields = (data: GiftEventInfo = {}): GiftEventFormState =>
		mapEventFields(data, customOptions.value, presetOptions.value);

	const loadEventTypeOptions = async () => {
		loading.value = true;
		try {
			const { code, data } = await getGiftEventTypeOptions();
			if (code === '200') {
				if (data?.presets?.length) {
					presetOptions.value = data.presets.map((item) => ({
						id: String(item.id),
						name: item.name,
					}));
				}
				customOptions.value = (data?.customs || []).map((item) => ({
					id: String(item.id),
					name: item.name,
				}));
				loaded.value = true;
			}
		} finally {
			loading.value = false;
		}
	};

	return {
		presetOptions,
		customOptions,
		giftEventTypeOptions,
		eventTypeSelectOptions,
		quickEvents,
		loading,
		loaded,
		loadEventTypeOptions,
		isPresetEventType,
		eventLabel,
		resolveFilterEventType,
		mapEventTypeToFormFields,
		findEventTypeOptionId: (eventType?: MaybeRefOrGetter<string | undefined>) =>
			findEventTypeOptionId(toValue(eventType), presetOptions.value, customOptions.value),
	};
}
