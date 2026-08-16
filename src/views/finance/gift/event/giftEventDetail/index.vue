<template>
	<div
		class="gift-event-detail"
		data-testid="gift-event-detail"
	>
		<van-form
			class="event-form"
			data-testid="gift-event-form"
			@submit="saveEvent"
		>
			<div class="form-scroll">
				<section class="form-card">
					<h3 class="form-group-title">基础信息</h3>
					<van-cell-group :border="false">
						<van-field
							v-model="formState.eventName"
							placeholder="请输入事由名称"
							:rules="[{ required: true, message: '请输入事由名称' }]"
						>
							<template #label> <span class="req">*</span>名称 </template>
						</van-field>
						<van-field
							v-model="eventTypeDisplay"
							placeholder="请选择事由类型"
							readonly
							is-link
							:rules="[{ required: true, message: '请选择事由类型' }]"
							@click="showTypeSheet = true"
						>
							<template #label> <span class="req">*</span>类型 </template>
						</van-field>
						<van-field
							v-if="formState.eventTypeMode === EVENT_TYPE_CUSTOM"
							v-model="formState.customEventType"
							label="自定义类型"
							placeholder="如：同学聚会"
							maxlength="20"
							:rules="customEventTypeRules"
						/>
					</van-cell-group>
				</section>

				<section class="form-card">
					<h3 class="form-group-title">更多信息</h3>
					<van-cell-group :border="false">
						<van-field
							v-model="eventTimeDisplay"
							label="事由时间"
							placeholder="请选择事由时间"
							readonly
							is-link
							@click="openDatePicker"
						/>
						<van-field
							v-model="hostPersonDisplay"
							label="关联人员"
							placeholder="请选择关联人员（选填）"
							readonly
							is-link
							data-testid="gift-event-host-person"
							@click="openPersonPicker"
						/>
						<van-field
							v-model="formState.remark"
							label="备注"
							type="textarea"
							rows="3"
							autosize
							placeholder="请输入备注"
						/>
					</van-cell-group>
				</section>

				<button
					v-if="formState.id && hasPermission('gift:delete')"
					type="button"
					class="btn-delete-text"
					data-testid="gift-event-delete"
					:disabled="deleting"
					@click="removeEvent"
				>
					{{ deleting ? '删除中…' : '删除事由' }}
				</button>
			</div>

			<div class="sticky-save">
				<van-button
					block
					round
					native-type="submit"
					class="btn-save"
					data-testid="gift-event-save"
					:loading="saving"
					:disabled="!canSaveGiftEvent(formState)"
				>
					{{ saveLabel }}
				</van-button>
			</div>
		</van-form>

		<van-action-sheet
			v-model:show="showTypeSheet"
			:actions="typeSheetActions"
			cancel-text="取消"
			close-on-click-action
			@select="onTypeSheetSelect"
		/>

		<van-popup
			v-model:show="showDatePicker"
			position="bottom"
			round
		>
			<van-picker-group
				title="选择事由时间"
				:tabs="['选择日期', '选择时间']"
				next-step-text="下一步"
				data-testid="gift-event-time-picker"
				@confirm="onDateConfirm"
				@cancel="showDatePicker = false"
			>
				<van-date-picker
					v-model="datePickerValue"
					:formatter="datePickerFormatter"
				/>
				<van-time-picker
					v-model="timePickerValue"
					:formatter="datePickerFormatter"
				/>
			</van-picker-group>
		</van-popup>

		<van-popup
			v-model:show="showPersonPicker"
			position="bottom"
			round
		>
			<van-picker
				title="选择关联人员"
				:columns="personPickerColumns"
				data-testid="gift-event-person-picker"
				@confirm="onPersonConfirm"
				@cancel="showPersonPicker = false"
			/>
		</van-popup>
	</div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePermission } from '@/composables/usePermission';
import { dataTimeFormat, datePickerFormatter, formatTime } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import { addGiftEvent, deleteGiftEvent, getGiftEventDetail, updateGiftEvent } from '@/views/finance/gift/event/api';
import { getGiftPersonList } from '@/views/finance/gift/person/api';
import type { GiftEventFormState, GiftEventInfo, GiftPersonInfo } from '@/views/finance/gift/config';
import { EVENT_TYPE_CUSTOM, buildEventTypeForSave, canSaveGiftEvent } from '@/views/finance/gift/config';

interface TypeSheetAction {
	name: string;
	value?: string;
}

const route = useRoute();
const router = useRouter();
const { hasPermission } = usePermission();
const { presetOptions, eventTypeSelectOptions, loadEventTypeOptions, mapEventTypeToFormFields } =
	useGiftEventTypeOptions();

