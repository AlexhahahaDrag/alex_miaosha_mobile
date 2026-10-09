<template>
	<div class="finance-detail-container">
		<!-- 1. 顶部收支分段切换 (Segmented Tabs) -->
		<div class="segment-wrapper">
			<div class="segment-bar">
				<button
					type="button"
					:class="['segment-tab', { active: formInfo.incomeAndExpenses === 'expense' }]"
					@click="switchDirection('expense')"
				>
					<span class="tab-dot dot-expense"></span>
					支出
				</button>
				<button
					type="button"
					:class="['segment-tab', { active: formInfo.incomeAndExpenses === 'income' }]"
					@click="switchDirection('income')"
				>
					<span class="tab-dot dot-income"></span>
					收入
				</button>
			</div>
		</div>

		<!-- 2. 金额看板与快速辅助信息 (Hero Amount & Quick Bar) -->
		<div
			class="amount-hero-card"
			:class="formInfo.incomeAndExpenses === 'income' ? 'mode-income' : 'mode-expense'"
		>
			<div class="amount-digits-line">
				<span class="currency-prefix">{{ formInfo.incomeAndExpenses === 'income' ? '+¥' : '-¥' }}</span>
				<span
					class="amount-val"
					:class="{ 'is-zero': !amountStr }"
				>
					{{ amountStr || '0.00' }}
				</span>
				<span class="cursor-caret"></span>
			</div>

			<!-- 辅助标签栏：所选分类、日期快捷、支付方式、名称备注 -->
			<div class="quick-meta-row">
				<div
					class="meta-pill category-pill"
					@click="scrollToCategories"
				>
					<van-icon
						name="apps-o"
						class="pill-icon"
					/>
					<span class="pill-text">{{ formInfo.typeCode || '未选分类' }}</span>
				</div>

				<div
					class="meta-pill date-pill"
					@click="chooseDate"
				>
					<van-icon
						name="calendar-o"
						class="pill-icon"
					/>
					<span class="pill-text">{{ displayDateLabel }}</span>
				</div>

				<div
					class="meta-pill source-pill"
					@click="choose('fromSource')"
				>
					<van-icon
						name="credit-pay"
						class="pill-icon"
					/>
					<span class="pill-text">{{ nameRefMap.fromSource.value || '微信' }}</span>
				</div>

				<div
					class="meta-pill name-pill"
					@click="showNameInput = !showNameInput"
				>
					<van-icon
						name="edit"
						class="pill-icon"
					/>
					<span class="pill-text">{{ formInfo.name || '备注/名称' }}</span>
				</div>
			</div>

			<!-- 内联轻量备注输入（可选展开） -->
			<div
				v-if="showNameInput"
				class="inline-name-box"
			>
				<van-field
					v-model="formInfo.name"
					placeholder="输入记录名称或备注"
					clearable
					class="custom-inline-field"
				>
					<template #button>
						<van-button
							size="small"
							type="primary"
							round
							@click="showNameInput = false"
						>
							完成
						</van-button>
					</template>
				</van-field>
			</div>
		</div>

		<!-- 3. 中间可滚动区域：九宫格分类网格 + 高级设置折叠 -->
		<div
			class="scroll-body-wrapper"
			ref="scrollContainerRef"
		>
			<!-- 分类网格九宫格 -->
			<div class="category-grid-card">
				<div class="card-header-bar">
					<span class="header-title">选择记账分类</span>
					<span
						v-if="dynamicCategories.length"
						class="header-hint"
					>已融合常用历史分类</span>
				</div>

				<div class="category-grid">
					<div
						v-for="cat in activeCategoryList"
						:key="cat.name"
						:class="['category-cell', { active: formInfo.typeCode === cat.name }]"
						@click="selectCategory(cat)"
					>
						<div
							class="cat-icon-bubble"
							:style="{
								backgroundColor: formInfo.typeCode === cat.name ? cat.color : cat.bgColor,
								color: formInfo.typeCode === cat.name ? '#ffffff' : cat.color,
							}"
						>
							<van-icon
								:name="cat.icon"
								class="cat-icon"
							/>
						</div>
						<span class="cat-label">{{ cat.name }}</span>
					</div>

					<!-- 自定义分类卡片 -->
					<div
						class="category-cell custom-cell"
						@click="openCustomCategoryDialog"
					>
						<div class="cat-icon-bubble custom-bubble">
							<van-icon
								name="plus"
								class="cat-icon"
							/>
						</div>
						<span class="cat-label">自定义</span>
					</div>
				</div>
			</div>

			<!-- 高级选项收折卡片 (所属人、状态等) -->
			<div class="advanced-card">
				<div
					class="advanced-header"
					@click="showAdvanced = !showAdvanced"
				>
					<div class="adv-left">
						<van-icon
							name="setting-o"
							class="adv-icon"
						/>
						<span>高级设置 (归属人、状态)</span>
					</div>
					<van-icon
						:name="showAdvanced ? 'arrow-up' : 'arrow-down'"
						class="arrow-icon"
					/>
				</div>

				<div
					v-if="showAdvanced"
					class="advanced-body"
				>
					<van-cell-group inset>
						<van-cell
							title="归属人"
							is-link
							:value="nameRefMap.belongTo.value || '当前用户'"
							@click="choose('belongTo')"
						/>
						<van-cell
							title="账目状态"
							is-link
							:value="nameRefMap.isValid.value || '有效'"
							@click="choose('isValid')"
						/>
						<van-cell
							title="完整业务时间"
							is-link
							:value="nameRefMap.infoDate.value"
							@click="chooseDate"
						/>
					</van-cell-group>
				</div>
			</div>
		</div>

		<!-- 4. 底部定制记账数字键盘 (Built-in Keypad) -->
		<div class="keypad-panel">
			<div class="keypad-grid">
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('1')"
				>1</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('2')"
				>2</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('3')"
				>3</button>
				<button
					type="button"
					class="kp-btn func-btn delete-btn"
					@click="pressKey('backspace')"
				>
					<van-icon name="delete-o" />
				</button>

				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('4')"
				>4</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('5')"
				>5</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('6')"
				>6</button>
				<button
					type="button"
					class="kp-btn func-btn date-shortcut-btn"
					@click="chooseDate"
				>
					<span class="date-shortcut-text">{{ isToday ? '今天' : keypadDateShort }}</span>
				</button>

				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('7')"
				>7</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('8')"
				>8</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('9')"
				>9</button>
				<button
					v-if="!formInfo.id"
					type="button"
					class="kp-btn func-btn continue-btn"
					:disabled="loading"
					@click="handleSaveAndContinue"
				>
					再记一笔
				</button>
				<button
					v-else
					type="button"
					class="kp-btn func-btn reset-btn"
					@click="resetFormToInitial"
				>
					重置
				</button>

				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('.')"
				>.</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('0')"
				>0</button>
				<button
					type="button"
					class="kp-btn num-btn"
					@click="pressKey('00')"
				>00</button>
				<button
					type="button"
					class="kp-btn func-btn submit-btn"
					:disabled="loading"
					@click="handleSaveAndFinish"
				>
					{{ loading ? '保存中' : formInfo.id ? '保存' : '完成' }}
				</button>
			</div>
		</div>

		<!-- 弹窗组件 -->
		<select-pop
			:info="popInfo"
			@select-info="selectInfo"
			@cancel-info="cancelInfo"
		/>
		<date-pop
			:info="chooseDateInfo"
			@select-date-info="selectDateInfo"
			@cancel-date-info="cancelDateInfo"
		/>

		<!-- 自定义分类录入弹窗 -->
		<van-dialog
			v-model:show="showCustomCatDialog"
			title="新增自定义分类"
			show-cancel-button
			@confirm="confirmCustomCategory"
		>
			<div class="custom-cat-dialog-box">
				<van-field
					v-model="customCatInput"
					placeholder="例如: 宠物/外卖/健身"
					maxlength="10"
					clearable
				/>
			</div>
		</van-dialog>
	</div>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { getListName, type DictFieldConfig } from '@/views/common/config';
