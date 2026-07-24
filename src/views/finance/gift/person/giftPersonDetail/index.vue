<template>
	<div
		class="gift-person-detail"
		data-testid="gift-person-detail"
	>
		<template v-if="isProfileMode">
			<section class="profile-hero">
				<div class="profile-hero__wash" />
				<div class="profile-hero__card">
					<div class="avatar">{{ firstName(profile.person?.personName) }}</div>
					<strong class="profile-hero__name">{{ profile.person?.personName || '-' }}</strong>
					<p class="profile-hero__sub">
						{{ relationLabel(profile.person?.relationType) }}
						<template v-if="hasPhone"> · {{ displayPhone }}</template>
						<template v-else> · -</template>
					</p>
					<div
						v-if="remarkText"
						class="profile-hero__remark"
					>
						<span>{{ displayRemark }}</span>
						<button
							v-if="remarkCollapsible"
							type="button"
							class="remark-toggle"
							data-testid="gift-person-remark-toggle"
							:aria-label="remarkExpanded ? '收起备注' : '展开备注'"
							@click="remarkExpanded = !remarkExpanded"
						>
							{{ remarkExpanded ? '收起' : '展开' }}
						</button>
					</div>
					<div
						v-if="hasPhone"
						class="capsule-bar"
					>
						<button
							type="button"
							class="capsule-btn"
							data-testid="gift-person-phone-toggle"
							:aria-label="phoneVisible ? '隐藏手机号' : '显示手机号'"
							@click="togglePhoneVisible"
						>
							<van-icon :name="phoneVisible ? 'eye-o' : 'closed-eye'" />
							<span>显隐</span>
						</button>
						<button
							type="button"
							class="capsule-btn"
							data-testid="gift-person-phone-call"
							aria-label="拨打电话"
							@click="callPhone"
						>
							<van-icon name="phone-o" />
							<span>电话</span>
						</button>
						<button
							type="button"
							class="capsule-btn"
							data-testid="gift-person-phone-copy"
							aria-label="复制手机号"
							@click="copyPhone"
						>
							<van-icon name="records" />
							<span>复制</span>
						</button>
					</div>
				</div>
			</section>

			<section class="profile-metrics">
				<div class="metric-card metric-card--give">
					<span>累计送礼</span>
					<strong> <small>￥</small>{{ metricNumber(profile.person?.totalGiveAmount) }} </strong>
				</div>
				<div class="metric-card metric-card--recv">
					<span>累计收礼</span>
					<strong> <small>￥</small>{{ metricNumber(profile.person?.totalReceiveAmount) }} </strong>
				</div>
			</section>

			<section class="history-block">
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
					class="history-card"
				>
					<div
						class="history-card__icon"
						:class="directionClass(item.direction)"
					>
						<van-icon :name="directionIconName(item.direction)" />
					</div>
					<div class="history-card__body">
						<strong>{{ directionText(item.direction) }}</strong>
						<p>{{ formatPayTime(item.payTime) }} {{ item.remark || '' }}</p>
					</div>
					<strong
						class="history-card__amount"
						:class="directionClass(item.direction)"
					>
						{{ formatSignedMoney(item.direction, item.amount) }}
					</strong>
				</div>
			</section>

			<div class="detail-actions">
				<van-button
					v-if="hasPermission('gift:edit')"
					block
					round
					class="btn-edit"
					data-testid="gift-person-edit"
					@click="openEdit"
				>
					编辑资料
				</van-button>
				<button
					v-if="hasPermission('gift:delete')"
					type="button"
					class="btn-delete-text"
					data-testid="gift-person-delete"
					:disabled="deleting"
					@click="removePerson"
				>
					{{ deleting ? '删除中…' : '删除联系人' }}
				</button>
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
import { formatTime, dataTimeFormat } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import {
	addGiftPerson,
	deleteGiftPerson,
	getGiftPersonDetail,
	getGiftPersonProfile,
	updateGiftPerson,
} from '@/views/finance/gift/person/api';
import type { GiftPersonFormState, GiftPersonInfo, GiftPersonProfile } from '@/views/finance/gift/config';
import {
	RELATION_CUSTOM,
	buildRelationTypeForSave,
	collapseRemark,
	directionClass,
	directionIconName,
	directionText,
	formatSignedMoney,
	maskPhone,
	shouldCollapseRemark,
} from '@/views/finance/gift/config';

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
const phoneVisible = ref(false);
const remarkExpanded = ref(false);

const rawPhone = computed(() => profile.value.person?.phone?.trim() || '');
const hasPhone = computed(() => !!rawPhone.value);
const displayPhone = computed(() => {
	if (!rawPhone.value) return '-';
	return phoneVisible.value ? rawPhone.value : maskPhone(rawPhone.value) || rawPhone.value;
});

const remarkText = computed(() => profile.value.person?.remark?.trim() || '');
const remarkCollapsible = computed(() => shouldCollapseRemark(remarkText.value));
const displayRemark = computed(() => {
	if (!remarkText.value) return '-';
	if (!remarkCollapsible.value || remarkExpanded.value) return remarkText.value;
	return collapseRemark(remarkText.value);
});

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

const metricNumber = (value?: number | string) => Number(value || 0).toFixed(2);

const formatPayTime = (payTime?: string) => {
	if (!payTime) return '-';
	return formatTime(payTime, dataTimeFormat) || '-';
};