const saving = ref(false);
const deleting = ref(false);
const showTypeSheet = ref(false);
const showDatePicker = ref(false);
const showPersonPicker = ref(false);
const personList = ref<GiftPersonInfo[]>([]);
const formState = ref<GiftEventFormState>({});
// van-date-picker 只出日期列、van-time-picker 只出时分列，
// 由 van-picker-group 分两步组合成完整的"日期 + 时间"选择
const datePickerValue = ref<string[]>([]);
const timePickerValue = ref<string[]>([]);

const eventId = computed(() => {
	const id = route.query.id;
	return typeof id === 'string' && id ? id : undefined;
});

const listPath = computed(() => getRoutePathByName(router, 'giftEvent', '/finance/gift/event'));

const navTitle = computed(() => (formState.value.id ? '编辑事由' : '新增事由'));

const saveLabel = computed(() => (formState.value.id ? '保存更改' : '保存'));

const eventTimeDisplay = computed(() => {
	if (!formState.value.eventTime) return '';
	return formatTime(formState.value.eventTime, dataTimeFormat) || '';
});

const hostPersonDisplay = computed(() => {
	if (formState.value.hostPersonName) return formState.value.hostPersonName;
	if (formState.value.hostPersonId) {
		const hit = personList.value.find((p) => String(p.id) === String(formState.value.hostPersonId));
		if (hit) return hit.personName || '';
	}
	return '';
});

const personPickerColumns = computed(() => [
	{ text: '不关联人员', value: '' },
	...personList.value.map((p) => ({
		text: p.personName || '-',
		value: String(p.id),
	})),
]);

const eventTypeDisplay = computed(() => {
	if (formState.value.eventTypeMode === EVENT_TYPE_CUSTOM) {
		return formState.value.customEventType || '自定义…';
	}
	if (!formState.value.eventTypeMode) return '';
	for (const group of eventTypeSelectOptions.value) {
		const hit = group.options.find((item) => item.value === formState.value.eventTypeMode);
		if (hit) return hit.label;
	}
	return '';
});

const typeSheetActions = computed<TypeSheetAction[]>(() =>
	eventTypeSelectOptions.value.flatMap((group) =>
		group.options.map((item) => ({
			name: `${group.label} · ${item.label}`,
			value: item.value,
		})),
	),
);

const customEventTypeRules = [
	{
		validator: (value: string) => {
			const text = value?.trim();
			if (!text) return false;
			if (text.length > 20) return false;
			if (presetOptions.value.some((item) => item.name === text)) return false;
			return true;
		},
		message: '请输入有效自定义类型（勿与常用类型重名）',
	},
];

const { setNavBar } = useNavBar({
	title: navTitle.value,
	leftPath: listPath.value,
	visible: true,
});

useTabBar({
	visible: false,
});

watch([navTitle, listPath], ([title, leftPath]) => {
	setNavBar({
		title,
		leftPath,
		visible: true,
	});
});

const goList = () => {
	router.replace({ path: listPath.value });
};

const toSavePayload = (): GiftEventInfo => {
	const {
		eventTypeMode: _eventTypeMode,
		customEventType: _customEventType,
		eventType: _eventType,
		eventTypeOptionId: _eventTypeOptionId,
		...rest
	} = formState.value;
	return {
		...rest,
		...buildEventTypeForSave(formState.value),
	};
};

const openDatePicker = () => {
	const current = formState.value.eventTime ? dayjs(formState.value.eventTime) : dayjs();
	datePickerValue.value = [current.format('YYYY'), current.format('MM'), current.format('DD')];
	timePickerValue.value = [current.format('HH'), current.format('mm')];
	showDatePicker.value = true;
};

const onDateConfirm = () => {
	// picker-group 的 confirm 不带载荷，日期与时间分别从两个 v-model 取
	const [year, month, day] = datePickerValue.value;
	const [hour = '00', minute = '00'] = timePickerValue.value;
	formState.value.eventTime = dayjs(`${year}-${month}-${day} ${hour}:${minute}:00`).format('YYYY-MM-DDTHH:mm:ss');
	showDatePicker.value = false;
};

const onTypeSheetSelect = (action: TypeSheetAction) => {
	formState.value.eventTypeMode = action.value;
	if (action.value !== EVENT_TYPE_CUSTOM) {
		formState.value.customEventType = '';
	}
	showTypeSheet.value = false;
};

const loadPersonList = async () => {
	if (personList.value.length > 0) return;
	const { code, data } = await getGiftPersonList({ personScope: 'CONTACT' });
	if (code === '200' && data) {
		personList.value = data;
	}
};

const openPersonPicker = async () => {
	await loadPersonList();
	showPersonPicker.value = true;
};

