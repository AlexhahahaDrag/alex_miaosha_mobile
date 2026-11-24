<template>
	<div class="finance-detail-container">
		<!-- 只读权限拦截提示条 -->
		<div
			v-if="formInfo.id && !canEditRecord"
			class="detail-readonly-banner"
		>
			<van-icon
				name="info-o"
				class="banner-icon"
			/>
			<span>此账单由家庭成员记入，仅创建人与家庭管理员可修改</span>
		</div>

		<!-- 主体可滚动区（为置底 Sticky 操作栏留出安全内边距） -->
		<div class="page-content-scroll">
			<!-- 1. 顶部核心聚焦区 (Hero Card) -->
			<div class="hero-card">
				<!-- 顶部行：分段控制器 (支出 | 收入) + AI 智能填单微胶囊 -->
				<div class="hero-top-row">
					<div class="segmented-control">
						<button
							type="button"
							:class="['segment-item', 'segment-expense', { active: formInfo.incomeAndExpenses === 'expense' }]"
							@click="canEditRecord && onDirectionChange('expense')"
						>
							支出
						</button>
						<button
							type="button"
							:class="['segment-item', 'segment-income', { active: formInfo.incomeAndExpenses === 'income' }]"
							@click="canEditRecord && onDirectionChange('income')"
						>
							收入
						</button>
					</div>

					<button
						v-if="canEditRecord"
						type="button"
						class="ai-capsule-btn"
						data-testid="mobile-btn-open-ai-sheet"
						@click="onOpenAiSheet"
					>
						<van-icon
							name="edit"
							class="ai-icon"
						/>
						<span>AI 填单</span>
					</button>
				</div>

				<!-- 大号等宽金融金额直输 -->
				<div class="amount-hero-box">
					<span :class="['currency-symbol', formInfo.incomeAndExpenses === 'income' ? 'income-symbol' : 'expense-symbol']">
						¥
					</span>
					<input
						v-model="formInfo.amount"
						type="number"
						step="0.01"
						placeholder="0.00"
						:readonly="!canEditRecord"
						class="amount-input-control"
					/>
				</div>

				<!-- 行内无边框轻量备注 / 账单名称 -->
				<div class="remark-input-box">
					<input
						v-model="formInfo.name"
						type="text"
						placeholder="输入账单名称或备注 (选填)..."
						:readonly="!canEditRecord"
						class="remark-input-control"
					/>
				</div>
			</div>

			<!-- 2. 点选详情 Inset List 卡片 (Card 2) -->
			<div class="detail-inset-card">
				<!-- 2.1 类别 4 列等宽网格（前 7 个常用/最近分类 + 最后一个自定义直输胶囊，合计两行 8 个） -->
				<div class="inset-section">
					<div class="section-label-bar">
						<span class="section-label">类别</span>
					</div>
					<div class="category-pills-wrap">
						<button
							v-for="cat in currentPresetCategories"
							:key="cat.name"
							type="button"
							:class="['pill-btn', { active: formInfo.typeCode === cat.name }]"
							@click="canEditRecord && selectCategory(cat.name)"
						>
							<span class="pill-text">{{ cat.name }}</span>
						</button>

						<!-- 最后一个位置：自定义直输胶囊（直接点击输入，免去弹窗打断） -->
						<div
							v-if="canEditRecord"
							:class="['pill-btn', 'pill-custom-input-wrap', { active: isCustomCategoryActive }]"
							@click="focusCustomInput"
						>
							<input
								ref="customInputRef"
								v-model="customInputText"
								type="text"
								maxlength="10"
								placeholder="+ 自定义"
								class="pill-custom-input"
								@focus="onCustomFocus"
								@input="onCustomInput"
								@blur="onCustomBlur"
								@keydown.enter.prevent="onCustomEnter"
							/>
						</div>
					</div>
				</div>

				<!-- 2.2 支付方式横向紧凑胶囊 -->
				<div class="inset-section">
					<div class="section-label-bar">
						<span class="section-label">支付方式</span>
					</div>
					<div class="payment-pills-row">
						<button
							type="button"
							:class="['pay-pill-btn', 'pay-wx', { active: formInfo.fromSource === 'wx' }]"
							@click="canEditRecord && selectPayment('wx', '微信')"
						>
							<van-icon
								name="wechat-pay"
								class="pay-icon icon-wx"
							/>
							<span>微信</span>
						</button>
						<button
							type="button"
							:class="['pay-pill-btn', 'pay-zfb', { active: formInfo.fromSource === 'zfb' }]"
							@click="canEditRecord && selectPayment('zfb', '支付宝')"
						>
							<van-icon
								name="alipay"
								class="pay-icon icon-zfb"
							/>
							<span>支付宝</span>
						</button>
						<button
							type="button"
							:class="['pay-pill-btn', 'pay-yhk', { active: formInfo.fromSource === 'yhk' }]"
							@click="canEditRecord && selectPayment('yhk', '银行卡')"
						>
							<van-icon
								name="card"
								class="pay-icon icon-yhk"
							/>
							<span>银行卡</span>
						</button>
						<button
							type="button"
							:class="['pay-pill-btn', 'pay-other', { active: isOtherPayment }]"
							@click="canEditRecord && choose('fromSource')"
						>
							<span class="pay-other-text">{{ isOtherPayment ? nameRefMap.fromSource.value || '其他' : '其他' }}</span>
							<van-icon
								name="arrow-down"
								class="arrow-tiny"
							/>
						</button>
					</div>
				</div>

				<!-- 2.3 紧凑列表行 1：交易时间 (今天/昨天 快捷小胶囊 + 点击呼出完整日历) -->
				<div class="inset-row">
					<span class="row-label">交易时间</span>
					<div class="row-value-group">
						<div class="quick-date-pills">
							<button
								type="button"
								:class="['quick-pill-btn', { active: isTodayDate }]"
								@click.stop="canEditRecord && setQuickDate('today')"
							>
								今天
							</button>
							<button
								type="button"
								:class="['quick-pill-btn', { active: isYesterdayDate }]"
								@click.stop="canEditRecord && setQuickDate('yesterday')"
							>
								昨天
							</button>
						</div>
						<div
							class="date-display-trigger"
							@click="canEditRecord && chooseDate()"
						>
							<span class="date-text">{{ nameRefMap.infoDate.value }}</span>
							<van-icon
								name="arrow"
								class="row-arrow"
							/>
						</div>
					</div>
				</div>

				<!-- 2.4 紧凑列表行 2：账单归属 (独立拆分，双人直选胶囊 + 超过2人提供 '更多') -->
				<div class="inset-row">
					<span class="row-label">账单归属</span>
					<div class="row-value-group">
						<div class="user-pills-group">
							<button
								v-for="user in primaryUsers"
								:key="user.id"
								type="button"
								:class="['user-pill-btn', { active: isSelectedUser(user.id) }]"
								@click="canEditRecord && selectBelongTo(user)"
							>
								<van-icon
									name="user-o"
									class="user-pill-icon"
								/>
								<span>{{ user.nickName || user.username }}</span>
							</button>

							<!-- 机构成员超过 2 人时：提供下拉选择全员胶囊 -->
							<button
								v-if="(hasMoreUsers || isOtherUserSelected) && canEditRecord"
								type="button"
								:class="['user-pill-btn', 'user-dropdown-pill', { active: isOtherUserSelected }]"
								title="下拉选择全部成员"
								@click="choose('belongTo')"
							>
								<van-icon
									name="user-o"
									class="user-pill-icon"
								/>
								<span>{{ otherUserLabel }}</span>
								<van-icon
									name="arrow-down"
									class="dropdown-arrow-icon"
								/>
							</button>
						</div>
					</div>
				</div>

				<!-- 2.5 紧凑列表行 3：记录状态 (默认有效，支持新增与编辑切换) -->
				<div class="inset-row">
					<span class="row-label">记录状态</span>
					<div class="row-value-group">
						<div class="mini-segmented-control">
							<button
								type="button"
								:class="['mini-segment-item', { active: formInfo.isValid === '1' }]"
								@click="canEditRecord && setRecordStatus('1')"
							>
								<span class="status-dot dot-valid"></span>
								<span>有效</span>
							</button>
							<button
								type="button"
								:class="['mini-segment-item', { active: formInfo.isValid === '0' }]"
								@click="canEditRecord && setRecordStatus('0')"
							>
								<span>无效</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 3. 底部操作栏 -->
			<div
				v-if="canEditRecord"
				class="bottom-action-panel"
			>
				<div class="bottom-action-row">
					<button
						v-if="!isEditMode"
						type="button"
						class="btn-secondary"
						:disabled="loading || continueLoading"
						@click="handleContinueSubmit"
					>
						<van-loading
							v-if="continueLoading"
							size="16px"
						/>
						<template v-else>
							<van-icon
								name="plus"
								class="btn-icon"
							/>
							<span>确认再记一笔</span>
						</template>
					</button>
					<button
						type="button"
						class="btn-primary"
						:disabled="loading || continueLoading"
						@click="() => onSubmit()"
					>
						<van-loading
							v-if="loading"
							size="16px"
							color="#ffffff"
						/>
						<template v-else>
							<span>提交记录</span>
						</template>
					</button>
				</div>
			</div>
		</div>

		<!-- AI 智能记账半屏抽屉（页内解析直接回填当前表单） -->
		<finance-ai-sheet
			v-model:show="showAiSheet"
			:belong-to="formInfo.belongTo"
			@apply="onApplyAiParseResult"
		/>

		<!-- 弹窗选择组件 -->
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
	</div>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { getListName, type DictFieldConfig } from '@/views/common/config';
