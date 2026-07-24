<template>
	<div
		class="gift-person-detail"
		data-testid="gift-person-detail"
	>
		<template v-if="isProfileMode">
			<section class="profile-head">
				<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
				<strong>{{ profile.person?.personName || '-' }}</strong>
				<span>
					{{ relationLabel(profile.person?.relationType) }} ·
					{{ profile.person?.phone || '-' }}
				</span>
			</section>
			<section class="profile-metrics">
				<div>
					<span>累计送礼</span>
					<strong class="amount-out">{{ formatMoney(profile.person?.totalGiveAmount) }}</strong>
				</div>
				<div>
					<span>累计收礼</span>
					<strong class="amount-in">{{ formatMoney(profile.person?.totalReceiveAmount) }}</strong>
				</div>
			</section>
			<section class="profile-block">
				<h3>基本信息</h3>
				<van-cell
					title="手机号"
					:value="profile.person?.phone || '-'"
				/>
				<van-cell
					title="关系"
					:value="relationLabel(profile.person?.relationType)"
				/>
				<van-cell
					title="备注"
					:value="profile.person?.remark || '-'"
				/>
			</section>
			<section class="profile-block">
				<h3>往来历史</h3>
				<div
					v-if="!(profile.records || []).length"
					class="profile-empty"
				>
					暂无往来记录
				</div>
				<div
					v-for="item in profile.records || []"
					:key="item.id"
					class="history-item"
				>
					<div>
						<strong> {{ directionText(item.direction) }} {{ formatMoney(item.amount) }} </strong>
						<p>{{ item.payTime || '-' }} {{ item.remark || '' }}</p>
					</div>
				</div>
			</section>
			<div class="detail-actions">
				<van-button
					v-if="hasPermission('gift:edit')"
					block
					round
					type="primary"
					data-testid="gift-person-edit"
					@click="openEdit"
				>
					编辑资料
				</van-button>
				<van-button
					v-if="hasPermission('gift:delete')"
					block
					round
					plain
					type="danger"
					data-testid="gift-person-delete"
					:loading="deleting"
					@click="removePerson"
				>
					删除
				</van-button>
			</div>
		</template>

		<template v-else>
			<van-form
				data-testid="gift-person-form"
				@submit="savePerson"
			>
				<van-cell-group inset>
					<van-field
						v-model="formState.personName"
						label="姓名"
						placeholder="请输入姓名"
						required
						:rules="[{ required: true, message: '请输入姓名' }]"
					/>
					<van-field
						v-model="formState.phone"
						label="手机号"
						placeholder="请输入手机号"
						maxlength="11"
						:rules="phoneRules"
					/>
					<van-field
						v-model="relationDisplay"
						label="关系"
						placeholder="请选择关系"
						readonly
						is-link
						required
						:rules="[{ required: true, message: '请选择关系' }]"
						@click="showRelationPicker = true"
					/>
					<van-field
						v-if="formState.relationMode === RELATION_CUSTOM"
						v-model="formState.customRelation"
						label="自定义关系"
						placeholder="如：发小、同学"
						maxlength="20"
						:rules="customRelationRules"
					/>
					<van-field
						v-model="formState.remark"
						label="备注"
						type="textarea"
						rows="2"
						autosize
						placeholder="请输入备注"
					/>
				</van-cell-group>
				<div class="detail-actions">
					<van-button
						block
						round
						type="primary"
						native-type="submit"
						data-testid="gift-person-save"
						:loading="saving"
					>
						保存
					</van-button>
				</div>
			</van-form>
		</template>

		<van-popup
			v-model:show="showRelationPicker"
			position="bottom"
			round
		>
			<van-picker
				title="选择关系"
				:columns="relationPickerColumns"
				@confirm="onRelationConfirm"
				@cancel="showRelationPicker = false"
			/>
		</van-popup>
	</div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { usePermission } from '@/composables/usePermission';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { getRoutePathByName } from '@/utils/router';
import {
	addGiftPerson,
	deleteGiftPerson,
	getGiftPersonDetail,
	getGiftPersonProfile,
	updateGiftPerson,
} from '@/views/finance/gift/person/api';
import type { GiftPersonFormState, GiftPersonInfo, GiftPersonProfile } from '@/views/finance/gift/config';
import { RELATION_CUSTOM, buildRelationTypeForSave, directionText, formatMoney } from '@/views/finance/gift/config';

const route = useRoute();
const router = useRouter();
const { hasPermission } = usePermission();
const { presetOptions, relationSelectOptions, loadRelationOptions, relationLabel, mapRelationToFormFields } =
	useGiftRelationOptions();

const CHINA_MOBILE = /^1[3-9]\d{9}$/;

const personId = computed(() => {
	const id = route.query.id;
	return typeof id === 'string' && id ? id : undefined;
});

const mode = ref<'profile' | 'form'>('form');
const isProfileMode = computed(() => mode.value === 'profile');
const saving = ref(false);
const deleting = ref(false);
const showRelationPicker = ref(false);
const formState = ref<GiftPersonFormState>({});
const profile = ref<GiftPersonProfile>({});

const listPath = computed(() => getRoutePathByName(router, 'giftPerson', '/finance/gift/person'));

const navTitle = computed(() => {
	if (isProfileMode.value) return '联系人详情';
	return formState.value.id ? '编辑联系人' : '新增联系人';
});

const { setNavBar } = useNavBar({
	title: navTitle.value,
	leftPath: listPath.value,
	visible: true,
});

watch([navTitle, listPath], ([title, leftPath]) => {
	setNavBar({
		title,
		leftPath,
		visible: true,
	});
});

