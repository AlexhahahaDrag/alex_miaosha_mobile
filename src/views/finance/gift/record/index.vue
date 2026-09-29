<template>
	<div class="gift-mobile-page">
		<section class="gift-search">
			<van-search
				v-model="searchInfo.keyword"
				placeholder="搜索人员、事由或备注"
				shape="round"
				background="transparent"
				@search="onSearch"
				@clear="onSearch"
			/>
			<div class="gift-tabs">
				<button
					v-for="option in filterOptions"
					:key="option.value"
					:class="['gift-tabs__item', { active: searchInfo.direction === option.value }]"
					type="button"
					@click="selectDirection(option.value)"
				>
					{{ option.text }}
				</button>
			</div>
		</section>

		<common-pull-refresh
			v-model="refreshing"
			class="gift-refresh"
			@refresh="onRefresh"
		>
			<common-list
				id="gift-record-list"
				v-model="loading"
				:loading="loading"
				:refreshing="refreshing"
				:finished="finished"
				:is-empty="!dataSource.length"
				empty-text="暂无礼金记录"
				@load="onLoadMore"
			>
				<template #skeleton>
					<div
						v-for="i in 4"
						:key="i"
						class="gift-skeleton-card"
					>
						<van-skeleton
							title
							:row="3"
						/>
					</div>
				</template>
				<gift-record-card
					v-for="item in dataSource"
					:key="item.id"
					:item="item"
					@click="showPending"
					@delete="removeRecord"
					@mark-returned="markReturned"
				/>
			</common-list>
		</common-pull-refresh>

		<van-floating-bubble
			icon="plus"
			axis="xy"
			magnetic="x"
			data-testid="gift-record-fab"
			@click="openQuickRecord"
		/>

		<van-popup
			v-model:show="quickRecordVisible"
			position="bottom"
			round
		>
			<div
				class="quick-panel"
				data-testid="gift-record-quick-panel"
			>
				<div class="quick-panel__title">快速记礼</div>

				<!-- AI 自然语言快捷解析面板 -->
				<div
					class="quick-ai-parse-box"
					data-testid="gift-record-quick-ai"
				>
					<van-field
						v-model="aiText"
						rows="1"
						autosize
						type="textarea"
						placeholder="✨ 输入一句话智能记礼，如：收到张三满月红包1000元"
						data-testid="gift-record-ai-input"
						clearable
					>
						<template #button>
							<van-button
								size="small"
								:type="isListening ? 'danger' : 'default'"
								round
								style="margin-right: 6px"
								data-testid="gift-record-ai-speech-btn"
								@click="toggleSpeechInput"
							>
								{{ isListening ? '🔴 识别中' : '🎙️ 语音' }}
							</van-button>
							<van-button
								size="small"
								type="primary"
								round
								:loading="aiParsing"
								data-testid="gift-record-ai-parse-btn"
								@click="handleAiParse"
							>
								智能解析
							</van-button>
						</template>
					</van-field>
				</div>

				<van-form @submit="saveRecord">
					<van-field
						name="direction"
						label="方向"
					>
						<template #input>
							<van-radio-group
								v-model="formInfo.direction"
								direction="horizontal"
								@change="onDirectionChange"
							>
								<van-radio name="GIVE">随礼</van-radio>
								<van-radio name="RECEIVE">收礼</van-radio>
								<van-radio name="RETURN">回礼</van-radio>
							</van-radio-group>
						</template>
					</van-field>
					<div
						class="quick-amounts"
						data-testid="gift-record-quick-amounts"
					>
						<button
							v-for="amount in quickAmounts"
							:key="amount"
							type="button"
							data-testid="gift-record-quick-amount"
							:class="{ active: formInfo.amount === amount }"
							@click="formInfo.amount = amount"
						>
							{{ amount }}
						</button>
					</div>

					<!-- AI 推荐考量与贺词助手 -->
					<div
						v-if="recommendInfo?.aiReasoning || recommendInfo?.aiGreetingTip"
						class="ai-recommend-card"
						data-testid="gift-record-ai-recommend-card"
					>
						<div
							v-if="recommendInfo.aiReasoning"
							class="ai-recommend-row"
						>
							<span class="ai-tag">💡 礼金考量</span>
							<span class="ai-text">{{ recommendInfo.aiReasoning }}</span>
						</div>
						<div
							v-if="recommendInfo.aiGreetingTip"
							class="ai-recommend-row greeting-row"
						>
							<span class="ai-tag">🎉 场景贺词</span>
							<span class="ai-text">{{ recommendInfo.aiGreetingTip }}</span>
							<van-button
								size="mini"
								plain
								type="primary"
								round
								class="copy-btn"
								data-testid="gift-record-copy-greeting"
								@click="copyGreeting(recommendInfo.aiGreetingTip)"
							>
								复制
							</van-button>
						</div>
					</div>
					<van-field
						v-model.number="formInfo.amount"
						name="amount"
						label="金额"
						type="number"
						placeholder="请输入金额"
						:rules="[{ required: true, message: '请输入金额' }]"
					/>
					<van-field
						:model-value="selectedEventName"
						label="事由"
						placeholder="选择关联事由（可不选）"
						readonly
						is-link
						data-testid="gift-record-event-picker"
						@click="openPicker('event')"
					/>
					<van-field
						:model-value="selectedGiverName"
						label="送礼人"
						placeholder="选择送礼人"
						readonly
						is-link
						data-testid="gift-record-giver-picker"
						@click="openPicker('giver')"
					/>
					<van-field
						:model-value="selectedReceiverName"
						label="收礼人"
						placeholder="选择收礼人"
						readonly
						is-link
						data-testid="gift-record-receiver-picker"
						@click="openPicker('receiver')"
					/>
					<van-field
						v-if="formInfo.direction === 'RETURN'"
						:model-value="selectedRelatedName"
						name="relatedRecordId"
						label="原收礼记录"
						placeholder="回礼必须选择原收礼记录"
						readonly
						is-link
						data-testid="gift-record-related-picker"
						:rules="[{ required: true, message: '请选择原收礼记录' }]"
						@click="openPicker('related')"
					/>
					<van-field
						v-model="formInfo.remark"
						label="备注"
						type="textarea"
						rows="2"
						autosize
					/>
					<div class="quick-panel__actions">
						<van-button
							block
							round
							type="primary"
							native-type="submit"
							:loading="saving"
						>保存</van-button>
					</div>
				</van-form>
			</div>
		</van-popup>

		<van-popup
			v-model:show="pickerVisible"
			position="bottom"
			round
		>
			<van-picker
				:title="pickerTitle"
				:columns="pickerColumns"
				data-testid="gift-record-picker"
				@confirm="onPickerConfirm"
				@cancel="pickerVisible = false"
			/>
		</van-popup>
	</div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import GiftRecordCard from '@/views/finance/gift/components/GiftRecordCard.vue';