import {
	rulesRef,
	type FinanceManagerData,
	type UniversalFinanceAiParseVo,
} from '@/views/selfFinance/financeManager/config';
import {
	expensePresets,
	incomePresets,
	getCategoryVisualItem,
	type CategoryItem,
} from '@/views/selfFinance/financeManager/financeManagerDetail/types';
import FinanceAiSheet from '@/views/selfFinance/financeManager/components/FinanceAiSheet.vue';
import { getDictList } from '@/views/finance/dict/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import { useUserStore } from '@/store/modules/user/user';
import type { Info } from '@/components/pop/selectPop.vue';
import { datePickerFormatter, formatDayjs, nowDayjs, formatMonth } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/views/finance/dict/api';
import type { UserManagerData } from '@/views/user/userManager/config';
import {
	addFinanceManger,
	editFinanceManger,
	getFinanceMangerDetail,
	getBudgetCategories,
} from '@/views/selfFinance/financeManager/api';
import {
	loadRecentCategories,
	saveRecentCategory,
	recordCategoryUsage,
} from '@/views/selfFinance/financeManager/financeManagerDetail/composables/useCategoryFrequency';
import { useNavBar, type NavBarConfig } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';
import { useTabBar } from '@/composables/useTabBar';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';
import { usePermission } from '@/composables/usePermission';
import { triggerHaptic } from '@/utils/haptics';

