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
			@click="openQuickRecord"
		/>

		<van-popup
			v-model:show="quickRecordVisible"
			position="bottom"
			round
		>
			<div class="quick-panel">
				<div class="quick-panel__title">快速记礼</div>
				<van-form @submit="saveRecord">
					<van-field
						name="direction"
						label="方向"
					>
						<template #input>
							<van-radio-group
								v-model="formInfo.direction"
								direction="horizontal"
							>
								<van-radio name="GIVE">随礼</van-radio>
								<van-radio name="RECEIVE">收礼</van-radio>
								<van-radio name="RETURN">回礼</van-radio>
							</van-radio-group>
						</template>
					</van-field>
					<div class="quick-amounts">
						<button
							v-for="amount in quickAmounts"
							:key="amount"
							type="button"
							:class="{ active: formInfo.amount === amount }"
							@click="formInfo.amount = amount"
						>
							{{ amount }}
						</button>
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
						v-model="formInfo.eventId"
						label="事由ID"
						placeholder="可后续替换为选择器"
					/>
					<van-field
						v-model="formInfo.giverPersonId"
						label="送礼人ID"
					/>
					<van-field
						v-model="formInfo.receiverPersonId"
						label="收礼人ID"
					/>
					<van-field
						v-if="formInfo.direction === 'RETURN'"
						v-model="formInfo.relatedRecordId"
						label="原收礼ID"
						placeholder="回礼必须填写"
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
	</div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import GiftRecordCard from '@/views/finance/gift/components/GiftRecordCard.vue';
import {
	addGiftRecord,
	deleteGiftRecord,
	getGiftRecordPage,
	getPendingReturnAmount,
	markGiftReturned,
} from '@/views/finance/gift/api';
import type { GiftDirection, GiftRecordInfo, GiftRecordQuery } from '@/views/finance/gift/config';
import { directionOptions, formatMoney, quickAmounts } from '@/views/finance/gift/config';
import type { PageInfo } from '@/views/common/config';

useNavBar({
	title: '礼金记录',
	rightButton: '快速记礼',
	visible: true,
	onRightClick: () => openQuickRecord(),
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

const filterOptions = computed(() => [{ text: '全部', value: undefined }, ...directionOptions]);

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

const openQuickRecord = () => {
	haptic();
	formInfo.value = { direction: 'GIVE' };
	quickRecordVisible.value = true;
};

const saveRecord = async () => {
	saving.value = true;
	const { code, message } = await addGiftRecord(formInfo.value).finally(() => {
		saving.value = false;
	});
	if (code === '200') {
		showSuccessToast('保存成功');
		quickRecordVisible.value = false;
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
</style>