import {
	addGiftRecord,
	aiParseGiftRecord,
	deleteGiftRecord,
	getGiftRecordPage,
	getGiftRecordRecommendAmount,
	getPendingReturnAmount,
	markGiftReturned,
} from '@/views/finance/gift/record/api';
import { getGiftPersonList } from '@/views/finance/gift/person/api';
import { getGiftEventList } from '@/views/finance/gift/event/api';
import type {
	GiftDirection,
	GiftRecordInfo,
	GiftRecordQuery,
	GiftRecordRecommendAmount,
} from '@/views/finance/gift/config';
import { GIFT_TAB_BAR, directionOptions, formatMoney, quickAmounts } from '@/views/finance/gift/config';
import type { PageInfo } from '@/views/common/config';

useNavBar({
	title: '礼金记录',
	rightButton: '快速记礼',
	visible: true,
	onRightClick: () => openQuickRecord(),
});

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const saving = ref(false);
const quickRecordVisible = ref(false);
const dataSource = ref<GiftRecordInfo[]>([]);
const searchInfo = ref<GiftRecordQuery>({});
const formInfo = ref<GiftRecordInfo>({ direction: 'GIVE' });
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// ── AI 自然语言快捷录入与推荐
const aiText = ref('');
const aiParsing = ref(false);
const isListening = ref(false);
let speechRecognitionInstance: any = null;
const recommendInfo = ref<GiftRecordRecommendAmount>({});
const recommendLoading = ref(false);

