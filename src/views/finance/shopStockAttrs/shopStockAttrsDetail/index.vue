<template>
	<div class="shop-stock-attrs-detail">
		<div class="detail-container">
			<van-form
				@submit="onSubmit"
				:rules="rulesRef"
				required="auto"
				class="modern-form"
			>
				<div class="form-section">
					<div class="section-header">
						<div class="section-icon-box">
							<component
								:is="BoxIcon"
								:size="20"
								class="section-icon"
							/>
						</div>
						<div class="section-info">
							<div class="section-title">核心属性</div>
							<div class="section-desc">请填写库存属性的关键识别信息</div>
						</div>
					</div>

					<van-cell-group
						inset
						class="modern-group"
					>
						<van-field
							v-model="formInfo.stockId"
							name="stockId"
							:label="label.stockId"
							label-class="field-label"
							:placeholder="'请输入' + label.stockId"
							:rules="rulesRef.stockId"
							:maxlength="19"
						>
							<template #left-icon>
								<component
									:is="CodeIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>

						<van-field
							v-model="formInfo.attrCode"
							name="attrCode"
							:label="label.attrCode"
							label-class="field-label"
							:placeholder="'请输入' + label.attrCode"
							:rules="rulesRef.attrCode"
							:maxlength="255"
						>
							<template #left-icon>
								<component
									:is="FileEditIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>

						<van-field
							v-model="formInfo.attrName"
							name="attrName"
							:label="label.attrName"
							label-class="field-label"
							:placeholder="'请输入' + label.attrName"
							:rules="rulesRef.attrName"
							:maxlength="255"
						>
							<template #left-icon>
								<component
									:is="TypeIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>

						<van-field
							v-model="formInfo.attrValue"
							name="attrValue"
							:label="label.attrValue"
							label-class="field-label"
							:placeholder="'请输入' + label.attrValue"
							:rules="rulesRef.attrValue"
							:maxlength="255"
						>
							<template #left-icon>
								<component
									:is="MessageSquareIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>
					</van-cell-group>
				</div>

				<div class="form-section">
					<div class="section-header">
						<div class="section-icon-box secondary">
							<component
								:is="CheckCircleIcon"
								:size="20"
								class="section-icon"
							/>
						</div>
						<div class="section-info">
							<div class="section-title">状态与备注</div>
							<div class="section-desc">配置属性的可用性及补充说明</div>
						</div>
					</div>

					<van-cell-group
						inset
						class="modern-group"
					>
						<van-field
							v-model="isValidName"
							is-link
							readonly
							name="isValid"
							:label="label.isValid"
							label-class="field-label"
							:placeholder="'请选择' + label.isValid"
							:rules="rulesRef.isValid"
							@click="choose('isValid')"
						>
							<template #left-icon>
								<component
									:is="CheckCircleIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>

						<van-field
							v-model="formInfo.description"
							rows="3"
							autosize
							type="textarea"
							name="description"
							:label="label.description"
							label-class="field-label"
							:placeholder="'请输入' + label.description"
							:rules="rulesRef.description"
							:maxlength="65535"
							show-word-limit
						>
							<template #left-icon>
								<component
									:is="FileEditIcon"
									:size="16"
									class="field-icon"
								/>
							</template>
						</van-field>
					</van-cell-group>
				</div>

				<div class="submit-section">
					<van-button
						round
						block
						type="primary"
						native-type="submit"
						class="submit-btn"
						:loading="submitting"
						loading-text="正在保存..."
					>
						<template #icon>
							<component
								:is="SaveIcon"
								:size="18"
							/>
						</template>
						提交保存
					</van-button>
				</div>

				<selectPop
					:info="popInfo"
					@select-info="selectInfo"
					@cancel-info="cancelInfo"
				></selectPop>
			</van-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	Box as BoxIcon,
	Code as CodeIcon,
	Type as TypeIcon,
	FileEdit as FileEditIcon,
	CheckCircle as CheckCircleIcon,
	MessageSquare as MessageSquareIcon,
	Save as SaveIcon,
} from 'lucide-vue-next';
import { showFailToast, showSuccessToast } from 'vant';
import { label, rulesRef } from '@/views/finance/shopStockAttrs/config';
import type { ShopStockAttrsData } from '@/views/finance/shopStockAttrs/config';
import { addShopStockAttrs, updateShopStockAttrs, getShopStockAttrsDetail } from '@/views/finance/shopStockAttrs/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { DictInfo } from '@/views/common/config';
import { getListName } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import { useNavBar } from '@/composables/useNavBar';