const route = useRoute();
const router = useRouter();
const userInfo = useUserStore()?.getUserInfo;
const dashboardStore = useDashboardStore();
const { hasRole, hasPermission } = usePermission();

// 导航栏响应式配置规范
const navBarConfig = ref<Pick<NavBarConfig, 'title' | 'rightButton' | 'leftPath' | 'visible'>>({
	title: route?.query?.id ? '编辑账单' : '记一笔',
	leftPath: getRoutePathByName(router, 'financeManager'),
	visible: true,
});
useNavBar(navBarConfig);

// 隐藏底部 TabBar
useTabBar({ visible: false });

const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'financeManager');
});

// 表单核心数据模型
const formInfo = ref<FinanceManagerData>({
	name: '',
	typeCode: '餐饮',
	amount: undefined,
	isValid: '1',
	incomeAndExpenses: 'expense',
	infoDate: nowDayjs(),
	belongTo: userInfo?.id ? (userInfo.id as never) : (0 as never),
	fromSource: 'wx',
});

const loading = ref<boolean>(false);
const continueLoading = ref<boolean>(false);
const showAiSheet = ref<boolean>(false);

const isEditMode = computed(() => Boolean(route?.query?.id || formInfo.value.id));

// 只读权限判断（家庭账单防护）
const canEditRecord = computed(() => {
	if (!formInfo.value.id) return true;
	const currentUserId = String(userInfo?.id || '');
	const isOwner = String(formInfo.value.belongTo || '') === currentUserId;
	const isHouseholdAdmin = hasRole('admin') || hasRole('super') || hasPermission('finance:record:admin');
	return isOwner || isHouseholdAdmin;
});

// 字段文本显示映射
const nameRefMap = {
	fromSource: ref<string>('微信'),
	incomeAndExpenses: ref<string>('支出'),
	isValid: ref<string>('有效'),
	belongTo: ref<string>(userInfo?.nickName || userInfo?.username || ''),
	infoDate: ref<string>(nowDayjs().format('YYYY年MM月DD日')),
};

// 预设与动态分类整合（默认取前 7 个分类 + 第 8 个自定义直输胶囊，组成两行 4 列共 8 格）
const MAX_PRESET_CATEGORIES = 7;
const recentCategories = ref<string[]>([]);
const customInputText = ref<string>('');
const customInputRef = ref<HTMLInputElement>();

const defaultExpensePresets = ['餐饮', '交通', '购物', '日用', '娱乐', '医疗', '住房'];
const defaultIncomePresets = ['工资', '兼职', '理财', '礼金', '退款', '奖金', '投资'];

const currentPresetCategories = computed<CategoryItem[]>(() => {
	const isIncome = formInfo.value.incomeAndExpenses === 'income';
	const defaultPool = isIncome ? defaultIncomePresets : defaultExpensePresets;
	const trimmedCustom = customInputText.value.trim();

	// 1. 优先取最近添加的至多 7 个分类（过滤空值、'其它'、当前自定义输入词及非当前收支预设）
	const recents = recentCategories.value
		.filter(
			(c) =>
				Boolean(c) &&
				c !== '其它' &&
				c !== trimmedCustom &&
				(isIncome ? !defaultExpensePresets.includes(c) : !defaultIncomePresets.includes(c)),
		)
		.slice(0, MAX_PRESET_CATEGORIES);

	// 2. 补齐预设分类，严格限制最多 7 个分类（最后一个位置固定留给“+ 自定义”）
	const resultNames: string[] = [...recents];
	for (const name of defaultPool) {
		if (resultNames.length >= MAX_PRESET_CATEGORIES) break;
		if (name !== trimmedCustom && !resultNames.includes(name)) {
			resultNames.push(name);
		}
	}

	// 3. 若当前选中分类不在前 7 个且非自定义框文本，替换末尾项并前置展示，确保总数恒为 7 个
	if (
		formInfo.value.typeCode &&
		formInfo.value.typeCode !== trimmedCustom &&
		!resultNames.includes(formInfo.value.typeCode)
	) {
		if (resultNames.length >= MAX_PRESET_CATEGORIES) {
			resultNames.pop();
		}
		resultNames.unshift(formInfo.value.typeCode);
	}

	return resultNames.slice(0, MAX_PRESET_CATEGORIES).map((name) => getCategoryVisualItem(name, isIncome));
});

// 判断最后一个自定义输入框是否处于激活高亮态
const isCustomCategoryActive = computed(() => {
	if (!formInfo.value.typeCode) return false;
	const trimmed = customInputText.value.trim();
	if (trimmed && formInfo.value.typeCode === trimmed) return true;
	return !currentPresetCategories.value.some((c) => c.name === formInfo.value.typeCode);
});

// 选择记账分类（支持名称联动与免填回退）
const selectCategory = (name: string) => {
	triggerHaptic('click');
	const prevCategory = formInfo.value.typeCode;
	formInfo.value.typeCode = name;
	if (!formInfo.value.name || formInfo.value.name === prevCategory) {
		formInfo.value.name = name;
	}
};

// 第 8 个（最后一个）自定义直输胶囊交互
const focusCustomInput = () => {
	customInputRef.value?.focus();
};

const onCustomFocus = () => {
	triggerHaptic('click');
	const trimmed = customInputText.value.trim();
	if (trimmed) {
		selectCategory(trimmed);
	}
};