// ── 快记 picker：事由/送礼人/收礼人 由手输 ID 改为选择器，选项打开快记面板时懒加载一次
interface PickerOption {
	text: string;
	value: string;
}

type PickerType = 'event' | 'giver' | 'receiver' | 'related';

const PICKER_TITLES: Record<PickerType, string> = {
	event: '选择事由',
	giver: '选择送礼人',
	receiver: '选择收礼人',
	related: '选择原收礼记录',
};

/** 回礼可关联的原收礼记录一次最多取这么多条（按分页接口默认倒序，够覆盖近期待回礼） */
const RELATED_OPTION_LIMIT = 50;

/** 空值选项：Vant picker 的 value 不接受 undefined，用空串表示"不关联"，落库前转 undefined */
const NONE_OPTION: PickerOption = { text: '不关联', value: '' };

const pickerVisible = ref(false);
const pickerType = ref<PickerType>('event');
const pickerLoaded = ref(false);
const relatedLoaded = ref(false);
const personOptions = ref<PickerOption[]>([NONE_OPTION]);
const eventOptions = ref<PickerOption[]>([NONE_OPTION]);
// 回礼关联的原收礼记录：必填，故不给"不关联"选项
const relatedOptions = ref<PickerOption[]>([]);

const filterOptions = computed(() => [{ text: '全部', value: undefined }, ...directionOptions]);

const pickerTitle = computed(() => PICKER_TITLES[pickerType.value]);
const pickerColumns = computed(() => {
	if (pickerType.value === 'event') return eventOptions.value;
	if (pickerType.value === 'related') return relatedOptions.value;
	return personOptions.value;
});

const optionText = (options: PickerOption[], id?: string | null) =>
	options.find((option) => option.value && option.value === String(id ?? ''))?.text || '';

const selectedEventName = computed(() => optionText(eventOptions.value, formInfo.value.eventId));
const selectedGiverName = computed(() => optionText(personOptions.value, formInfo.value.giverPersonId));
const selectedReceiverName = computed(() => optionText(personOptions.value, formInfo.value.receiverPersonId));
const selectedRelatedName = computed(() => optionText(relatedOptions.value, formInfo.value.relatedRecordId));

const haptic = () => navigator.vibrate?.(50);

const query = async (cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getGiftRecordPage(
		searchInfo.value,
		cur.current || 1,
		cur.pageSize || 10,
	).finally(() => {
		loading.value = false;
		refreshing.value = false;
	});
	if (code === '200') {
		const records = data?.records || [];
		dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
		setTotal(data?.total || 0);
		nextPage();
		finished.value = (pagination.total || 0) <= dataSource.value.length;
	} else {
		showFailToast(message || '礼金记录加载失败');
	}
};

const refresh = () => {
	finished.value = false;
	resetPagination();
	void query(pagination);
};

const onRefresh = () => refresh();
const onLoadMore = () => query(pagination);
const onSearch = () => refresh();

const selectDirection = (direction?: GiftDirection) => {
	haptic();
	searchInfo.value.direction = direction;
	refresh();
};

