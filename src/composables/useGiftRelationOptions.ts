import { ref, computed } from 'vue';
import { getGiftPersonRelationOptions } from '@/views/finance/gift/person/api';
import {
	FALLBACK_GIFT_RELATION_OPTIONS,
	buildGiftRelationSelectOptions,
	isPresetRelationType as matchPresetRelationType,
	mapRelationToFormFields as mapRelationFields,
	relationLabel as resolveRelationLabel,
	resolvePresetCode,
	toSelectOptions,
	type GiftPersonFormState,
	type GiftPersonInfo,
	type GiftRelationOptionItem,
	type GiftRelationSelectGroup,
} from '@/views/finance/gift/config';

const presetOptions = ref<GiftRelationOptionItem[]>([...FALLBACK_GIFT_RELATION_OPTIONS]);
const customOptions = ref<GiftRelationOptionItem[]>([]);
const loading = ref(false);
const loaded = ref(false);

export function useGiftRelationOptions() {
	const giftRelationOptions = computed(() => toSelectOptions(presetOptions.value));

	const relationSelectOptions = computed<GiftRelationSelectGroup[]>(() =>
		buildGiftRelationSelectOptions(presetOptions.value, customOptions.value),
	);

	const quickRelations = computed(() => presetOptions.value.slice(0, 3));

	const isPresetRelationType = (relation?: string) =>
		matchPresetRelationType(relation, presetOptions.value);

	const relationLabel = (relation?: string) => resolveRelationLabel(relation, presetOptions.value);

	const resolveFilterRelationType = (presetId: string) =>
		resolvePresetCode(presetId, presetOptions.value);

	const mapRelationToFormFields = (data: GiftPersonInfo = {}): GiftPersonFormState =>
		mapRelationFields(data, customOptions.value, presetOptions.value);

	const loadRelationOptions = async (personId?: string) => {
		loading.value = true;
		try {
			const { code, data } = await getGiftPersonRelationOptions(personId);
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
		giftRelationOptions,
		relationSelectOptions,
		quickRelations,
		loading,
		loaded,
		loadRelationOptions,
		isPresetRelationType,
		relationLabel,
		resolveFilterRelationType,
		mapRelationToFormFields,
	};
}