const onCustomInput = () => {
	const trimmed = customInputText.value.trim();
	if (trimmed) {
		selectCategory(trimmed);
	}
};

const onCustomBlur = () => {
	const trimmed = customInputText.value.trim();
	if (trimmed) {
		saveRecentCategory(trimmed);
		recordCategoryUsage(trimmed);
	}
};

const onCustomEnter = () => {
	const trimmed = customInputText.value.trim();
	if (trimmed) {
		saveRecentCategory(trimmed);
		recordCategoryUsage(trimmed);
		customInputRef.value?.blur();
	}
};

// 选择支付方式
const selectPayment = (code: string, name: string) => {
	triggerHaptic('click');
	formInfo.value.fromSource = code;
	nameRefMap.fromSource.value = name;
};

// 是否属于“其他”支付渠道
const isOtherPayment = computed(() => {
	return !['wx', 'zfb', 'yhk'].includes(formInfo.value.fromSource || '');
});

// 是否是当天
const isTodayDate = computed(() => {
	if (!formInfo.value.infoDate) return true;
	return formatDayjs(formInfo.value.infoDate).isSame(nowDayjs(), 'day');
});

// 是否是昨天
const isYesterdayDate = computed(() => {
	if (!formInfo.value.infoDate) return false;
	return formatDayjs(formInfo.value.infoDate).isSame(nowDayjs().subtract(1, 'day'), 'day');
});

// 快捷切换日期 (今天 / 昨天)
const setQuickDate = (target: 'today' | 'yesterday') => {
	triggerHaptic('click');
	const now = nowDayjs();
	const targetDay = target === 'today' ? now : now.subtract(1, 'day');
	formInfo.value.infoDate = targetDay;
	nameRefMap.infoDate.value = targetDay.format('YYYY年MM月DD日');
	chooseDateInfo.value.selectValue = targetDay;
};

// 状态直切 (有效 / 无效)
const setRecordStatus = (status: '1' | '0') => {
	triggerHaptic('click');
	formInfo.value.isValid = status;
	nameRefMap.isValid.value = status === '1' ? '有效' : '无效';
};

// 切换收支方向
const onDirectionChange = (dir: 'expense' | 'income') => {
	triggerHaptic('click');
	formInfo.value.incomeAndExpenses = dir;
	nameRefMap.incomeAndExpenses.value = dir === 'income' ? '收入' : '支出';

	const presets = dir === 'income' ? incomePresets : expensePresets;
	if (!presets.some((p) => p.name === formInfo.value.typeCode)) {
		const defaultName = presets[0]?.name || (dir === 'income' ? '工资' : '餐饮');
		const prevCat = formInfo.value.typeCode;
		customInputText.value = '';
		formInfo.value.typeCode = defaultName;
		if (!formInfo.value.name || formInfo.value.name === prevCat) {
			formInfo.value.name = defaultName;
		}
	}
};

// 字典选择弹窗状态
const popInfo = ref<Info>({ showFlag: false });

// 统一字典字段映射配置
const dictFieldConfig: DictFieldConfig<FinanceManagerData>[] = [
	{
		key: 'fromSource',
		labelName: '支付方式',
		rule: rulesRef.fromSource,
		belongTo: 'pay_way',
		formKey: 'fromSource' as keyof FinanceManagerData,
	},
	{
		key: 'isValid',
		labelName: '状态',
		rule: rulesRef.isValid,
		belongTo: 'is_valid',
		formKey: 'isValid' as keyof FinanceManagerData,
	},
];

// 动态字典 Info 映射
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

// 归属人选择配置
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

// 计算常用双人列表（优先保证当前人在首位）
const primaryUsers = computed<UserManagerData[]>(() => {
	const rawList = belongToInfo.value.list || [];
	if (!rawList.length) {
		const defaultUser: UserManagerData = {
			id: userInfo?.id || '0',
			nickName: userInfo?.nickName || userInfo?.username || '当前用户',
			username: userInfo?.username || '',
		} as UserManagerData;
		return [defaultUser];
	}

	const currentUserId = String(userInfo?.id || '');
	const sorted = [...rawList].sort((a, b) => {
		const aIsCurrent = String(a.id) === currentUserId ? -1 : 0;
		const bIsCurrent = String(b.id) === currentUserId ? -1 : 0;
		return aIsCurrent - bIsCurrent;
	});

	return sorted.slice(0, 2);
});

// 机构成员总数是否多于 2 人
const hasMoreUsers = computed(() => {
	return (belongToInfo.value.list || []).length > 2;
});

// 当前选中的人是否不在前 2 位常用人中
const isOtherUserSelected = computed(() => {
	const currentBelongTo = String(formInfo.value.belongTo || '');
	return !primaryUsers.value.some((u) => String(u.id) === currentBelongTo);
});

// 下拉全员胶囊文案（若选中的是第 3 人及以后，显示该人员姓名；否则显示 '更多'）
const otherUserLabel = computed(() => {
	if (isOtherUserSelected.value && nameRefMap.belongTo.value) {
		return nameRefMap.belongTo.value;
	}
	return '更多';
});

// 判断归属人是否被选中
const isSelectedUser = (userId: string | number | undefined) => {
	return String(formInfo.value.belongTo || '') === String(userId || '');
};

// 单击直选归属人
const selectBelongTo = (user: UserManagerData) => {
	triggerHaptic('click');
	formInfo.value.belongTo = (user.id as never) || (0 as never);
	nameRefMap.belongTo.value = user.nickName || user.username || '';
};