// [Hooks]
useNavBar({
	title: (route?.meta?.title as string) || '库存属性详情',
	leftPath: '/finance/shopStockAttrs',
});

// [State]
const formInfo = ref<ShopStockAttrsData>({});
const popInfo = ref<Info>({ showFlag: false });
const isValidName = ref<string>('');
const submitting = ref<boolean>(false);

const isValidInfo = ref<Info>({
	label: 'isValid',
	labelName: label.isValid,
	rule: rulesRef.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.isValid,
});

// [Methods]
const choose = (type: string): void => {
	navigator.vibrate?.(50);
	switch (type) {
		case 'isValid':
			popInfo.value = isValidInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string): void => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'isValid':
			formInfo.value.isValid = value;
			isValidName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const getDictInfoList = (data: DictInfo[]): void => {
	isValidInfo.value.list = data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
	isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
};

const onSubmit = async (): Promise<void> => {
	navigator.vibrate?.(50);
	submitting.value = true;
	const api = formInfo.value.id ? updateShopStockAttrs : addShopStockAttrs;

	try {
		const { code, message } = await api(formInfo.value);
		if (code === '200') {
			showSuccessToast(message || '保存成功!');
			setTimeout(() => {
				router.push({ path: '/finance/shopStockAttrs' });
			}, 1000);
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} catch {
		showFailToast('网络请求异常');
	} finally {
		submitting.value = false;
	}
};

const init = (): void => {
	const id = route?.query?.id as string;
	if (id) {
		Promise.all([getShopStockAttrsDetail(id), getDictList('is_valid')])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
				} else {
					showFailToast(res[0]?.message || '查询详情失败');
				}
				getDictInfoList(res[1]?.data || []);
			})
			.catch(() => {
				showFailToast('系统异常，请联系管理员');
			});
	} else {
		getDictList('is_valid').then((res: any) => {
			getDictInfoList(res.data || []);
		});
		formInfo.value = {
			isValid: '1', // 默认有效
		};
	}
};

onMounted(() => {
	init();
});
</script>

<style lang="less" scoped>
.shop-stock-attrs-detail {
	min-height: 100vh;
	background-color: #f5f7fb;
	padding-bottom: 40px;
}

.detail-container {
	padding-top: 12px;
}

.form-section {
	margin-bottom: 24px;
}

.section-header {
	display: flex;
	align-items: center;
	padding: 0 20px;
	margin-bottom: 12px;

	.section-icon-box {
		width: 36px;
		height: 36px;
		background: #eef2ff;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;

		&.secondary {
			background: #f0fdf4;
			.section-icon {
				color: #22c55e;
			}
		}
	}

	.section-icon {
		color: #4f46e5;
	}

	.section-info {
		flex: 1;
	}

	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: #1e293b;
	}

	.section-desc {
		font-size: 11px;
		color: #94a3b8;
	}
}

.modern-group {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	overflow: hidden;
	border-radius: 16px !important;
}

.field-label {
	color: #64748b;
	font-weight: 500;
}

.field-icon {
	color: #94a3b8;
	margin-right: 8px;
}

.submit-section {
	margin: 32px 16px;
}

.submit-btn {
	height: 50px;
	font-size: 16px;
	font-weight: 600;
	background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
	border: none;
	box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);

	&:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
}

:deep(.van-field__left-icon) {
	display: flex;
	align-items: center;
}

:deep(.van-cell) {
	padding: 16px;
}
</style>
