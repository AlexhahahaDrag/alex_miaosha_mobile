<template>
	<div
		class="gift-person-detail"
		data-testid="gift-person-detail"
	>
		<template v-if="isProfileMode">
			<section class="profile-hero">
				<div class="profile-hero__wash" />
				<div class="profile-hero__card">
					<div class="avatar">
						<img
							v-if="profileAvatarUrl"
							class="avatar-img"
							:src="profileAvatarUrl"
							alt=""
						/>
						<template v-else>{{ firstName(profile.person?.personName) }}</template>
					</div>
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
				class="person-form"
				data-testid="gift-person-form"
				@submit="savePerson"
			>
				<div class="form-scroll">
					<section class="form-card form-avatar-card">
						<van-uploader
							:after-read="onAvatarAfterRead"
							:max-count="1"
							reupload
							:preview-image="false"
							accept="image/*"
							:disabled="uploadingAvatar"
						>
							<div
								class="form-avatar-trigger"
								data-testid="gift-person-avatar-upload"
								role="button"
								aria-label="上传头像"
							>
								<img
									v-if="avatarPreviewUrl"
									class="form-avatar-img"
									:src="avatarPreviewUrl"
									alt=""
								/>
								<span
									v-else
									class="form-avatar-fallback"
								>
									{{ firstName(formState.personName) }}
								</span>
								<span class="form-avatar-camera">
									<van-icon name="photograph" />
								</span>
								<span
									v-if="uploadingAvatar"
									class="form-avatar-loading"
								>
									上传中…
								</span>
							</div>
						</van-uploader>
						<p class="form-avatar-hint">更换头像</p>
						<button
							v-if="formState.avatar || avatarPreviewUrl"
							type="button"
							class="form-avatar-clear"
							data-testid="gift-person-avatar-clear"
							@click="clearAvatar"
						>
							清除头像
						</button>
					</section>

					<section class="form-card">
						<h3 class="form-group-title">基础信息</h3>
						<van-cell-group :border="false">
							<van-field
								v-model="formState.personName"
								placeholder="请输入姓名"
								:rules="[{ required: true, message: '请输入姓名' }]"
							>
								<template #label> <span class="req">*</span>姓名 </template>
							</van-field>
							<van-field
								v-model="phoneDisplay"
								label="手机号"
								placeholder="请输入手机号"
								clearable
								type="tel"
								:rules="phoneRules"
							/>
							<van-field
								v-model="relationDisplay"
								placeholder="请选择关系"
								readonly
								is-link
								:rules="[{ required: true, message: '请选择关系' }]"
								@click="showRelationPicker = true"
							>
								<template #label> <span class="req">*</span>关系 </template>
							</van-field>
							<van-field
								v-if="formState.relationMode === RELATION_CUSTOM"
								v-model="formState.customRelation"
								label="自定义关系"
								placeholder="如：发小、同学"
								maxlength="20"
								:rules="customRelationRules"
							/>
						</van-cell-group>
					</section>

					<section class="form-card">
						<h3 class="form-group-title">更多信息</h3>
						<van-cell-group :border="false">
							<van-field
								v-model="formState.remark"
								label="备注"
								type="textarea"
								rows="3"
								autosize
								maxlength="50"
								placeholder="请输入备注"
							/>
							<div class="remark-count">{{ remarkLen }}/50</div>
						</van-cell-group>
					</section>
				</div>

				<div class="sticky-save">
					<van-button
						block
						round
						native-type="submit"
						class="btn-save"
						data-testid="gift-person-save"
						:loading="saving"
						:disabled="!canSave"
					>
						{{ saveLabel }}
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
import { addFileManager } from '@/views/file/api';
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
	formatPhoneDisplay,
	formatSignedMoney,
	maskPhone,
	normalizePhoneDigits,
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
const uploadingAvatar = ref(false);
const showRelationPicker = ref(false);
const formState = ref<GiftPersonFormState>({});
const profile = ref<GiftPersonProfile>({});
const phoneVisible = ref(false);
const remarkExpanded = ref(false);
/** 本地头像预览（上传成功或详情回填） */
const avatarPreviewUrl = ref('');

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

/** 详情 Hero：缩略图优先，否则原图 */
const profileAvatarUrl = computed(
	() => profile.value.person?.avatarThumbnailUrl || profile.value.person?.avatarUrl || '',
);

const listPath = computed(() => getRoutePathByName(router, 'giftPerson', '/finance/gift/person'));

const navTitle = computed(() => {
	if (isProfileMode.value) return '联系人详情';
	return formState.value.id ? '编辑联系人' : '新增联系人';
});

const saveLabel = computed(() => (formState.value.id ? '保存更改' : '保存'));

const remarkLen = computed(() => Math.min(formState.value.remark?.length ?? 0, 50));

/** 展示 3-4-4；写入纯数字（最多 11 位） */
const phoneDisplay = computed({
	get: () => formatPhoneDisplay(formState.value.phone),
	set: (value: string) => {
		formState.value.phone = normalizePhoneDigits(value).slice(0, 11);
	},
});