// 触发选择弹窗
const choose = (type: string) => {
	const info = dictInfoMap[type] || (type === 'belongTo' ? belongToInfo : null);
	if (info) {
		if (type === 'belongTo') {
			info.value.selectValue = formInfo.value.belongTo;
		} else {
			const config = dictFieldConfig.find((c) => c.key === type);
			if (config) {
				info.value.selectValue = formInfo.value[config.formKey];
			}
		}
		popInfo.value = info.value;
		popInfo.value.showFlag = true;
	}
};

// 选择器确认回调
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
		formInfo.value.belongTo = (value as never) || (0 as never);
		nameRefMap.belongTo.value = name;
	}
};

// 选择器取消回调
const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

// 日期选择配置
const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '业务日期',
	rule: rulesRef.infoDate,
	selectValue: nowDayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

// 打开日期选择弹窗
const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

// 确认日期选择
const selectDateInfo = (date: Dayjs, dateName: string) => {
	const now = nowDayjs();
	formInfo.value.infoDate = formatDayjs(date).hour(now.hour()).minute(now.minute()).second(now.second());
	nameRefMap.infoDate.value = dateName;
	chooseDateInfo.value.showFlag = false;
};

// 取消日期选择
const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 表单前置校验（自动缺省懒人填充名称）
const validateForm = (): boolean => {
	if (
		formInfo.value.amount === undefined ||
		formInfo.value.amount === null ||
		formInfo.value.amount === ('' as unknown)
	) {
		showFailToast('请输入记账金额！');
		return false;
	}
	const num = Number(formInfo.value.amount);
	if (Number.isNaN(num) || num <= 0) {
		showFailToast('金额必须大于 0！');
		return false;
	}
	if (!formInfo.value.typeCode) {
		showFailToast('请选择记账分类！');
		return false;
	}
	// 懒人记账：未手动填写名称时，自动回退取分类名称
	if (!formInfo.value.name || !formInfo.value.name.trim()) {
		formInfo.value.name = formInfo.value.typeCode;
	}
	return true;
};

// 清理重置表单为新增默认状态（供再记一笔复用）
const resetFormFields = () => {
	customInputText.value = '';
	recentCategories.value = loadRecentCategories();
	formInfo.value = {
		name: '',
		typeCode: '餐饮',
		amount: undefined,
		isValid: '1',
		incomeAndExpenses: 'expense',
		infoDate: nowDayjs(),
		belongTo: userInfo?.id ? (userInfo.id as never) : (0 as never),
		fromSource: 'wx',
	};
	nameRefMap.fromSource.value = '微信';
	nameRefMap.incomeAndExpenses.value = '支出';
	nameRefMap.isValid.value = '有效';
	nameRefMap.belongTo.value =
		getListName<UserManagerData>(belongToInfo.value.list || [], formInfo.value.belongTo, 'id', 'nickName') ||
		userInfo?.nickName ||
		userInfo?.username ||
		'';
	nameRefMap.infoDate.value = nowDayjs().format('YYYY年MM月DD日');
};

// 提交并再记一笔（校验 -> 接口提交 -> 成功提示 -> 重置表单继续记账）
const handleContinueSubmit = async () => {
	triggerHaptic('click');
	if (!validateForm()) return;

	if (formInfo.value.typeCode) {
		recordCategoryUsage(formInfo.value.typeCode);
		saveRecentCategory(formInfo.value.typeCode);
	}

	continueLoading.value = true;
	try {
		let api = addFinanceManger;
		if (formInfo.value.id) {
			api = editFinanceManger;
		}
		const { code, message } = await api(formInfo.value);
		if (code === '200') {
			showSuccessToast(message || '保存成功，请继续记下一笔');
			dashboardStore.updateSaveTime('财务信息');
			triggerHaptic('success');
			resetFormFields();
		} else {
			showFailToast(message || '保存失败，请联系管理员！');
		}
	} catch (error) {
		console.error('确认再记一笔失败:', error);
		showFailToast('保存失败，请重试');
	} finally {
		continueLoading.value = false;
	}
};

// 提交保存表单并返回列表
const onSubmit = async () => {
	triggerHaptic('click');
	if (!validateForm()) return;

	if (formInfo.value.typeCode) {
		recordCategoryUsage(formInfo.value.typeCode);
		saveRecentCategory(formInfo.value.typeCode);
	}

	loading.value = true;
	try {
		let api = addFinanceManger;
		if (formInfo.value.id) {
			api = editFinanceManger;
		}
		const { code, message } = await api(formInfo.value);
		if (code === '200') {
			showSuccessToast(message || '保存成功!');
			dashboardStore.updateSaveTime('财务信息');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '保存失败，请联系管理员！');
		}
	} finally {
		loading.value = false;
	}
};

// 字典列表映射初始化
const getDictInfoList = async (data: DictInfo[]) => {
	dictFieldConfig.forEach((config) => {
		const info = dictInfoMap[config.key];
		if (info) {
			info.value.list = data.filter((item: DictInfo) => item.belongTo === config.belongTo);
			const val = formInfo.value[config.formKey] as string;
			const matchedName = getListName<DictInfo>(info.value.list || [], val, 'typeCode', 'typeName');
			if (matchedName) {
				nameRefMap[config.key as keyof typeof nameRefMap].value = matchedName;
			} else if (config.key === 'isValid') {
				nameRefMap.isValid.value = val === '0' ? '无效' : '有效';
			} else if (config.key === 'fromSource') {
				nameRefMap.fromSource.value = val === 'wx' ? '微信' : val || '';
			}
		}
	});
};