const togglePhoneVisible = () => {
	navigator.vibrate?.(50);
	phoneVisible.value = !phoneVisible.value;
};

const callPhone = () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	window.location.href = `tel:${rawPhone.value}`;
};

const copyPhone = async () => {
	if (!rawPhone.value) return;
	navigator.vibrate?.(50);
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(rawPhone.value);
		} else {
			const input = document.createElement('textarea');
			input.value = rawPhone.value;
			input.setAttribute('readonly', 'true');
			input.style.position = 'fixed';
			input.style.opacity = '0';
			document.body.appendChild(input);
			input.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(input);
			if (!ok) throw new Error('copy failed');
		}
		showSuccessToast('已复制');
	} catch {
		showFailToast('复制失败');
	}
};

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
			phoneVisible.value = false;
			remarkExpanded.value = false;
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
		await showConfirmDialog({ title: '确认删除该联系人？' });
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
	--gp-bg: #f8fafc;
	--gp-card: #ffffff;
	--gp-radius: 20px;
	--gp-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	--gp-give-bg: #fff5f5;
	--gp-give-fg: #e53e3e;
	--gp-recv-bg: #f0fdf4;
	--gp-recv-fg: #15803d;
	--gp-primary-from: #2563eb;
	--gp-primary-to: #3b82f6;

	box-sizing: border-box;
	min-height: 100%;
	padding: 12px 16px 28px;
	background: var(--gp-bg);
}

.profile-hero {
	position: relative;
	margin-bottom: 14px;
}

.profile-hero__wash {
	position: absolute;
	inset: 0 0 40% 0;
	border-radius: var(--gp-radius);
	background: linear-gradient(180deg, #dbeafe 0%, rgba(248, 250, 252, 0) 100%);
	pointer-events: none;
}

.profile-hero__card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28px 16px 18px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);
}

.avatar {
	width: 64px;
	height: 64px;
	margin-bottom: 12px;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2563eb;
	background: #eff6ff;
	font-weight: 800;
	font-size: 24px;
}

.profile-hero__name {
	color: #0f172a;
	font-size: 20px;
}

.profile-hero__sub {
	margin: 6px 0 0;
	color: #64748b;
	font-size: 13px;
}

.profile-hero__remark {
	margin-top: 10px;
	max-width: 100%;
	text-align: center;
	color: #94a3b8;
	font-size: 12px;
	line-height: 1.5;
	word-break: break-all;
}

.capsule-bar {
	display: flex;
	justify-content: center;
	gap: 18px;
	margin-top: 18px;
	width: 100%;
}

.capsule-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	min-width: 56px;
	padding: 0;
	border: none;
	background: transparent;
	color: #2563eb;
	font-size: 11px;
	cursor: pointer;

	.van-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 999px;
		background: #eff6ff;
		font-size: 20px;
	}

	&:active {
		transform: scale(0.96);
	}
}

.profile-metrics {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-bottom: 14px;
}

.metric-card {
	padding: 14px 16px;
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	span {
		display: block;
		color: #64748b;
		font-size: 12px;
	}

	strong {
		display: block;
		margin-top: 8px;
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.02em;

		small {
			margin-right: 2px;
			font-size: 13px;
			font-weight: 600;
		}
	}

	&--give {
		background: var(--gp-give-bg);
		strong {
			color: var(--gp-give-fg);
		}
	}

	&--recv {
		background: var(--gp-recv-bg);
		strong {
			color: var(--gp-recv-fg);
		}
	}
}

.history-block {
	padding: 14px 16px 8px;
	margin-bottom: 14px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);

	h3 {
		margin: 0 0 10px;
		font-size: 15px;
		color: #0f172a;
	}
}

.history-card {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 0;
	border-top: 1px solid #f1f5f9;

	&:first-of-type {
		border-top: none;
	}
}

.history-card__icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: #f1f5f9;
	color: #64748b;
	flex-shrink: 0;

	&.is-income {
		background: var(--gp-recv-bg);
		color: var(--gp-recv-fg);
	}

	&.is-give,
	&.is-return {
		background: var(--gp-give-bg);
		color: var(--gp-give-fg);
	}
}

.history-card__body {
	flex: 1;
	min-width: 0;

	strong {
		display: block;
		color: #0f172a;
		font-size: 14px;
	}

	p {
		margin: 4px 0 0;
		color: #94a3b8;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.history-card__amount {
	flex-shrink: 0;
	font-size: 15px;
	font-weight: 700;

	&.is-income {
		color: var(--gp-recv-fg);
	}
	&.is-give,
	&.is-return {
		color: var(--gp-give-fg);
	}
}

.profile-empty {
	padding: 16px 0 20px;
	color: #94a3b8;
	font-size: 13px;
	text-align: center;
}

.detail-actions {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 8px 0 12px;
	padding-bottom: env(safe-area-inset-bottom, 0);
}

.btn-edit {
	border: none;
	background: linear-gradient(90deg, var(--gp-primary-from), var(--gp-primary-to));
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
}

.btn-delete-text {
	border: none;
	padding: 10px;
	background: transparent;
	color: #9ca3af;
	font-size: 14px;
	cursor: pointer;

	&:active {
		color: #ef4444;
	}

	&:disabled {
		opacity: 0.6;
	}
}

.remark-toggle {
	border: none;
	margin-left: 6px;
	padding: 0;
	background: transparent;
	color: #2563eb;
	font-size: 12px;
}
</style>