const relationDisplay = computed(() => {
	if (formState.value.relationMode === RELATION_CUSTOM) {
		return formState.value.customRelation || '自定义…';
	}
	if (!formState.value.relationMode) return '';
	for (const group of relationSelectOptions.value) {
		const hit = group.options.find((item) => item.value === formState.value.relationMode);
		if (hit) return hit.label;
	}
	return '';
});

const relationPickerColumns = computed(() =>
	relationSelectOptions.value.flatMap((group) =>
		group.options.map((item) => ({
			text: `${group.label} · ${item.label}`,
			value: item.value,
		})),
	),
);

const phoneRules = [
	{
		validator: (value: string) => {
			const phone = value?.trim();
			if (!phone) return true;
			return CHINA_MOBILE.test(phone);
		},
		message: '请输入正确的11位手机号',
	},
];

const customRelationRules = [
	{
		validator: (value: string) => {
			const text = value?.trim();
			if (!text) return false;
			if (text.length > 20) return false;
			if (presetOptions.value.some((item) => item.name === text)) return false;
			return true;
		},
		message: '请输入有效自定义关系（勿与常用关系重名）',
	},
];

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const toSavePayload = (): GiftPersonInfo => {
	const { relationMode: _relationMode, customRelation: _customRelation, ...rest } = formState.value;
	return {
		...rest,
		...buildRelationTypeForSave(formState.value, presetOptions.value),
	};
};

const goList = () => {
	router.replace({ path: listPath.value });
};

const loadProfile = async () => {
	if (!personId.value) return;
	if (!hasPermission('gift:view')) {
		showFailToast('无查看权限');
		goList();
		return;
	}
	try {
		await loadRelationOptions(personId.value);
		const { code, data, message } = await getGiftPersonProfile(personId.value);
		if (code === '200') {
			profile.value = data || {};
		} else {
			showFailToast(message || '联系人详情加载失败');
		}
	} catch {
		showFailToast('联系人详情加载失败');
	}
};

const loadForm = async () => {
	const id = personId.value;
	await loadRelationOptions(id);
	if (!id) {
		formState.value = {};
		return;
	}
	try {
		const { code, data, message } = await getGiftPersonDetail(id);
		if (code === '200') {
			formState.value = mapRelationToFormFields(data || {});
		} else {
			showFailToast(message || '联系人加载失败');
		}
	} catch {
		showFailToast('联系人加载失败');
	}
};

const openEdit = () => {
	if (!hasPermission('gift:edit')) return;
	navigator.vibrate?.(50);
	mode.value = 'form';
	void loadForm();
};

const onRelationConfirm = ({ selectedOptions }: { selectedOptions: Array<{ text?: string; value?: string }> }) => {
	const selected = selectedOptions[0];
	formState.value.relationMode = selected?.value;
	if (selected?.value !== RELATION_CUSTOM) {
		formState.value.customRelation = '';
	}
	showRelationPicker.value = false;
};

const savePerson = async () => {
	if (formState.value.id ? !hasPermission('gift:edit') : !hasPermission('gift:add')) {
		showFailToast('无操作权限');
		return;
	}
	saving.value = true;
	navigator.vibrate?.(50);
	try {
		const api = formState.value.id ? updateGiftPerson : addGiftPerson;
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

const removePerson = async () => {
	if (!personId.value || !hasPermission('gift:delete')) return;
	try {
		await showConfirmDialog({ title: '确认删除该亲友？' });
	} catch {
		return;
	}
	deleting.value = true;
	navigator.vibrate?.(50);
	try {
		const { code, message } = await deleteGiftPerson(String(personId.value));
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
	if (personId.value) {
		mode.value = 'profile';
		await loadProfile();
		return;
	}
	if (!hasPermission('gift:add')) {
		showFailToast('无新增权限');
		goList();
		return;
	}
	mode.value = 'form';
	await loadForm();
};

onMounted(() => {
	void init();
});
</script>

<style scoped lang="less">
.gift-person-detail {
	box-sizing: border-box;
	min-height: 100%;
	padding: 16px;
	background: #f8fbff;
}

.profile-head {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 16px;
	margin-bottom: 12px;
	background: #fff;
	border-radius: 16px;

	.avatar {
		width: 56px;
		height: 56px;
		margin-bottom: 10px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2098ee;
		background: #eaf6ff;
		font-weight: 800;
		font-size: 22px;
	}

	strong {
		color: #1f2937;
		font-size: 18px;
	}

	span {
		margin-top: 6px;
		color: #8a94a6;
		font-size: 13px;
	}
}

.profile-metrics {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-bottom: 12px;

	div {
		padding: 14px;
		background: #fff;
		border-radius: 16px;
	}

	span {
		display: block;
		color: #8a94a6;
		font-size: 12px;
	}

	strong {
		display: block;
		margin-top: 8px;
		font-size: 18px;
	}
}

.amount-out {
	color: #cf1322;
}

.amount-in {
	color: #389e0d;
}

.profile-block {
	margin-bottom: 12px;
	overflow: hidden;
	background: #fff;
	border-radius: 16px;

	h3 {
		margin: 0;
		padding: 14px 16px 8px;
		font-size: 15px;
		color: #1f2937;
	}
}

.profile-empty,
.history-item {
	padding: 12px 16px;
	color: #8a94a6;
	font-size: 13px;
}

.history-item {
	border-top: 1px solid #f0f3f8;

	strong {
		display: block;
		color: #1f2937;
		font-size: 14px;
	}

	p {
		margin: 4px 0 0;
	}
}

.detail-actions {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 18px 0 28px;
}
</style>