// 归属人列表初始化
const getUserInfoList = async (data: UserManagerData[]) => {
	belongToInfo.value.list = data;
	const matchedName = getListName<UserManagerData>(data, formInfo.value.belongTo, 'id', 'nickName');
	nameRefMap.belongTo.value = matchedName || userInfo?.nickName || userInfo?.username || '';
};

// 初始化日期文本显示
const initInfoDate = (infoDate: Dayjs) => {
	if (infoDate) {
		nameRefMap.infoDate.value = infoDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = infoDate;
	}
};

// 唤起页内 AI 填单抽屉并直接回填表单
const onOpenAiSheet = () => {
	triggerHaptic('click');
	showAiSheet.value = true;
};

const onApplyAiParseResult = (parsed: UniversalFinanceAiParseVo) => {
	if (parsed.incomeAndExpenses === 'income' || parsed.incomeAndExpenses === 'expense') {
		formInfo.value.incomeAndExpenses = parsed.incomeAndExpenses;
		nameRefMap.incomeAndExpenses.value = parsed.incomeAndExpenses === 'income' ? '收入' : '支出';
	}
	if (parsed.amount !== undefined && parsed.amount !== null && Number(parsed.amount) > 0) {
		formInfo.value.amount = Number(parsed.amount);
	}
	const resolvedCategory = parsed.typeCode || parsed.typeName;
	if (resolvedCategory) {
		formInfo.value.typeCode = resolvedCategory;
	}
	const resolvedName = parsed.name || parsed.description;
	if (resolvedName) {
		formInfo.value.name = resolvedName;
	}
	if (parsed.fromSource) {
		formInfo.value.fromSource = parsed.fromSource;
		const fromList = dictInfoMap.fromSource?.value?.list || [];
		const matchedSource = getListName<DictInfo>(fromList, parsed.fromSource, 'typeCode', 'typeName');
		nameRefMap.fromSource.value = matchedSource || parsed.fromSourceName || parsed.fromSource;
	}
	if (parsed.infoDate) {
		const parsedDay = formatDayjs(parsed.infoDate);
		formInfo.value.infoDate = parsedDay;
		initInfoDate(parsedDay);
	}
	if (parsed.belongTo) {
		formInfo.value.belongTo = String(parsed.belongTo) as never;
		const matchedUser = getListName<UserManagerData>(
			belongToInfo.value.list || [],
			formInfo.value.belongTo,
			'id',
			'nickName',
		);
		if (matchedUser) {
			nameRefMap.belongTo.value = matchedUser;
		}
	}
	triggerHaptic('success');
	showSuccessToast('已填入 AI 解析结果');
};

// 页面数据初始化
const init = async () => {
	const id = route?.query?.id as string;
	try {
		const [userRes, dictRes] = await Promise.all([
			getUserManagerList({}),
			getDictList('pay_way,income_expense_type,is_valid'),
		]);

		const { data: userData } = userRes;
		const { data: dictData } = dictRes;

		if (id) {
			const { code, data, message } = await getFinanceMangerDetail(id);
			if (code === '200' && data) {
				formInfo.value = data;
				formInfo.value.infoDate = formatDayjs(formInfo.value.infoDate);
				navBarConfig.value.title = '编辑账单';
			} else {
				showFailToast(message || '查询详情失败，请联系管理员!');
			}
		} else {
			formInfo.value = {
				isValid: '1',
				incomeAndExpenses: 'expense',
				infoDate: nowDayjs(),
				belongTo: userInfo?.id ? (userInfo.id as never) : (0 as never),
				fromSource: 'wx',
				typeCode: '餐饮',
				name: '',
			};
			navBarConfig.value.title = '记一笔';
		}

		// 确保在 formInfo 初始化完毕后执行字典与归属人名称映射
		getUserInfoList(userData || []);
		getDictInfoList(dictData || []);
		initInfoDate((formInfo.value?.infoDate as Dayjs) || nowDayjs());

		// 1. 本地最近分类快速秒开
		recentCategories.value = loadRecentCategories();

		// 2. 异步请求最近分类并合并（优先呈现最近添加的分类）
		try {
			const currentMonth = formatMonth(formInfo.value?.infoDate ? formatDayjs(formInfo.value.infoDate) : nowDayjs());
			const { code: catCode, data: catData } = await getBudgetCategories(currentMonth, formInfo.value?.belongTo);
			if (catCode === '200' && Array.isArray(catData)) {
				const clean = catData.filter(
					(c) => c && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income' && c !== '转账' && c !== '其它',
				);
				recentCategories.value = Array.from(new Set([...recentCategories.value, ...clean]));
			}
		} catch (e) {
			console.warn('获取最近分类失败:', e);
		}

		// 若编辑已有记录且其分类不在前 7 个候选内，回填第 8 个自定义直输框
		if (
			id &&
			formInfo.value?.typeCode &&
			!currentPresetCategories.value.some((c) => c.name === formInfo.value.typeCode)
		) {
			customInputText.value = formInfo.value.typeCode;
		}
	} catch (error) {
		console.error('初始化财务明细失败:', error);
		showFailToast('加载财务数据失败，请重试');
	}
};

onMounted(() => {
	void init();
});
</script>

<style lang="less" scoped>
.finance-detail-container {
	padding: 0;
	min-height: 100%;
	background-color: #f6f8fb;
	position: relative;
	box-sizing: border-box;
}

