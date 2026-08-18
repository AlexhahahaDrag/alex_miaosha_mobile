<template>
	<div class="gift-list-page">
		<section class="search-shell">
			<van-search
				v-model="searchInfo.keyword"
				data-testid="gift-person-search"
				placeholder="搜索亲友姓名或手机号"
				shape="round"
				@search="refresh"
				@clear="refresh"
			/>
		</section>

		<section
			v-if="quickRelations.length"
			class="relation-tags"
			data-testid="gift-person-relation-tags"
		>
			<button
				v-for="item in quickRelations"
				:key="item.id"
				type="button"
				:class="['relation-tags__item', { active: searchInfo.relationType === resolveFilterRelationType(item.id) }]"
				data-testid="gift-person-relation-tag"
				@click="selectRelation(item.id)"
			>
				{{ item.name }}
			</button>
		</section>

		<section
			class="person-summary"
			data-testid="gift-person-summary"
		>
			<div class="person-summary__item">
				<span>总联系人</span>
				<strong>{{ summary.personCount || 0 }}</strong>
			</div>
			<div class="person-summary__item">
				<span>年度往来</span>
				<strong>{{ formatMoney(summary.yearTotalAmount) }}</strong>
			</div>
			<div class="person-summary__pending"> 待回礼 {{ formatMoney(summary.pendingReturnAmount) }} </div>
		</section>

		<common-pull-refresh
			v-model="refreshing"
			class="gift-refresh gift-refresh--person"
			@refresh="refresh"
		>
			<common-list
				id="gift-person-list"
				v-model="loading"
				data-testid="gift-person-list"
				:loading="loading"
				:refreshing="refreshing"
				:finished="finished"
				:is-empty="!dataSource.length"
				empty-text="暂无亲友"
				@load="loadMore"
			>
				<template #skeleton>
					<div
						v-for="i in 4"
						:key="i"
						class="person-card person-card--skeleton"
					>
						<van-skeleton
							title
							:row="3"
						/>
					</div>
				</template>
				<div
					v-for="item in dataSource"
					:key="item.id"
					class="person-card"
					data-testid="gift-person-card"
					@click="openDetail(item.id)"
				>
					<div class="avatar">
						<img
							v-if="personAvatarSrc(item)"
							class="avatar-img"
							:src="personAvatarSrc(item)"
							alt=""
						/>
						<template v-else>{{ (item.personName || '?').slice(0, 1) }}</template>
					</div>
					<div class="person-card__main">
						<strong>{{ item.personName || '未命名' }}</strong>
						<span> {{ item.phone || '无手机号' }} · {{ relationLabel(item.relationType) }} </span>
						<p>
							出 {{ formatMoney(item.totalGiveAmount) }} / 入
							{{ formatMoney(item.totalReceiveAmount) }}
						</p>
						<p>
							{{ item.latestRecordTime || '暂无往来' }}
							<template v-if="item.latestDirection"> · {{ directionText(item.latestDirection) }} </template>
						</p>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>
	</div>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePagination } from '@/composables/usePagination';
import { usePermission } from '@/composables/usePermission';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { getRoutePathByName } from '@/utils/router';
import { getGiftPersonBusinessPage, getGiftPersonSummary } from '@/views/finance/gift/person/api';
import type { GiftPersonBusinessInfo, GiftPersonQuery, GiftPersonSummary } from '@/views/finance/gift/config';
import {
	GIFT_PERSON_DETAIL_NAME,
	GIFT_TAB_BAR,
	directionText,
	formatMoney,
	personAvatarSrc,
} from '@/views/finance/gift/config';

const router = useRouter();
const { hasPermission } = usePermission();
const { quickRelations, loadRelationOptions, relationLabel, resolveFilterRelationType } = useGiftRelationOptions();

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const dataSource = ref<GiftPersonBusinessInfo[]>([]);
const searchInfo = ref<GiftPersonQuery>({});
const summary = ref<GiftPersonSummary>({});
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const detailPath = () => getRoutePathByName(router, GIFT_PERSON_DETAIL_NAME, '/finance/gift/person/giftPersonDetail');

const openCreate = () => {
	if (!hasPermission('gift:add')) return;
	navigator.vibrate?.(50);
	router.push({ path: detailPath() });
};

const openDetail = (id?: string) => {
	if (!id || !hasPermission('gift:view')) return;
	navigator.vibrate?.(50);
	router.push({ path: detailPath(), query: { id: String(id) } });
};

useNavBar({
	title: '亲友管理',
	rightButton: hasPermission('gift:add') ? '新增' : '',
	visible: true,
	onRightClick: openCreate,
});

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const loadSummary = async () => {
	const { code, data } = await getGiftPersonSummary();
	if (code === '200') summary.value = data || {};
};

const load = async () => {
	loading.value = true;
	const { code, data, message } = await getGiftPersonBusinessPage(
		searchInfo.value,
		pagination.current,
		pagination.pageSize,
	).finally(() => {
		loading.value = false;
		refreshing.value = false;
	});
	if (code !== '200') return showFailToast(message || '亲友加载失败');
	const list = (data?.records || []).map((item) => ({
		...item,
		id: item.id != null ? String(item.id) : item.id,
	}));
	dataSource.value = pagination.current === 1 ? list : [...dataSource.value, ...list];
	setTotal(data?.total || 0);
	nextPage();
	finished.value = (pagination.total || 0) <= dataSource.value.length;
};

const refresh = () => {
	finished.value = false;
	resetPagination();
	void loadSummary();
	void load();
};

const loadMore = () => load();

const selectRelation = (presetId: string) => {
	navigator.vibrate?.(50);
	const relationType = resolveFilterRelationType(presetId);
	searchInfo.value.relationType = searchInfo.value.relationType === relationType ? undefined : relationType;
	refresh();
};

onMounted(async () => {
	await loadRelationOptions();
	refresh();
});
</script>

<style scoped lang="less">
@import '../shared.less';

.avatar {
	border-radius: 20px;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}
</style>
