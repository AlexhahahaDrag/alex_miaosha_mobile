<template>
	<div class="shop-stock-batch-detail-container">
		<van-form
			@submit="onSubmit"
			class="premium-form"
		>
			<!-- Header Section -->
			<div class="header-card">
				<div class="header-title">
					<van-icon
						name="records-o"
						class="title-icon"
					/>
					<span>{{ formInfo?.id ? '编辑批次记录' : '新增批次记录' }}</span>
				</div>
				<div class="header-desc">请完善批次详细信息，确保数据准确性</div>
			</div>

			<!-- Form Section -->
			<div class="form-section-card">
				<div class="section-title">
					<span class="title-line"></span>
					基本信息
				</div>
				<van-cell-group
					:border="false"
					class="custom-cell-group"
				>
					<!-- Batch Code -->
					<van-field
						v-model="formInfo.batchCode"
						name="batchCode"
						:label="label.batchCode"
						:placeholder="'请输入' + label.batchCode"
						:rules="rulesRef.batchCode"
						:maxlength="255"
						required
						class="custom-field"
					/>

					<!-- Batch Name -->
					<van-field
						v-model="formInfo.batchName"
						name="batchName"
						:label="label.batchName"
						:placeholder="'请输入' + label.batchName"
						:rules="rulesRef.batchName"
						:maxlength="255"
						required
						class="custom-field"
					/>

					<!-- Is Valid -->
					<van-field
						v-model="isValidName"
						name="isValid"
						:label="label.isValid"
						:placeholder="'请选择' + label.isValid"
						:rules="rulesRef.isValid"
						@click="choose('isValid')"
						readonly
						is-link
						required
						class="custom-field"
					/>

					<!-- Description -->
					<van-field
						v-model="formInfo.description"
						name="description"
						:label="label.description"
						:placeholder="'请输入' + label.description"
						type="textarea"
						rows="3"
						autosize
						:maxlength="200"
						show-word-limit
						class="custom-field"
					/>
				</van-cell-group>
			</div>

			<!-- Financial Info Section -->
			<div class="form-section-card">
				<div class="section-title">
					<span class="title-line"></span>
					财务信息
				</div>
				<van-cell-group
					:border="false"
					class="custom-cell-group"
				>
					<!-- Cost -->
					<van-field
						v-model="formInfo.cost"
						name="cost"
						:label="label.cost"
						:placeholder="'请输入' + label.cost"
						type="number"
						class="custom-field"
					>
						<template #button>
							<span class="field-prefix">¥</span>
						</template>
					</van-field>

					<!-- Travel Expense -->
					<van-field
						v-model="formInfo.travelExpense"
						name="travelExpense"
						:label="label.travelExpense"
						:placeholder="'请输入' + label.travelExpense"
						type="number"
						class="custom-field"
					>
						<template #button>
							<span class="field-prefix">¥</span>
						</template>
					</van-field>

					<!-- Purchase Date -->
					<van-field
						v-model="formInfo.purchaseDate"
						name="purchaseDate"
						:label="label.purchaseDate"
						:placeholder="'请选择' + label.purchaseDate"
						@click="showDatePicker = true"
						readonly
						is-link
						class="custom-field last-field"
					/>
				</van-cell-group>
			</div>

			<!-- Date Picker Popup -->
			<van-popup
				v-model:show="showDatePicker"
				position="bottom"
			>
				<van-date-picker
					v-model="selectedDate"
					title="选择进货日期"
					@confirm="onDateConfirm"
					@cancel="showDatePicker = false"
				/>
			</van-popup>

			<div class="submit-wrapper">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="submit-btn"
				>
					提交保存
				</van-button>
			</div>
			<SelectPop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			/>
		</van-form>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { label, rulesRef } from '@/views/finance/shopStockBatch/config';
import type { ShopStockBatchData } from '@/views/finance/shopStockBatch/config';
import { getListName } from '@/views/common/config';
import { addShopStockBatch, updateShopStockBatch, getShopStockBatchDetail } from '@/views/finance/shopStockBatch/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/views/finance/dict/api';
import { useNavBar } from '@/composables/useNavBar';
import type { DictInfo } from '@/views/common/config';