/** 懒加载 picker 选项（成功后缓存，失败下次打开重试） */
const loadPickerOptions = async () => {
	if (pickerLoaded.value) return;
	const [personRes, eventRes] = await Promise.all([getGiftPersonList({}), getGiftEventList({})]);
	if (personRes.code === '200') {
		personOptions.value = [
			NONE_OPTION,
			...(personRes.data || [])
				.filter((person) => person.id != null)
				.map((person) => ({
					text: person.personName || `#${person.id}`,
					value: String(person.id),
				})),
		];
	}
	if (eventRes.code === '200') {
		eventOptions.value = [
			NONE_OPTION,
			...(eventRes.data || [])
				.filter((event) => event.id != null)
				.map((event) => ({
					text: event.eventName || `#${event.id}`,
					value: String(event.id),
				})),
		];
	}
	pickerLoaded.value = personRes.code === '200' && eventRes.code === '200';
};

/**
 * 懒加载"原收礼记录"选项：只取待回礼（returnedFlag !== 1）的收礼流水，
 * 已回礼的不再作为回礼目标出现，避免用户重复关联。
 */
const loadRelatedOptions = async () => {
	if (relatedLoaded.value) return;
	const { code, data, message } = await getGiftRecordPage({ direction: 'RECEIVE' }, 1, RELATED_OPTION_LIMIT);
	if (code !== '200') {
		showFailToast(message || '收礼记录加载失败');
		return;
	}
	relatedOptions.value = (data?.records || [])
		.filter((record) => record.id != null && record.returnedFlag !== 1)
		.map((record) => ({
			text: [
				record.personName || record.giverPersonName || '未知亲友',
				formatMoney(record.amount),
				record.payTime?.slice(0, 10) || '',
			]
				.filter(Boolean)
				.join(' · '),
			value: String(record.id),
		}));
	relatedLoaded.value = true;
};

const fetchRecommendAmount = async () => {
	const personId =
		formInfo.value.direction === 'RECEIVE' ? formInfo.value.giverPersonId : formInfo.value.receiverPersonId;
	const eventOption = eventOptions.value.find((e) => e.value === formInfo.value.eventId);
	const eventType = eventOption?.text && eventOption.text !== '不关联' ? eventOption.text : undefined;
	if (!eventType && !personId) {
		recommendInfo.value = {};
		return;
	}
	recommendLoading.value = true;
	try {
		const { code, data } = await getGiftRecordRecommendAmount({
			personId: personId || undefined,
			eventType: eventType || undefined,
			direction: formInfo.value.direction,
		});
		if (code === '200' && data) {
			recommendInfo.value = data;
			if (!formInfo.value.amount) {
				const autoAmount = data.latestAmount || data.averageAmount || data.defaultAmount;
				if (autoAmount && autoAmount > 0) {
					formInfo.value.amount = autoAmount;
				}
			}
		}
	} catch (e) {
		console.error(e);
	} finally {
		recommendLoading.value = false;
	}
};

const onDirectionChange = () => {
	haptic();
	void fetchRecommendAmount();
};

const handleAiParse = async () => {
	const text = aiText.value.trim();
	if (!text) {
		showToast('请输入记账描述内容');
		return;
	}
	aiParsing.value = true;
	try {
		await loadPickerOptions();
		const { code, data, message } = await aiParseGiftRecord({
			content: text,
			defaultDirection: formInfo.value.direction,
		});
		if (code === '200' && data) {
			haptic();
			if (data.direction) {
				formInfo.value.direction = data.direction;
			}
			if (data.amount != null && data.amount > 0) {
				formInfo.value.amount = Number(data.amount);
			}
			if (data.payTime) {
				formInfo.value.payTime = data.payTime.slice(0, 10);
			}
			if (data.remark) {
				formInfo.value.remark = data.remark;
			}
			// 人员匹配
			if (data.personId) {
				const pid = String(data.personId);
				if (!personOptions.value.some((p) => p.value === pid)) {
					personOptions.value.push({
						text: data.personName || `#${pid}`,
						value: pid,
					});
				}
				if (formInfo.value.direction === 'RECEIVE') {
					formInfo.value.giverPersonId = pid;
				} else {
					formInfo.value.receiverPersonId = pid;
				}
			} else if (data.personName) {
				const matched = personOptions.value.find((p) => p.text === data.personName);
				if (matched && matched.value) {
					if (formInfo.value.direction === 'RECEIVE') {
						formInfo.value.giverPersonId = matched.value;
					} else {
						formInfo.value.receiverPersonId = matched.value;
					}
				}
			}
			// 事件匹配
			if (data.eventId) {
				const eid = String(data.eventId);
				if (!eventOptions.value.some((e) => e.value === eid)) {
					eventOptions.value.push({
						text: data.eventTypeName || `#${eid}`,
						value: eid,
					});
				}
				formInfo.value.eventId = eid;
			} else if (data.eventTypeName || data.eventType) {
				const label = data.eventTypeName || data.eventType;
				const matched = eventOptions.value.find((e) => e.text === label);
				if (matched && matched.value) {
					formInfo.value.eventId = matched.value;
				}
			}
			showSuccessToast('智能解析成功');
			void fetchRecommendAmount();
		} else {
			showFailToast(message || '智能解析失败');
		}
	} catch (e) {
		console.error(e);
		showFailToast('智能解析异常');
	} finally {
		aiParsing.value = false;
	}
};

