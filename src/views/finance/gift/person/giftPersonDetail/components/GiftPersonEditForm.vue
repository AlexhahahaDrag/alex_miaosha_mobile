<!-- eslint-disable vue/no-mutating-props -->
<template>
	<div class="gift-person-edit-form">
		<van-form
			class="person-form"
			data-testid="gift-person-form"
			@submit="emit('submit')"
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
/* eslint-disable vue/no-mutating-props */
import { showFailToast, showSuccessToast } from 'vant';
import { addFileManager } from '@/views/common/api/file';
import type { GiftPersonFormState } from '@/views/finance/gift/config';
import { RELATION_CUSTOM, formatPhoneDisplay, normalizePhoneDigits } from '@/views/finance/gift/config';
import type { GiftPersonRelationOptionVo, RelationSelectGroup } from '@/composables/useGiftRelationOptions';

const props = withDefaults(
	defineProps<{
		formState: GiftPersonFormState;
		avatarPreviewUrl?: string;
		saving?: boolean;
		presetOptions?: GiftPersonRelationOptionVo[];
		relationSelectOptions?: RelationSelectGroup[];
	}>(),
	{
		avatarPreviewUrl: '',
		saving: false,
		presetOptions: () => [],
		relationSelectOptions: () => [],
	},
);

const emit = defineEmits<{
	(e: 'update:avatarPreviewUrl', val: string): void;
	(e: 'submit'): void;
}>();

const CHINA_MOBILE = /^1[3-9]\d{9}$/;

const uploadingAvatar = ref<boolean>(false);
const showRelationPicker = ref<boolean>(false);

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const remarkLen = computed(() => Math.min(props.formState.remark?.length ?? 0, 50));

/** 展示 3-4-4；写入纯数字（最多 11 位） */
const phoneDisplay = computed({
	get: () => formatPhoneDisplay(props.formState.phone),
	set: (value: string) => {
		props.formState.phone = normalizePhoneDigits(value).slice(0, 11);
	},
});

const canSave = computed(() => {
	const nameOk = !!props.formState.personName?.trim();
	if (!props.formState.relationMode) return false;
	if (props.formState.relationMode === RELATION_CUSTOM) {
		return nameOk && !!props.formState.customRelation?.trim();
	}
	return nameOk;
});

const saveLabel = computed(() => (props.formState.id ? '保存更改' : '保存'));

const relationDisplay = computed(() => {
	if (props.formState.relationMode === RELATION_CUSTOM) {
		return props.formState.customRelation || '自定义…';
	}
	if (!props.formState.relationMode) return '';
	for (const group of props.relationSelectOptions) {
		const hit = group.options.find((item) => item.value === props.formState.relationMode);
		if (hit) return hit.label;
	}
	return '';
});

const relationPickerColumns = computed(() =>
	props.relationSelectOptions.flatMap((group) =>
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
			if (props.presetOptions.some((item) => item.name === text)) return false;
			return true;
		},
		message: '请输入有效自定义关系（勿与常用关系重名）',
	},
];

const clearAvatar = () => {
	navigator.vibrate?.(50);
	props.formState.avatar = undefined;
	props.formState.fileInfoVo = undefined;
	emit('update:avatarPreviewUrl', '');
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
			props.formState.avatar = String(data.id);
			emit('update:avatarPreviewUrl', String(data.preThumbnailUrl || data.preUrl || ''));
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

const onRelationConfirm = ({ selectedOptions }: { selectedOptions: Array<{ text?: string; value?: string }> }) => {
	const selected = selectedOptions[0];
	props.formState.relationMode = selected?.value;
	if (selected?.value !== RELATION_CUSTOM) {
		props.formState.customRelation = '';
	}
	showRelationPicker.value = false;
};
</script>

<style scoped lang="less">
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