const canSave = computed(() => {
	const nameOk = !!formState.value.personName?.trim();
	if (!formState.value.relationMode) return false;
	if (formState.value.relationMode === RELATION_CUSTOM) {
		return nameOk && !!formState.value.customRelation?.trim();
	}
	return nameOk;
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
			const phone = normalizePhoneDigits(value);
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
	const {
		relationMode: _relationMode,
		customRelation: _customRelation,
		avatarUrl: _avatarUrl,
		avatarThumbnailUrl: _avatarThumbnailUrl,
		...rest
	} = formState.value;
	const phone = normalizePhoneDigits(formState.value.phone);
	const remark = (formState.value.remark ?? '').slice(0, 50);
	return {
		...rest,
		phone: phone || undefined,
		remark: remark || undefined,
		avatar: formState.value.avatar ? String(formState.value.avatar) : null,
		...buildRelationTypeForSave(formState.value, presetOptions.value),
	};
};

const clearAvatar = () => {
	navigator.vibrate?.(50);
	formState.value.avatar = undefined;
	formState.value.avatarUrl = undefined;
	formState.value.avatarThumbnailUrl = undefined;
	avatarPreviewUrl.value = '';
};

const onAvatarAfterRead = async (file: unknown) => {
	const raw = (Array.isArray(file) ? file[0] : file) as { file?: File } | undefined;
	const blob = raw?.file;
	if (!blob) return;
	uploadingAvatar.value = true;
	navigator.vibrate?.(50);
	try {
		const formData = new FormData();
		formData.append('file', blob);
		const { code, data, message } = await addFileManager('common', formData);
		if (code === '200' && data?.id != null) {
			formState.value.avatar = String(data.id);
			avatarPreviewUrl.value = String(data.preThumbnailUrl || data.preUrl || '');
			showSuccessToast('头像已上传');
		} else {
			showFailToast(message || '上传失败');
		}
	} catch {
		showFailToast('上传失败');
	} finally {
		uploadingAvatar.value = false;
	}
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
		avatarPreviewUrl.value = '';
		return;
	}
	try {
		const { code, data, message } = await getGiftPersonDetail(id);
		if (code === '200') {
			const person = data || {};
			formState.value = mapRelationToFormFields(person);
			// 编辑回填：优先缩略图
			avatarPreviewUrl.value = person.avatarThumbnailUrl || person.avatarUrl || '';
			if (person.avatar != null) {
				formState.value.avatar = String(person.avatar);
			}
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
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2563eb;
	background: #eff6ff;
	font-weight: 800;
	font-size: 24px;
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
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
	margin-top: 16px;
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
	color: #64748b;
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
		color: #2563eb;
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
	/* 微红灰：可读性优于纯浅灰，危险感仍克制 */
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

.remark-toggle {
	border: none;
	margin-left: 6px;
	padding: 0;
	background: transparent;
	color: #2563eb;
	font-size: 12px;
}

/* —— form mode —— */
.req {
	color: #ef4444;
	font-size: 12px;
	margin-right: 2px;
}

.person-form {
	margin: 0 -16px;
}

.form-scroll {
	padding: 0 16px calc(72px + env(safe-area-inset-bottom, 0px));
}

.form-card {
	margin-bottom: 12px;
	padding: 14px 4px 6px;
	background: var(--gp-card);
	border-radius: var(--gp-radius);
	box-shadow: var(--gp-shadow);
	overflow: hidden;

	:deep(.van-cell) {
		background: transparent;
	}

	:deep(.van-cell-group) {
		background: transparent;
	}
}

.form-avatar-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 22px 16px 16px;
}

.form-group-title {
	margin: 0 12px 4px;
	color: #0f172a;
	font-size: 15px;
	font-weight: 700;
}

.form-avatar-trigger {
	position: relative;
	width: 88px;
	height: 88px;
	border-radius: 20px;
	overflow: hidden;
	background: #eff6ff;
	display: flex;
	align-items: center;
	justify-content: center;

	&:active {
		transform: scale(0.98);
	}
}

.form-avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.form-avatar-fallback {
	color: #2563eb;
	font-size: 32px;
	font-weight: 800;
}

.form-avatar-camera {
	position: absolute;
	right: 4px;
	bottom: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 999px;
	background: rgba(15, 23, 42, 0.72);
	color: #fff;
	font-size: 16px;
}

.form-avatar-loading {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.72);
	color: #2563eb;
	font-size: 12px;
}

.form-avatar-hint {
	margin: 10px 0 0;
	color: #64748b;
	font-size: 13px;
}

.form-avatar-clear {
	margin-top: 8px;
	border: none;
	padding: 4px 8px;
	background: transparent;
	color: #94a3b8;
	font-size: 12px;
	cursor: pointer;

	&:active {
		color: #64748b;
	}
}

.remark-count {
	padding: 0 16px 10px;
	color: #94a3b8;
	font-size: 12px;
	text-align: right;
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
	background: linear-gradient(90deg, var(--gp-primary-from), var(--gp-primary-to));
	box-shadow: 0 8px 18px rgba(37, 99, 235, 0.28);
	color: #fff;

	&:disabled,
	&.van-button--disabled {
		opacity: 0.45;
		color: #fff;
	}
}

:deep(.van-uploader__input-wrapper),
:deep(.van-uploader__wrapper) {
	display: block;
}
</style>
