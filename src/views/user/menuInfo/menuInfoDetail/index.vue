<template>
	<div class="menu-detail-page">
		<!-- 加载骨架屏（防止数据返回前闪现空表单或误触提交） -->
		<section
			v-if="detailLoading"
			class="form-card sk-card"
			data-testid="menu-detail-skeleton"
		>
			<div
				v-for="idx in 6"
				:key="`menu-detail-sk-${idx}`"
				class="sk-row"
			>
				<div class="shimmer-bar sk-w-64 sk-h-14"></div>
				<div class="shimmer-bar sk-w-160 sk-h-14"></div>
			</div>
		</section>

		<van-form
			v-else
			class="menu-detail-form"
			:rules="rulesRef"
			required="auto"
			@submit="onSubmit"
		>
			<section class="form-card">
				<van-field
					v-model="formInfo.name"
					name="name"
					:label="label.name"
					:placeholder="'请输入' + label.name"
					:rules="rulesRef.name"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.title"
					name="title"
					:label="label.title"
					:placeholder="'请输入' + label.title"
					:rules="rulesRef.title"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.path"
					name="path"
					:label="label.path"
					:placeholder="'请输入' + label.path"
					:rules="rulesRef.path"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.component"
					name="component"
					:label="label.component"
					:placeholder="'请输入' + label.component"
					:rules="rulesRef.component"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.redirect"
					name="redirect"
					:label="label.redirect"
					:placeholder="'请输入' + label.redirect"
					:rules="rulesRef.redirect"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.icon"
					name="icon"
					:label="label.icon"
					:placeholder="'请输入' + label.icon"
					:rules="rulesRef.icon"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.parentId"
					name="parentId"
					:label="label.parentId"
					:placeholder="'请输入' + label.parentId"
					:rules="rulesRef.parentId"
					maxlength="128"
					clearable
					class="soft-field"
				/>
				<van-field
					v-model="formInfo.orderBy"
					name="orderBy"
					type="number"
					:label="label.orderBy"
					:placeholder="'请输入' + label.orderBy"
					:rules="rulesRef.orderBy"
					maxlength="19"
					clearable
					class="soft-field"
				/>

				<!-- 零弹窗行内分段控制：是否隐藏 -->
				<div class="segment-row">
					<span class="segment-label">{{ label.hideInMenu }}</span>
					<div class="inline-segmented">
						<button
							type="button"
							:class="['seg-item', { active: formInfo.hideInMenu === '0' }]"
							@click="formInfo.hideInMenu = '0'"
						>
							显示
						</button>
						<button
							type="button"
							:class="['seg-item', { active: formInfo.hideInMenu === '1' }]"
							@click="formInfo.hideInMenu = '1'"
						>
							隐藏
						</button>
					</div>
				</div>

				<!-- 零弹窗行内分段控制：状态 -->
				<div class="segment-row">
					<span class="segment-label">{{ label.status }}</span>
					<div class="inline-segmented">
						<button
							type="button"
							:class="['seg-item', { active: formInfo.status === '1' }]"
							@click="formInfo.status = '1'"
						>
							有效
						</button>
						<button
							type="button"
							:class="['seg-item', { active: formInfo.status === '0' }]"
							@click="formInfo.status = '0'"
						>
							无效
						</button>
					</div>
				</div>

				<van-field
					v-model="formInfo.summary"
					name="summary"
					type="textarea"
					rows="2"
					autosize
					:label="label.summary"
					:placeholder="'请输入' + label.summary"
					:rules="rulesRef.summary"
					maxlength="200"
					show-word-limit
					class="soft-field"
				/>
			</section>

			<div class="submit-bar">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="submit-btn"
					:loading="submitting"
					data-testid="rbac-menu-detail-submit"
				>
					保存菜单配置
				</van-button>
			</div>
		</van-form>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { label, rulesRef } from '@/views/user/menuInfo/menuInfoDetail/menuInfoDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { addMenuInfo, updateMenuInfo, getMenuInfoDetail } from '@/views/user/menuInfo/api';

const route = useRoute();
const router = useRouter();

interface MenuInfoForm {
	id?: string;
	name?: string;
	path?: string;
	title?: string;
	component?: string;
	redirect?: string;
	icon?: string;
	hideInMenu?: string;
	parentId?: string;
	summary?: string;
	status?: string;
	orderBy?: string | number;
}

