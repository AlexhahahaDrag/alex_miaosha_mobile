<template>
	<div class="gift-list-page">
		<section class="search-shell">
			<van-search
				v-model="searchInfo.keyword"
				placeholder="搜索事由"
				shape="round"
				@search="refresh"
				@clear="refresh"
			/>
			<van-button
				icon="plus"
				type="primary"
				round
				size="small"
				@click="openCreate"
			>新增</van-button>
		</section>
		<common-pull-refresh
			v-model="refreshing"
			class="gift-refresh"
			@refresh="refresh"
		>
			<common-list
				id="gift-event-list"
				v-model="loading"
				:loading="loading"
				:refreshing="refreshing"
				:finished="finished"
				:is-empty="!dataSource.length"
				empty-text="暂无事由"
				@load="loadMore"
			>
				<div
					v-for="item in dataSource"
					:key="item.id"
					class="person-card"
				>
					<div class="avatar">{{ (item.eventName || '?').slice(0, 1) }}</div>
					<div class="person-card__main">
						<strong>{{ item.eventName || '未命名事由' }}</strong>
						<span>{{ item.eventType || '其他' }} · {{ item.eventTime || '--' }}</span>
						<p>{{ item.remark || '无备注' }}</p>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>
		<van-popup
			v-model:show="showCreate"
			position="bottom"
			round
		>
			<div class="form-panel">
				<h3>快速新增事由</h3>
				<van-form @submit="saveEvent">
					<van-field
						v-model="formInfo.eventName"
						label="名称"
						:rules="[{ required: true, message: '请输入名称' }]"
					/>
					<van-field
						v-model="formInfo.eventType"
						label="类型"
					/>
					<van-field
						v-model="formInfo.remark"
						label="备注"
						type="textarea"
						rows="2"
						autosize
					/>
					<van-button
						block
						round
						type="primary"
						native-type="submit"
					>保存</van-button>
				</van-form>
			</div>
		</van-popup>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import { addGiftEvent, getGiftEventPage } from '@/views/finance/gift/api';
import type { GiftEventInfo } from '@/views/finance/gift/config';

useNavBar({ title: '事由管理', rightButton: '新增', visible: true, onRightClick: () => openCreate() });

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const showCreate = ref(false);
const dataSource = ref<GiftEventInfo[]>([]);
const searchInfo = ref<{ keyword?: string }>({});
const formInfo = ref<GiftEventInfo>({});
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const load = async () => {
	loading.value = true;
	const { code, data, message } = await getGiftEventPage(
		searchInfo.value,
		pagination.current,
		pagination.pageSize,
	).finally(() => {
		loading.value = false;
		refreshing.value = false;
	});
	if (code !== '200') return showFailToast(message || '事由加载失败');
	const list = data?.records || [];
	dataSource.value = pagination.current === 1 ? list : [...dataSource.value, ...list];
	setTotal(data?.total || 0);
	nextPage();
	finished.value = (pagination.total || 0) <= dataSource.value.length;
};

const refresh = () => {
	finished.value = false;
	resetPagination();
	void load();
};
const loadMore = () => load();
const openCreate = () => {
	navigator.vibrate?.(50);
	formInfo.value = {};
	showCreate.value = true;
};
const saveEvent = async () => {
	const { code, message } = await addGiftEvent(formInfo.value);
	if (code === '200') {
		showSuccessToast('保存成功');
		showCreate.value = false;
		refresh();
	} else showFailToast(message || '保存失败');
};

refresh();
</script>

<style scoped lang="less">
@import '../shared.less';
</style>