.detail-readonly-banner {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px;
	background: #fffbeb;
	border-bottom: 1px solid #fef3c7;
	color: #b45309;
	font-size: 12px;
	line-height: 1.4;

	.banner-icon {
		font-size: 15px;
		color: #f59e0b;
		flex-shrink: 0;
	}
}

.page-content-scroll {
	padding: 10px 14px calc(16px + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

// 1. 顶部核心聚焦区 (Hero Card)
.hero-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 12px 16px 10px;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
	margin-bottom: 10px;

	.hero-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;

		.segmented-control {
			background: #f1f5f9;
			padding: 3px;
			border-radius: 10px;
			display: inline-flex;
			gap: 2px;

			.segment-item {
				padding: 4px 14px;
				font-size: 12.5px;
				font-weight: 500;
				color: #64748b;
				border-radius: 8px;
				border: none;
				background: transparent;
				cursor: pointer;
				transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

				&.active {
					background: #ffffff;
					color: #0f172a;
					font-weight: 600;
					box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
				}

				&.segment-expense.active {
					color: #e11d48;
				}

				&.segment-income.active {
					color: #059669;
				}
			}
		}

		.ai-capsule-btn {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 5px 12px;
			background: #eef2ff;
			border: none;
			border-radius: 9999px;
			font-size: 12px;
			font-weight: 600;
			color: #4f6af6;
			cursor: pointer;
			transition: all 0.15s ease;

			.ai-icon {
				font-size: 13px;
			}

			&:active {
				background: #e0e7ff;
				transform: scale(0.97);
			}
		}
	}

	.amount-hero-box {
		display: flex;
		align-items: baseline;
		padding: 2px 0 8px;
		border-bottom: 1px solid #f1f5f9;

		.currency-symbol {
			font-size: 26px;
			font-weight: 600;
			color: #94a3b8;
			margin-right: 6px;
			user-select: none;
			transition: color 0.15s ease;

			&.expense-symbol {
				color: #e11d48;
			}

			&.income-symbol {
				color: #059669;
			}
		}

		.amount-input-control {
			width: 100%;
			border: none;
			outline: none;
			background: transparent;
			font-size: 34px;
			font-weight: 700;
			color: #0f172a;
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-variant-numeric: tabular-nums;
			letter-spacing: -0.02em;

			&::placeholder {
				color: #cbd5e1;
				font-weight: 500;
			}
		}
	}

	.remark-input-box {
		padding-top: 8px;

		.remark-input-control {
			width: 100%;
			border: none;
			outline: none;
			background: transparent;
			font-size: 13.5px;
			color: #334155;
			line-height: 1.5;

			&::placeholder {
				color: #94a3b8;
				font-weight: 400;
			}
		}
	}
}