const copyGreeting = async (tip?: string) => {
	if (!tip) return;
	haptic();
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(tip);
		} else {
			const textarea = document.createElement('textarea');
			textarea.value = tip;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}
		showSuccessToast('贺词已复制');
	} catch {
		showToast(tip);
	}
};

const toggleSpeechInput = () => {
	if (isListening.value) {
		speechRecognitionInstance?.stop();
		isListening.value = false;
		return;
	}

	const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

	if (!SpeechRecognitionClass) {
		showToast('当前浏览器环境暂未支持语音识别，请直接打字输入');
		return;
	}

	try {
		speechRecognitionInstance = new SpeechRecognitionClass();
		speechRecognitionInstance.lang = 'zh-CN';
		speechRecognitionInstance.continuous = false;
		speechRecognitionInstance.interimResults = false;

		speechRecognitionInstance.onstart = () => {
			isListening.value = true;
			haptic();
			showToast('请说出记账内容...');
		};

		speechRecognitionInstance.onresult = (event: any) => {
			const transcript = event.results?.[0]?.[0]?.transcript;
			if (transcript) {
				aiText.value = transcript;
				showSuccessToast('语音识别完成');
				haptic();
				void handleAiParse();
			}
		};

		speechRecognitionInstance.onerror = () => {
			isListening.value = false;
			showToast('语音识别未完成，请重试');
		};

		speechRecognitionInstance.onend = () => {
			isListening.value = false;
		};

		speechRecognitionInstance.start();
	} catch {
		isListening.value = false;
		showToast('无法启动语音识别');
	}
};

const openPicker = (type: PickerType) => {
	haptic();
	pickerType.value = type;
	if (type === 'related') {
		void loadRelatedOptions();
	}
	pickerVisible.value = true;
};

const onPickerConfirm = ({ selectedOptions }: { selectedOptions: Array<PickerOption | undefined> }) => {
	// 空串（"不关联"）转 undefined，避免把 '' 传给后端
	const value = selectedOptions[0]?.value || undefined;
	if (pickerType.value === 'event') {
		formInfo.value.eventId = value;
	} else if (pickerType.value === 'giver') {
		formInfo.value.giverPersonId = value;
	} else if (pickerType.value === 'related') {
		formInfo.value.relatedRecordId = value;
	} else {
		formInfo.value.receiverPersonId = value;
	}
	pickerVisible.value = false;
	void fetchRecommendAmount();
};

const openQuickRecord = () => {
	haptic();
	formInfo.value = { direction: 'GIVE' };
	aiText.value = '';
	recommendInfo.value = {};
	quickRecordVisible.value = true;
	void loadPickerOptions();
};