import { rulesRef, type FinanceManagerData } from '@/views/finance/financeManager/config';
import { getDictList } from '@/views/finance/dict/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import { useUserStore } from '@/store/modules/user/user';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/views/finance/dict/api';
import type { UserManagerData } from '@/views/user/userManager/config';
import {
	addFinanceManger,
	editFinanceManger,
	getFinanceMangerDetail,
	getBudgetCategories,
} from '@/views/finance/financeManager/api';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';
import { useTabBar } from '@/composables/useTabBar';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';

const route = useRoute();
const router = useRouter();
const userInfo = useUserStore()?.getUserInfo;
const dashboardStore = useDashboardStore();

// 导航栏配置
useNavBar({
	title: route?.query?.id ? '编辑账单' : '记一笔',
	leftPath: getRoutePathByName(router, 'financeManager'),
	visible: true,
});

useTabBar({
	visible: false,
});

const getLeftPath = computed(() => getRoutePathByName(router, 'financeManager'));

const formInfo = ref<FinanceManagerData>({});
const loading = ref<boolean>(false);
const amountStr = ref<string>('');
const showNameInput = ref<boolean>(false);
const showAdvanced = ref<boolean>(false);
const showCustomCatDialog = ref<boolean>(false);
const customCatInput = ref<string>('');
const scrollContainerRef = ref<HTMLElement | null>(null);