// 2. 点选详情 Inset List 卡片 (Card 2)
.detail-inset-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 0 16px;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);

	.inset-section {
		padding: 12px 0 10px;
		border-bottom: 1px solid #f1f5f9;

		.section-label-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 8px;

			.section-label {
				font-size: 12px;
				font-weight: 600;
				color: #64748b;
			}
		}

		.category-pills-wrap {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 8px;

			.pill-btn {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				height: 34px;
				padding: 0 6px;
				font-size: 12.5px;
				font-weight: 500;
				border-radius: 10px;
				background: #f8fafc;
				border: 1px solid transparent;
				color: #475569;
				cursor: pointer;
				transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

				.pill-text {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				&:active {
					transform: scale(0.96);
				}

				&.active {
					background: #eef2ff;
					border-color: rgba(79, 106, 246, 0.28);
					color: #4f6af6;
					font-weight: 600;
				}
			}

			.pill-custom-input-wrap {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				height: 34px;
				padding: 0 4px;
				border-radius: 10px;
				background: #f8fafc;
				border: 1px dashed #cbd5e1;
				cursor: text;
				transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
				box-sizing: border-box;

				.pill-custom-input {
					width: 100%;
					height: 100%;
					border: none;
					outline: none;
					background: transparent;
					font-size: 12px;
					font-weight: 500;
					color: #475569;
					text-align: center;
					padding: 0;

					&::placeholder {
						color: #94a3b8;
						font-size: 11.5px;
						font-weight: 400;
					}
				}

				&:focus-within,
				&.active {
					background: #eef2ff;
					border: 1px solid rgba(79, 106, 246, 0.45);

					.pill-custom-input {
						color: #4f6af6;
						font-weight: 600;

						&::placeholder {
							color: rgba(79, 106, 246, 0.5);
						}
					}
				}
			}
		}

		.payment-pills-row {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 8px;

			.pay-pill-btn {
				display: inline-flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				height: 36px;
				padding: 0 6px;
				border-radius: 10px;
				background: #f8fafc;
				border: 1px solid transparent;
				font-size: 12px;
				font-weight: 500;
				color: #475569;
				cursor: pointer;
				transition: all 0.15s ease;
				gap: 4px;
				min-width: 0;

				.pay-icon {
					font-size: 15px;
					flex-shrink: 0;
				}

				.pay-other-text {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.arrow-tiny {
					font-size: 10px;
					flex-shrink: 0;
				}

				&:active {
					transform: scale(0.96);
				}

				&.pay-wx.active {
					background: #ecfdf5;
					border-color: rgba(16, 185, 129, 0.3);
					color: #047857;
					font-weight: 600;

					.icon-wx {
						color: #059669;
					}
				}

				&.pay-zfb.active {
					background: #f0f9ff;
					border-color: rgba(14, 165, 233, 0.3);
					color: #0369a1;
					font-weight: 600;

					.icon-zfb {
						color: #0284c7;
					}
				}

				&.pay-yhk.active {
					background: #eef2ff;
					border-color: rgba(79, 106, 246, 0.3);
					color: #4f6af6;
					font-weight: 600;

					.icon-yhk {
						color: #4f6af6;
					}
				}

				&.pay-other.active {
					background: #eef2ff;
					border-color: rgba(79, 106, 246, 0.3);
					color: #4f6af6;
					font-weight: 600;
				}
			}
		}
	}

	.inset-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 11px 0;
		border-bottom: 1px solid #f1f5f9;

		&:last-child {
			border-bottom: none;
		}

		.row-label {
			font-size: 13px;
			font-weight: 500;
			color: #475569;
		}

		.row-value-group {
			display: flex;
			align-items: center;
			gap: 8px;

			.quick-date-pills {
				display: inline-flex;
				gap: 4px;

				.quick-pill-btn {
					font-size: 11.5px;
					font-weight: 500;
					padding: 2.5px 8px;
					border-radius: 6px;
					background: #f1f5f9;
					border: 1px solid transparent;
					color: #64748b;
					cursor: pointer;
					transition: all 0.15s ease;

					&.active {
						background: #eef2ff;
						color: #4f6af6;
						font-weight: 600;
					}

					&:active {
						transform: scale(0.96);
					}
				}
			}

			.date-display-trigger {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				cursor: pointer;
				padding: 2px 0;

				.date-text {
					font-size: 13px;
					font-weight: 500;
					color: #0f172a;
					font-variant-numeric: tabular-nums;
				}

				.row-arrow {
					font-size: 12px;
					color: #cbd5e1;
				}

				&:active {
					opacity: 0.75;
				}
			}

			.user-pills-group {
				display: inline-flex;
				align-items: center;
				gap: 6px;

				.user-pill-btn {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					font-size: 12px;
					font-weight: 500;
					padding: 4px 12px;
					border-radius: 9999px;
					background: #f1f5f9;
					border: 1px solid transparent;
					color: #475569;
					cursor: pointer;
					transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

					.user-pill-icon {
						font-size: 11px;
					}

					&.active {
						background: #eef2ff;
						border-color: rgba(79, 106, 246, 0.28);
						color: #4f6af6;
						font-weight: 600;
					}

					&:active {
						transform: scale(0.96);
					}
				}

				.user-dropdown-pill {
					display: inline-flex;
					align-items: center;
					gap: 3px;
					font-size: 12px;
					font-weight: 500;
					padding: 4px 10px;
					border-radius: 9999px;
					background: #f1f5f9;
					border: 1px solid #e2e8f0;
					color: #475569;
					cursor: pointer;
					transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

					.dropdown-arrow-icon {
						font-size: 10px;
						color: #94a3b8;
						margin-left: 1px;
					}

					&:active {
						transform: scale(0.96);
					}

					&.active {
						background: #eef2ff;
						border-color: rgba(79, 106, 246, 0.28);
						color: #4f6af6;
						font-weight: 600;

						.dropdown-arrow-icon {
							color: #4f6af6;
						}
					}
				}
			}

			.mini-segmented-control {
				background: #f1f5f9;
				padding: 2.5px;
				border-radius: 8px;
				display: inline-flex;
				align-items: center;
				gap: 2px;

				.mini-segment-item {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					padding: 3px 10px;
					font-size: 12px;
					font-weight: 500;
					color: #94a3b8;
					border-radius: 6px;
					border: none;
					background: transparent;
					cursor: pointer;
					transition: all 0.15s ease;

					.status-dot {
						width: 5px;
						height: 5px;
						border-radius: 50%;

						&.dot-valid {
							background: #10b981;
						}
					}

					&.active {
						background: #ffffff;
						color: #0f172a;
						font-weight: 600;
						box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);

						&:has(.dot-valid) {
							color: #059669;
						}
					}

					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
}

// 3. 底部操作栏
.bottom-action-panel {
	margin-top: 12px;
	padding: 0 2px 4px;

	.bottom-action-row {
		display: flex;
		gap: 10px;

		.btn-secondary {
			flex: 1;
			height: 44px;
			border-radius: 999px;
			background: #ffffff;
			border: 1px solid #e2e8f0;
			color: #334155;
			font-size: 14px;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			cursor: pointer;
			transition: all 0.15s ease;

			.btn-icon {
				font-size: 14px;
				color: #4f6af6;
			}

			&:active {
				background: #f8fafc;
				transform: scale(0.985);
			}

			&:disabled {
				opacity: 0.6;
			}
		}

		.btn-primary {
			flex: 1;
			height: 44px;
			border-radius: 999px;
			background: #4f6af6;
			border: 1px solid #4f6af6;
			color: #ffffff;
			font-size: 14px;
			font-weight: 600;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4px 12px rgba(79, 106, 246, 0.24);
			cursor: pointer;
			transition: all 0.15s ease;

			&:active {
				background: #435be0;
				transform: scale(0.985);
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}
}

.custom-cat-dialog-content {
	padding: 16px;

	:deep(.custom-cat-field) {
		background: #f8fafc;
		border-radius: 10px;
		border: 1px solid #e2e8f0;
		padding: 8px 12px;

		.van-field__control {
			font-size: 14px;
		}
	}
}
</style>