const onPersonConfirm = ({ selectedOptions }: { selectedOptions: Array<{ text?: string; value?: string }> }) => {
	const opt = selectedOptions[0];
	if (opt?.value) {
		formState.value.hostPersonId = String(opt.value);
		formState.value.hostPersonName = opt.text;
	} else {
		formState.value.hostPersonId = undefined;
		formState.value.hostPersonName = undefined;
	}
	showPersonPicker.value = false;
};

const loadForm = async () => {
	await loadEventTypeOptions();
	void loadPersonList();
	const id = eventId.value;
	if (!id) {
		formState.value = {};
		return;
	}
	try {
		const { code, data, message } = await getGiftEventDetail(id);
		if (code === '200') {
			formState.value = mapEventTypeToFormFields(data || {});
			if (data?.id != null) {
				formState.value.id = String(data.id);
			}
		} else {
			showFailToast(message || '事由加载失败');
		}
	} catch {
		showFailToast('事由加载失败');
	}
};

const saveEvent = async () => {
	if (formState.value.id ? !hasPermission('gift:edit') : !hasPermission('gift:add')) {
		showFailToast('无操作权限');
		return;
	}
	if (
		formState.value.eventTypeMode === EVENT_TYPE_CUSTOM &&
		presetOptions.value.some((item) => item.name === formState.value.customEventType?.trim())
	) {
		showFailToast('自定义类型勿与常用类型重名');
		return;
	}
	saving.value = true;
	navigator.vibrate?.(50);
	try {
		const api = formState.value.id ? updateGiftEvent : addGiftEvent;
		const { code, message } = await api(toSavePayload());
		if (code === '200') {
			showSuccessToast('保存成功');
			goList();
		} else {
			showFailToast(message || '保存失败');
		}
	} finally {
		saving.value = false;
	}
};

const removeEvent = async () => {
	if (!formState.value.id || !hasPermission('gift:delete')) return;
	try {
		await showConfirmDialog({ title: '确认删除该事由？' });
	} catch {
		return;
	}
	deleting.value = true;
	navigator.vibrate?.(50);
	try {
		const { code, message } = await deleteGiftEvent(String(formState.value.id));
		if (code === '200') {
			showSuccessToast('删除成功');
			goList();
		} else {
			showFailToast(message || '删除失败');
		}
	} finally {
		deleting.value = false;
	}
};

const init = async () => {
	if (eventId.value) {
		if (!hasPermission('gift:edit')) {
			showFailToast('无编辑权限');
			goList();
			return;
		}
		await loadForm();
		return;
	}
	if (!hasPermission('gift:add')) {
		showFailToast('无新增权限');
		goList();
		return;
	}
	await loadForm();
};

onMounted(() => {
	void init();
});
</script>

<style scoped lang="less">
.gift-event-detail {
	--ge-bg: #f8fafc;
	--ge-card: #ffffff;
	--ge-radius: 16px;
	--ge-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	--ge-primary-from: #2563eb;
	--ge-primary-to: #3b82f6;

	box-sizing: border-box;
	min-height: 100%;
	padding: 12px 16px 28px;
	background: var(--ge-bg);
}

.req {
	color: #ef4444;
	font-size: 12px;
	margin-right: 2px;
}

.event-form {
	margin: 0 -16px;
}

.form-scroll {
	padding: 0 16px calc(72px + env(safe-area-inset-bottom, 0px));
}

.form-card {
	margin-bottom: 12px;
	padding: 14px 4px 6px;
	background: var(--ge-card);
	border-radius: var(--ge-radius);
	box-shadow: var(--ge-shadow);
	overflow: hidden;

	:deep(.van-cell) {
		background: transparent;
	}

	:deep(.van-cell-group) {
		background: transparent;
	}
}

.form-group-title {
	margin: 0 12px 4px;
	color: #0f172a;
	font-size: 15px;
	font-weight: 700;
}

.btn-delete-text {
	display: block;
	width: 100%;
	border: none;
	margin: 8px 0 12px;
	padding: 10px;
	background: transparent;
	color: rgba(153, 27, 27, 0.55);
	font-size: 14px;
	cursor: pointer;

	&:active {
		color: #991b1b;
	}

	&:disabled {
		opacity: 0.6;
	}
}

.sticky-save {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 20;
	padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(12px);
	border-top: 1px solid #f1f5f9;
}

.btn-save {
	border: none;
	background: linear-gradient(90deg, var(--ge-primary-from), var(--ge-primary-to));
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
	color: #fff;

	&:disabled,
	&.van-button--disabled {
		opacity: 0.45;
		color: #fff;
	}
}
</style>