// 历史/动态分类列表
const dynamicCategories = ref<string[]>([]);

interface CategoryItem {
	name: string;
	icon: string;
	color: string;
	bgColor: string;
}

const expensePresets: CategoryItem[] = [
	{ name: '餐饮', icon: 'food-o', color: '#fa8c16', bgColor: '#fff7e6' },
	{ name: '交通', icon: 'logistics', color: '#1890ff', bgColor: '#e6f7ff' },
	{ name: '购物', icon: 'bag-o', color: '#eb2f96', bgColor: '#fff0f6' },
	{ name: '日用', icon: 'cart-o', color: '#52c41a', bgColor: '#f6ffed' },
	{ name: '娱乐', icon: 'smile-o', color: '#722ed1', bgColor: '#f9f0ff' },
	{ name: '医疗', icon: 'plus', color: '#ff4d4f', bgColor: '#fff1f0' },
	{ name: '住房', icon: 'home-o', color: '#13c2c2', bgColor: '#e6fffb' },
	{ name: '通信', icon: 'phone-o', color: '#2f54eb', bgColor: '#f0f5ff' },
	{ name: '服饰', icon: 'gift-o', color: '#fa541c', bgColor: '#fff2e8' },
	{ name: '零食', icon: 'shop-o', color: '#faad14', bgColor: '#fffbe6' },
	{ name: '学习', icon: 'notes-o', color: '#096dd9', bgColor: '#e6f7ff' },
	{ name: '其它', icon: 'ellipsis', color: '#8c8c8c', bgColor: '#f5f5f5' },
];

const incomePresets: CategoryItem[] = [
	{ name: '工资', icon: 'gold-coin-o', color: '#52c41a', bgColor: '#f6ffed' },
	{ name: '兼职', icon: 'cash-back-record', color: '#fa8c16', bgColor: '#fff7e6' },
	{ name: '理财', icon: 'chart-trending-o', color: '#1890ff', bgColor: '#e6f7ff' },
	{ name: '礼金', icon: 'gem-o', color: '#ff4d4f', bgColor: '#fff1f0' },
	{ name: '退款', icon: 'refund-o', color: '#13c2c2', bgColor: '#e6fffb' },
	{ name: '其它', icon: 'ellipsis', color: '#8c8c8c', bgColor: '#f5f5f5' },
];