const route = useRoute();
const router = useRouter();

// --- useHooks ---
useNavBar({
	title: (route?.meta?.title as string) || '批次详情',
	leftPath: '/finance/shopStockBatch',
	visible: true,
});

// --- Variables ---
const formInfo = ref<ShopStockBatchData>({});
const popInfo = ref<Info>({ showFlag: false });
const isValidName = ref<string>('');
const showDatePicker = ref<boolean>(false);
const selectedDate = ref<string[]>([]);

const isValidInfo = ref<Info>({
	label: 'isValid',
	labelName: label.isValid,
	rule: rulesRef.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: '',
});

// --- Methods ---
const choose = (type: string) => {
	switch (type) {
		case 'isValid':
			isValidInfo.value.selectValue = formInfo.value.isValid;
			popInfo.value = isValidInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: string, name: string) => {
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

const onDateConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
	formInfo.value.purchaseDate = selectedValues.join('-');
	showDatePicker.value = false;
};

const getDictInfoList = (data: DictInfo[]) => {
	if (data?.length > 0) {
		isValidInfo.value.list = data.filter((item) => item.belongTo == 'is_valid');
		isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
	}
};

const onSubmit = async () => {
	navigator.vibrate?.(50);
	const isEdit = !!formInfo.value.id;
	try {
		const { code, message } = await (isEdit ? updateShopStockBatch(formInfo.value) : addShopStockBatch(formInfo.value));
		if (code == '200') {
			showSuccessToast(message || '保存成功!');
			router.push({ path: '/finance/shopStockBatch' });
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} catch {
		showFailToast('系统问题，请联系管理员！');
	}
};

const init = async () => {
	const id = route?.query?.id as string;
	try {
		const [detailRes, dictRes] = await Promise.all([
			id ? getShopStockBatchDetail(Number(id)) : Promise.resolve({ code: '200', data: { isValid: '1' } }),
			getDictList('is_valid'),
		]);

		if (detailRes.code == '200') {
			formInfo.value = detailRes.data || {};
			if (!formInfo.value.id && !formInfo.value.isValid) {
				formInfo.value.isValid = '1';
			}
		} else {
			showFailToast(detailRes.message || '查询详情失败');
		}

		if (dictRes.code == '200') {
			getDictInfoList(dictRes.data);
		}
	} catch {
		showFailToast('系统初始化失败，请重试');
	}
};

// --- Init ---
init();
</script>

<style lang="less" scoped>
.shop-stock-batch-detail-container {
	min-height: 100%;
	background-color: #f8fafc;
	padding-bottom: 40px;
}

.premium-form {
	padding: 16px;
}

.header-card {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	border-radius: 16px;
	padding: 24px;
	margin-bottom: 20px;
	color: #fff;
	box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);

	.header-title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 8px;

		.title-icon {
			font-size: 24px;
		}
	}

	.header-desc {
		font-size: 13px;
		opacity: 0.8;
	}
}

.form-section-card {
	background: #fff;
	border-radius: 16px;
	padding: 20px 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	margin-bottom: 24px;

	.section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 20px;
		padding-left: 4px;

		.title-line {
			width: 4px;
			height: 16px;
			background-color: #3b82f6;
			border-radius: 2px;
		}
	}
}

.custom-cell-group {
	background: transparent;
}

.custom-field {
	padding: 12px 4px;

	:deep(.van-field__label) {
		color: #64748b;
		font-weight: 500;
		width: 80px;
	}

	:deep(.van-field__control) {
		color: #1e293b;
		font-weight: 500;
	}

	&::after {
		left: 4px;
		right: 4px;
		border-bottom: 1px solid #f1f5f9;
	}

	.field-prefix {
		color: #64748b;
		font-weight: 500;
		margin-right: 4px;
	}
}

.last-field::after {
	display: none;
}

.submit-wrapper {
	margin-top: 32px;
	padding: 0 8px;

	.submit-btn {
		height: 48px;
		font-size: 16px;
		font-weight: 700;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border: none;
		box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);

		&:active {
			opacity: 0.9;
			transform: scale(0.99);
		}
	}
}
</style>