const saveRecord = async () => {
	saving.value = true;
	const { code, message } = await addGiftRecord(formInfo.value).finally(() => {
		saving.value = false;
	});
	if (code === '200') {
		showSuccessToast('保存成功');
		quickRecordVisible.value = false;
		// 回礼会改变原收礼记录的待回礼状态，缓存的选项需失效重取
		relatedLoaded.value = false;
		refresh();
	} else {
		showFailToast(message || '保存失败');
	}
};

const removeRecord = async (item: GiftRecordInfo) => {
	haptic();
	await showConfirmDialog({ title: '删除记录', message: '确认删除这条礼金记录？' });
	const { code, message } = await deleteGiftRecord(String(item.id));
	if (code === '200') {
		showSuccessToast('删除成功');
		refresh();
	} else {
		showFailToast(message || '删除失败');
	}
};

const markReturned = async (item: GiftRecordInfo) => {
	haptic();
	const { code, message } = await markGiftReturned(item.id || '');
	if (code === '200') {
		showSuccessToast('已标记回礼');
		// 该记录不再是待回礼目标，缓存的选项需失效重取
		relatedLoaded.value = false;
		refresh();
	} else {
		showFailToast(message || '标记失败');
	}
};

const showPending = async (item: GiftRecordInfo) => {
	if (item.direction !== 'RECEIVE') return;
	const { code, data, message } = await getPendingReturnAmount(item.id || '');
	if (code === '200') {
		showToast(`待回礼 ${formatMoney(data || 0)}`);
	} else {
		showFailToast(message || '查询失败');
	}
};

refresh();
</script>

<style scoped lang="less">
.gift-mobile-page {
	height: 100%;
	background: #f8fbff;
	color: #1f2937;
}

.gift-search {
	padding: 10px 12px 6px;
	background: #fff;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.06);
}

.gift-tabs {
	display: flex;
	gap: 8px;
	padding: 4px 4px 8px;
	overflow-x: auto;
}

.gift-tabs__item,
.quick-amounts button {
	border: 1px solid #d8ecfb;
	background: #fff;
	color: #2098ee;
	border-radius: 999px;
	padding: 6px 13px;
	font-size: 13px;
	transition:
		transform 0.12s ease,
		background-color 0.12s ease;
}

.gift-tabs__item:active,
.quick-amounts button:active {
	transform: scale(0.96);
}

.gift-tabs__item.active,
.quick-amounts button.active {
	background: #2098ee;
	color: #fff;
}

.gift-refresh {
	height: calc(100% - 102px);
}

.gift-skeleton-card {
	padding: 16px;
	margin-bottom: 12px;
	background: #fff;
	border-radius: 16px;
}

.quick-panel {
	padding: 18px 16px 24px;
}

.quick-panel__title {
	font-size: 18px;
	font-weight: 800;
	margin-bottom: 12px;
}

.quick-amounts {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 8px;
	padding: 8px 0 10px;
}

.quick-panel__actions {
	margin-top: 16px;
}

.quick-ai-parse-box {
	margin-bottom: 12px;
	border-radius: 12px;
	background: #f0f7ff;
	padding: 4px;
	border: 1px dashed #b9dcfa;

	:deep(.van-cell) {
		background: transparent;
		padding: 4px 8px;
	}

	:deep(.van-field__control) {
		font-size: 13px;
		color: #1e293b;
	}
}

.ai-recommend-card {
	margin: 8px 0 10px;
	padding: 10px 12px;
	border-radius: 12px;
	background: #f4f9ff;
	border: 1px solid #d4e8fc;
	display: flex;
	flex-direction: column;
	gap: 6px;

	.ai-recommend-row {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		font-size: 12px;
		line-height: 1.5;

		.ai-tag {
			flex-shrink: 0;
			font-weight: 600;
			color: #1d4ed8;
		}

		.ai-text {
			flex: 1;
			color: #334155;
		}

		&.greeting-row {
			align-items: center;
			background: #ffffff;
			padding: 6px 8px;
			border-radius: 8px;
			border: 1px solid #e0edfb;

			.copy-btn {
				flex-shrink: 0;
				margin-left: 4px;
			}
		}
	}
}
</style>