const activeCategoryList = computed<CategoryItem[]>(() => {
	const baseList = formInfo.value.incomeAndExpenses === 'income' ? incomePresets : expensePresets;
	const existingNames = new Set(baseList.map((item) => item.name));
	const extra: CategoryItem[] = [];

	for (const cat of dynamicCategories.value) {
		if (cat && !existingNames.has(cat)) {
			extra.push({
				name: cat,
				icon: 'apps-o',
				color: '#1677ff',
				bgColor: '#eff6ff',
			});
			existingNames.add(cat);
		}
	}

	// 如果当前选择的分类不在列表中，也动态追加
	if (formInfo.value.typeCode && !existingNames.has(formInfo.value.typeCode)) {
		extra.unshift({
			name: formInfo.value.typeCode,
			icon: 'apps-o',
			color: '#1677ff',
			bgColor: '#eff6ff',
		});
	}

	return [...extra, ...baseList];
});

const isToday = computed(() => {
	const cur = formInfo.value.infoDate ? dayjs(formInfo.value.infoDate) : dayjs();
	return cur.isSame(dayjs(), 'day');
});

const keypadDateShort = computed(() => {
	const cur = formInfo.value.infoDate ? dayjs(formInfo.value.infoDate) : dayjs();
	return cur.format('M/D');
});

const displayDateLabel = computed(() => {
	if (isToday.value) return '今天';
	return formInfo.value.infoDate ? dayjs(formInfo.value.infoDate).format('YYYY-MM-DD') : '今天';
});

// 字典与弹窗配置
const popInfo = ref<Info>({ showFlag: false });

const dictFieldConfig: DictFieldConfig<FinanceManagerData>[] = [
	{
		key: 'fromSource',
		labelName: '支付方式',
		rule: rulesRef.fromSource,
		belongTo: 'pay_way',
		formKey: 'fromSource' as keyof FinanceManagerData,
	},
	{
		key: 'incomeAndExpenses',
		labelName: '收支类型',
		rule: rulesRef.incomeAndExpenses,
		belongTo: 'income_expense_type',
		formKey: 'incomeAndExpenses' as keyof FinanceManagerData,
	},
	{
		key: 'isValid',
		labelName: '状态',
		rule: rulesRef.isValid,
		belongTo: 'is_valid',
		formKey: 'isValid' as keyof FinanceManagerData,
	},
];

const dictInfoMap = dictFieldConfig.reduce(
	(acc, config) => {
		acc[config.key] = ref<Info>({
			label: config.key,
			labelName: config.labelName,
			rule: config.rule,
			customFieldName: {
				text: 'typeName',
				value: 'typeCode',
			},
			selectValue: formInfo.value[config.formKey],
		});
		return acc;
	},
	{} as Record<string, Ref<Info>>,
);

const belongToInfo = ref<Info>({
	label: 'belongTo',
	labelName: '属于',
	rule: rulesRef.belongTo,
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	selectValue: formInfo.value.belongTo,
});

const nameRefMap = {
	fromSource: ref<string>('微信'),
	incomeAndExpenses: ref<string>('支出'),
	isValid: ref<string>('有效'),
	belongTo: ref<string>(''),
	infoDate: ref<string>(''),
};

const choose = (type: string) => {
	const info = dictInfoMap[type] || (type === 'belongTo' ? belongToInfo : null);
	if (info) {
		popInfo.value = info.value;
		popInfo.value.showFlag = true;
	}
};

