<template>
	<div
		class="gift-person-detail"
		data-testid="gift-person-detail"
	>
		<gift-person-profile-view
			v-if="isProfileMode"
			:profile="profile"
			:relation-label="relationLabel"
			:deleting="deleting"
			@edit="openEdit"
			@delete="removePerson"
		/>
		<gift-person-edit-form
			v-else
			:form-state="formState"
			v-model:avatar-preview-url="avatarPreviewUrl"
			:saving="saving"
			:preset-options="presetOptions"
			:relation-select-options="relationSelectOptions"
			@submit="savePerson"
		/>
	</div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import GiftPersonProfileView from './components/GiftPersonProfileView.vue';
import GiftPersonEditForm from './components/GiftPersonEditForm.vue';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
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
import { buildRelationTypeForSave, normalizePhoneDigits, personAvatarSrc } from '@/views/finance/gift/config';

const route = useRoute();
const router = useRouter();
const { hasPermission } = usePermission();
const { presetOptions, relationSelectOptions, loadRelationOptions, relationLabel, mapRelationToFormFields } =
	useGiftRelationOptions();

const personId = computed(() => {
	const id = route.query.id;
	return typeof id === 'string' && id ? id : undefined;
});

const mode = ref<'profile' | 'form'>('form');
const isProfileMode = computed(() => mode.value === 'profile');
const saving = ref<boolean>(false);
const deleting = ref<boolean>(false);
const formState = ref<GiftPersonFormState>({});
const profile = ref<GiftPersonProfile>({});
/** 本地头像预览（上传成功或详情回填） */
const avatarPreviewUrl = ref('');

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

const toSavePayload = (): GiftPersonInfo => {
	const {
		relationMode: _relationMode,
		customRelation: _customRelation,
		fileInfoVo: _fileInfoVo,
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
		avatarPreviewUrl.value = '';
		return;
	}
	try {
		const { code, data, message } = await getGiftPersonDetail(id);
		if (code === '200') {
			const person = data || {};
			formState.value = mapRelationToFormFields(person);
			// 编辑回填：优先缩略图
			avatarPreviewUrl.value = personAvatarSrc(person);
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
</style>