useNavBar({
	title: route?.query?.id ? '编辑菜单' : '新增菜单',
	leftPath: '/user/menuInfo',
	visible: true,
});

useTabBar({ visible: false });

const formInfo = ref<MenuInfoForm>({
	hideInMenu: '0',
	status: '1',
});
const detailLoading = ref<boolean>(Boolean(route?.query?.id));
const submitting = ref<boolean>(false);

const onSubmit = async () => {
	submitting.value = true;
	try {
		const api = formInfo.value.id ? updateMenuInfo : addMenuInfo;
		const { code, message } = await api(formInfo.value);
		if (code == '200') {
			showSuccessToast(message || '保存成功');
			router.push({ path: '/user/menuInfo' });
		} else {
			showFailToast(message || '保存失败，请联系管理员');
		}
	} finally {
		submitting.value = false;
	}
};

async function init() {
	const id = route?.query?.id as string | undefined;
	if (!id) {
		detailLoading.value = false;
		formInfo.value = {
			hideInMenu: '0',
			status: '1',
		};
		return;
	}

	detailLoading.value = true;
	formInfo.value = {};
	try {
		const { code, data, message } = await getMenuInfoDetail(id);
		if (code == '200' && data) {
			formInfo.value = {
				...data,
				id: data.id != null ? String(data.id) : undefined,
				parentId: data.parentId != null ? String(data.parentId) : undefined,
				hideInMenu: data.hideInMenu != null ? String(data.hideInMenu) : '0',
				status: data.status != null ? String(data.status) : '1',
			};
		} else {
			showFailToast(message || '查询菜单详情失败');
		}
	} finally {
		detailLoading.value = false;
	}
}

onMounted(() => {
	void init();
});
</script>

<style lang="less" scoped>
.menu-detail-page {
	min-height: 100%;
	background: var(--theme-login-bg, #f6f8fb);
	padding: 12px 14px calc(24px + env(safe-area-inset-bottom));
	box-sizing: border-box;
	transition: background 0.3s ease;
}

.form-card {
	background: #ffffff;
	border-radius: 18px;
	padding: 6px 14px;
	box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.soft-field {
	padding: 12px 2px;

	:deep(.van-field__label) {
		font-size: 13.5px;
		font-weight: 600;
		color: #334155;
		width: 84px;
	}

	:deep(.van-field__control) {
		font-size: 13.5px;
		color: #0f172a;
	}
}

.segment-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 11px 2px;
	border-bottom: 1px solid #f1f5f9;

	.segment-label {
		font-size: 13.5px;
		font-weight: 600;
		color: #334155;
	}

	.inline-segmented {
		display: inline-flex;
		background: #f1f5f9;
		padding: 3px;
		border-radius: 10px;
		gap: 2px;

		.seg-item {
			border: 1px solid transparent;
			background: transparent;
			padding: 4px 14px;
			border-radius: 8px;
			font-size: 12.5px;
			font-weight: 500;
			color: #64748b;
			cursor: pointer;
			transition: all 0.15s ease;

			&.active {
				background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
				border-color: var(--theme-border-color, rgba(59, 130, 246, 0.28));
				color: var(--primary-color, #3b82f6);
				font-weight: 700;
			}
		}
	}
}

.submit-bar {
	margin-top: 18px;

	.submit-btn {
		height: 46px;
		border: none !important;
		font-size: 15px;
		font-weight: 700;
		background: var(--theme-btn-gradient, linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)) !important;
		box-shadow: 0 10px 22px -6px var(--theme-shadow-color, rgba(59, 130, 246, 0.32));
	}
}

.sk-card {
	padding: 16px;

	.sk-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 0;
		border-bottom: 1px solid #f1f5f9;

		&:last-child {
			border-bottom: none;
		}
	}
}

.shimmer-bar {
	background: #eef2f7;
	border-radius: 6px;
	animation: detailPulse 1.4s ease-in-out infinite;
}

.sk-w-64 {
	width: 64px;
}
.sk-w-160 {
	width: 160px;
}
.sk-h-14 {
	height: 14px;
}

@keyframes detailPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