const selectInfo = (type: string, value: string, name: string) => {
	popInfo.value.showFlag = false;
	const info = dictInfoMap[type];
	if (info) {
		const config = dictFieldConfig.find((c) => c.key === type);
		if (config) {
			formInfo.value[config.formKey] = value as never;
			nameRefMap[config.key as keyof typeof nameRefMap].value = name;
		}
	} else if (type === 'belongTo') {
		formInfo.value.belongTo = Number(value);
		nameRefMap.belongTo.value = name;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '业务日期',
	rule: rulesRef.infoDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (date: Dayjs, dateName: string) => {
	const now = dayjs();
	const selected = dayjs(date).hour(now.hour()).minute(now.minute()).second(now.second());
	formInfo.value.infoDate = selected;
	nameRefMap.infoDate.value = dateName;
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 交互操作
const switchDirection = (dir: 'expense' | 'income') => {
	if (formInfo.value.incomeAndExpenses === dir) return;
	navigator.vibrate?.(10);
	formInfo.value.incomeAndExpenses = dir;
	nameRefMap.incomeAndExpenses.value = dir === 'income' ? '收入' : '支出';
	const currentList = dir === 'income' ? incomePresets : expensePresets;
	const match = currentList.find((c) => c.name === formInfo.value.typeCode);
	if (!match) {
		formInfo.value.typeCode = currentList[0]?.name || '';
		if (!formInfo.value.name || formInfo.value.name.trim() === '') {
			formInfo.value.name = formInfo.value.typeCode;
		}
	}
};

const selectCategory = (cat: CategoryItem) => {
	navigator.vibrate?.(10);
	formInfo.value.typeCode = cat.name;
	if (!formInfo.value.name || formInfo.value.name.trim() === '') {
		formInfo.value.name = cat.name;
	}
};

const openCustomCategoryDialog = () => {
	customCatInput.value = '';
	showCustomCatDialog.value = true;
};

const confirmCustomCategory = () => {
	const name = customCatInput.value.trim();
	if (name) {
		if (!dynamicCategories.value.includes(name)) {
			dynamicCategories.value.unshift(name);
		}
		selectCategory({
			name,
			icon: 'apps-o',
			color: '#1677ff',
			bgColor: '#eff6ff',
		});
	}
};

const scrollToCategories = () => {
	scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const pressKey = (key: string) => {
	navigator.vibrate?.(10);
	if (key === 'backspace') {
		if (amountStr.value.length > 0) {
			amountStr.value = amountStr.value.slice(0, -1);
		}
		formInfo.value.amount = Number(amountStr.value) || 0;
		return;
	}

	if (key === '.') {
		if (amountStr.value.includes('.')) return;
		if (!amountStr.value) {
			amountStr.value = '0.';
		} else {
			amountStr.value += '.';
		}
		formInfo.value.amount = Number(amountStr.value) || 0;
		return;
	}

	if (key === '00') {
		if (!amountStr.value || amountStr.value === '0') {
			amountStr.value = '0';
			formInfo.value.amount = 0;
			return;
		}
		if (amountStr.value.includes('.')) {
			const decimalPart = amountStr.value.split('.')[1] || '';
			if (decimalPart.length >= 2) return;
			if (decimalPart.length === 1) {
				amountStr.value += '0';
			} else {
				amountStr.value += '00';
			}
		} else {
			if (Number(`${amountStr.value}00`) > 9999999.99) return;
			amountStr.value += '00';
		}
		formInfo.value.amount = Number(amountStr.value) || 0;
		return;
	}

	// 数字按键 0-9
	if (!amountStr.value || amountStr.value === '0') {
		if (key === '0') {
			amountStr.value = '0';
		} else {
			amountStr.value = key;
		}
	} else {
		if (amountStr.value.includes('.')) {
			const decimalPart = amountStr.value.split('.')[1] || '';
			if (decimalPart.length >= 2) return;
		}
		if (Number(amountStr.value + key) > 9999999.99) return;
		amountStr.value += key;
	}
	formInfo.value.amount = Number(amountStr.value) || 0;
};

const resetFormToInitial = () => {
	amountStr.value = '';
	formInfo.value.amount = 0;
};

const validateAndPrepareSubmit = (): boolean => {
	if (!formInfo.value.typeCode) {
		showFailToast('请点选一个记账分类！');
		return false;
	}
	const amt = Number(amountStr.value);
	if (!amt || amt <= 0) {
		showFailToast('请输入有效的账单金额！');
		return false;
	}
	formInfo.value.amount = amt;
	if (!formInfo.value.name || !formInfo.value.name.trim()) {
		formInfo.value.name = formInfo.value.typeCode;
	}
	return true;
};

const handleSaveAndContinue = async () => {
	if (!validateAndPrepareSubmit()) return;
	loading.value = true;
	try {
		const { code, message } = await addFinanceManger(formInfo.value);
		if (code === '200') {
			showSuccessToast('已保存，请记下一笔');
			navigator.vibrate?.(20);
			dashboardStore.updateSaveTime('财务信息');
			amountStr.value = '';
			formInfo.value.amount = 0;
			formInfo.value.name = '';
		} else {
			showFailToast(message || '保存失败，请稍后重试');
		}
	} catch (e: unknown) {
		showFailToast((e as Error)?.message || '网络异常，保存失败');
	} finally {
		loading.value = false;
	}
};

const handleSaveAndFinish = async () => {
	if (!validateAndPrepareSubmit()) return;
	loading.value = true;
	try {
		let api = addFinanceManger;
		if (formInfo.value.id) {
			api = editFinanceManger;
		}
		const { code, message } = await api(formInfo.value);
		if (code === '200') {
			showSuccessToast(message || '保存成功!');
			navigator.vibrate?.(50);
			dashboardStore.updateSaveTime('财务信息');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} catch (e: unknown) {
		showFailToast((e as Error)?.message || '网络异常，保存失败');
	} finally {
		loading.value = false;
	}
};

const getDictInfoList = async (data: DictInfo[]) => {
	dictFieldConfig.forEach((config) => {
		const info = dictInfoMap[config.key];
		if (info) {
			info.value.list = data.filter((item: DictInfo) => item.belongTo === config.belongTo);
			nameRefMap[config.key as keyof typeof nameRefMap].value = getListName<DictInfo>(
				info.value.list || [],
				formInfo.value[config.formKey] as string,
				'typeCode',
				'typeName',
			);
		}
	});
};

const getUserInfoList = async (data: UserManagerData[]) => {
	belongToInfo.value.list = data;
	nameRefMap.belongTo.value = getListName<UserManagerData>(data, formInfo.value.belongTo, 'id', 'nickName');
};

const initInfoDate = (infoDate: Dayjs) => {
	if (infoDate) {
		nameRefMap.infoDate.value = infoDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = infoDate;
	}
};

const init = async () => {
	const id: string = route?.query?.id as string;
	const currentMonth = dayjs().format('YYYY-MM');

	const [detailRes, userRes, dictRes, catRes] = await Promise.all([
		id ? getFinanceMangerDetail(id) : Promise.resolve({ code: '200', data: {} as FinanceManagerData }),
		getUserManagerList({}),
		getDictList('pay_way,income_expense_type,is_valid'),
		getBudgetCategories(currentMonth),
	]);

	// 动态类别
	if (catRes.code === '200' && Array.isArray(catRes.data)) {
		dynamicCategories.value = catRes.data.filter(
			(c) => c && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income' && c !== '转账',
		);
	}

	if (id && detailRes.code === '200' && detailRes.data) {
		formInfo.value = { ...detailRes.data };
		formInfo.value.infoDate = dayjs(detailRes.data.infoDate);
		if (detailRes.data.amount) {
			amountStr.value = String(detailRes.data.amount);
		}
	} else {
		// 新增默认值
		formInfo.value = {
			isValid: '1',
			incomeAndExpenses: 'expense',
			infoDate: dayjs(),
			belongTo: userInfo?.id !== undefined ? Number(userInfo.id) : 0,
			fromSource: 'wx',
			typeCode: '餐饮',
			name: '餐饮',
		};
	}

	getUserInfoList(userRes?.data || []);
	getDictInfoList(dictRes?.data || []);
	initInfoDate((formInfo.value?.infoDate as Dayjs) || dayjs());

	// 确保支付方式与收支状态显示名称对齐
	if (!nameRefMap.fromSource.value) {
		nameRefMap.fromSource.value = '微信';
	}
	if (!nameRefMap.incomeAndExpenses.value) {
		nameRefMap.incomeAndExpenses.value = formInfo.value.incomeAndExpenses === 'income' ? '收入' : '支出';
	}
};

init();
</script>

<style lang="less" scoped>
.finance-detail-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
	background-color: #f8fafc;
	box-sizing: border-box;
}

// 1. 顶部收支切换
.segment-wrapper {
	flex-shrink: 0;
	padding: 8px 16px 4px;
	display: flex;
	justify-content: center;
	background-color: #f8fafc;

	.segment-bar {
		display: flex;
		background: #e2e8f0;
		padding: 3px;
		border-radius: 20px;
		width: 190px;

		.segment-tab {
			flex: 1;
			border: none;
			background: transparent;
			padding: 5px 0;
			border-radius: 17px;
			font-size: 14px;
			font-weight: 500;
			color: #64748b;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			cursor: pointer;
			transition: all 0.2s ease;

			.tab-dot {
				width: 6px;
				height: 6px;
				border-radius: 50%;

				&.dot-expense {
					background-color: #ef4444;
				}

				&.dot-income {
					background-color: #10b981;
				}
			}

			&.active {
				background: #ffffff;
				color: #0f172a;
				font-weight: 600;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			}
		}
	}
}

// 2. 金额看板
.amount-hero-card {
	flex-shrink: 0;
	margin: 6px 16px 8px;
	padding: 12px 16px 10px;
	border-radius: 16px;
	background: #ffffff;
	border: 1px solid #f1f5f9;
	box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	transition: background-color 0.3s ease;

	&.mode-expense {
		border-color: #fee2e2;
		background: linear-gradient(180deg, #fffafa 0%, #ffffff 100%);
	}

	&.mode-income {
		border-color: #dcfce7;
		background: linear-gradient(180deg, #f7fee7 0%, #ffffff 100%);
	}

	.amount-digits-line {
		display: flex;
		align-items: baseline;
		justify-content: center;
		height: 48px;
		line-height: 48px;

		.currency-prefix {
			font-size: 24px;
			font-weight: 700;
			color: #0f172a;
			margin-right: 4px;
		}

		.amount-val {
			font-size: 38px;
			font-weight: 700;
			font-variant-numeric: tabular-nums;
			color: #0f172a;
			letter-spacing: -0.5px;

			&.is-zero {
				color: #94a3b8;
			}
		}

		.cursor-caret {
			display: inline-block;
			width: 2px;
			height: 30px;
			background-color: #3b82f6;
			margin-left: 3px;
			animation: caret-blink 1s infinite;
		}
	}

	.quick-meta-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-top: 8px;
		flex-wrap: wrap;

		.meta-pill {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 3px 8px;
			border-radius: 12px;
			background: #f1f5f9;
			font-size: 12px;
			color: #475569;
			cursor: pointer;
			max-width: 90px;

			.pill-icon {
				font-size: 13px;
				color: #64748b;
			}

			.pill-text {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			&:active {
				background: #e2e8f0;
			}

			&.category-pill {
				background: #eff6ff;
				color: #2563eb;
				font-weight: 500;

				.pill-icon {
					color: #2563eb;
				}
			}
		}
	}

	.inline-name-box {
		margin-top: 8px;
		padding-top: 6px;
		border-top: 1px dashed #e2e8f0;

		.custom-inline-field {
			padding: 4px 8px;
			background: #f8fafc;
			border-radius: 8px;
		}
	}
}

// 3. 中间可滚动区域
.scroll-body-wrapper {
	flex: 1;
	overflow-y: auto;
	padding: 0 16px 12px;
	-webkit-overflow-scrolling: touch;

	.category-grid-card {
		background: #ffffff;
		border-radius: 16px;
		padding: 12px 12px 14px;
		border: 1px solid #f1f5f9;
		box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

		.card-header-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 10px;
			padding: 0 4px;

			.header-title {
				font-size: 13px;
				font-weight: 600;
				color: #334155;
			}

			.header-hint {
				font-size: 11px;
				color: #3b82f6;
			}
		}

		.category-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px 6px;

			.category-cell {
				display: flex;
				flex-direction: column;
				align-items: center;
				cursor: pointer;
				transition: transform 0.15s ease;

				&:active {
					transform: scale(0.92);
				}

				.cat-icon-bubble {
					width: 44px;
					height: 44px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 4px;
					transition: all 0.2s ease;

					.cat-icon {
						font-size: 22px;
					}
				}

				.cat-label {
					font-size: 12px;
					color: #475569;
					line-height: 1.2;
					text-align: center;
					max-width: 60px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				&.active {
					.cat-icon-bubble {
						transform: scale(1.08);
						box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
					}

					.cat-label {
						color: #0f172a;
						font-weight: 600;
					}
				}

				&.custom-cell {
					.custom-bubble {
						background: #f1f5f9;
						color: #94a3b8;
						border: 1px dashed #cbd5e1;
					}
				}
			}
		}
	}

	.advanced-card {
		margin-top: 10px;
		background: #ffffff;
		border-radius: 12px;
		border: 1px solid #f1f5f9;
		overflow: hidden;

		.advanced-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 14px;
			cursor: pointer;
			background: #fafafa;

			.adv-left {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 12px;
				color: #64748b;
				font-weight: 500;

				.adv-icon {
					font-size: 14px;
				}
			}

			.arrow-icon {
				font-size: 12px;
				color: #94a3b8;
			}
		}

		.advanced-body {
			padding: 6px 0;
		}
	}
}

// 4. 底部定制记账数字键盘
.keypad-panel {
	flex-shrink: 0;
	background: #ffffff;
	border-top: 1px solid #e2e8f0;
	padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
	box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);

	.keypad-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-auto-rows: 48px;
		gap: 6px;

		.kp-btn {
			border: none;
			border-radius: 10px;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			font-size: 20px;
			font-weight: 600;
			color: #1e293b;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			user-select: none;
			transition: background-color 0.1s ease;

			&.num-btn {
				background: #f8fafc;

				&:active {
					background: #e2e8f0;
				}
			}

			&.func-btn {
				&.delete-btn {
					background: #f1f5f9;
					color: #64748b;
					font-size: 20px;

					&:active {
						background: #e2e8f0;
					}
				}

				&.date-shortcut-btn {
					background: #f1f5f9;
					color: #2563eb;
					font-size: 13px;
					font-weight: 500;

					&:active {
						background: #e2e8f0;
					}
				}

				&.continue-btn {
					background: #eff6ff;
					color: #2563eb;
					font-size: 13px;
					font-weight: 600;

					&:active {
						background: #dbeafe;
					}
				}

				&.reset-btn {
					background: #f1f5f9;
					color: #64748b;
					font-size: 13px;

					&:active {
						background: #e2e8f0;
					}
				}

				&.submit-btn {
					background: #2563eb;
					color: #ffffff;
					font-size: 15px;
					font-weight: 600;

					&:active {
						background: #1d4ed8;
					}

					&:disabled {
						opacity: 0.7;
					}
				}
			}
		}
	}
}

.custom-cat-dialog-box {
	padding: 12px 16px;
}

@keyframes caret-blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}
</style>
