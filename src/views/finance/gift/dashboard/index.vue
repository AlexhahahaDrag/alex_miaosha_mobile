<template>
	<div class="gift-dashboard">
		<section class="overview">
			<div class="overview__item">
				<span>本月收礼</span>
				<strong>{{ formatMoney(summary.receive) }}</strong>
			</div>
			<div class="overview__item">
				<span>本月支出</span>
				<strong>{{ formatMoney(summary.give) }}</strong>
			</div>
			<div class="overview__item">
				<span>待回礼</span>
				<strong>{{ summary.pendingCount }}</strong>
			</div>
		</section>
		<common-pull-refresh
			v-model="refreshing"
			class="gift-refresh"
			@refresh="refresh"
		>
			<common-list
				id="gift-dashboard-list"
				v-model="loading"
				:loading="loading"
				:refreshing="refreshing"
				:finished="finished"
				:is-empty="!records.length"
				empty-text="暂无最近礼金"
				@load="loadMore"
			>
				<gift-record-card
					v-for="item in records"
					:key="item.id"
					:item="item"
				/>
			</common-list>
		</common-pull-refresh>
	</div>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import GiftRecordCard from '@/views/finance/gift/components/GiftRecordCard.vue';
import { getGiftRecordPage } from '@/views/finance/gift/api';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import { formatMoney } from '@/views/finance/gift/config';

useNavBar({ title: '数据概览', visible: true });

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const records = ref<GiftRecordInfo[]>([]);
const summary = reactive({ receive: 0, give: 0, pendingCount: 0 });
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const load = async () => {
	loading.value = true;
	const { code, data, message } = await getGiftRecordPage({}, pagination.current, pagination.pageSize).finally(() => {
		loading.value = false;
		refreshing.value = false;
	});
	if (code !== '200') {
		showFailToast(message || '数据加载失败');
		return;
	}
	const list = data?.records || [];
	records.value = pagination.current === 1 ? list : [...records.value, ...list];
	setTotal(data?.total || 0);
	nextPage();
	finished.value = (pagination.total || 0) <= records.value.length;
	summary.receive = records.value
		.filter((item) => item.direction === 'RECEIVE')
		.reduce((sum, item) => sum + Number(item.amount || 0), 0);
	summary.give = records.value
		.filter((item) => item.direction !== 'RECEIVE')
		.reduce((sum, item) => sum + Number(item.amount || 0), 0);
	summary.pendingCount = records.value.filter((item) => item.direction === 'RECEIVE' && item.returnedFlag !== 1).length;
};

const refresh = () => {
	finished.value = false;
	resetPagination();
	void load();
};

const loadMore = () => load();

refresh();
</script>

<style scoped lang="less">
.gift-dashboard {
	height: 100%;
	background: #f8fbff;
}

.overview {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
	padding: 14px 14px 8px;
}

.overview__item {
	min-height: 82px;
	padding: 12px;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
}

.overview__item span {
	color: #8a94a6;
	font-size: 12px;
}

.overview__item strong {
	display: block;
	margin-top: 10px;
	font-size: 18px;
	color: #1f2937;
}

.gift-refresh {
	height: calc(100% - 112px);
}
</style>
