<template>
	<NavBar
		:info="info"
		@click-right="addShopFinance"
	></NavBar>
	<van-pull-refresh
		pulling-text="加载中。。。"
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
		immediate-check="false"
	>
		<form action="/">
			<van-search
				v-model="searchInfo.shopName"
				show-action
				placeholder="请输入商品名称"
				@change="onSearch"
				@search="onSearch"
				@cancel="onCancel"
				action-text="清空"
			></van-search>
		</form>
		<van-divider
			:style="{
				color: '#1989fa',
				borderColor: 'grey',
			}"
		></van-divider>
		<van-empty
			v-if="dataSource.length == 0"
			description="暂无数据"
		></van-empty>
		<van-list
			v-else
			v-model:loading="loading"
			:finished="finished"
			finished-text="没有更多了"
			@load="onRefresh"
		>
			<van-cell-group>
				<van-swipe-cell
					v-for="(item, index) in dataSource"
					:before-close="beforeClose"
					:key="index"
				>
					<van-cell
						:title-class="item.isValid == '1' ? 'validClass' : 'notValidClass'"
						:title="item.shopName + (item?.saleNum ? '(' + item.saleNum + '件)' : '')"
						:key="index"
						is-link
						:to="{
							path: '/finance/shopFinance/shopFinanceDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div class="svgInfo">
								<div
									class="svgDiv"
									v-for="(fromSource, index) in fromSourceTransferList"
									:key="index"
								>
									<SvgIcon
										v-if="item.payWay?.indexOf(fromSource.value) >= 0 && fromSource.value != ''"
										:name="fromSource.label"
										class="svg"
									></SvgIcon>
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item?.saleDate ? String(item?.saleDate).substring(0, 10) : '--' }}
									</div>
								</div>
								<div :class="item.incomeAndExpenses === 'income' ? 'rightGreenDiv' : 'rightRedDiv'">
									{{
										item?.saleAmount ? (item?.incomeAndExpenses === 'income' ? item?.saleAmount : -item?.saleAmount) + '元' : '--'
									}}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delShopFinance(item.id)"
							square
							type="danger"
							text="删除"
						/>
					</template>
					<van-divider
						:style="{
							color: '#1989fa',
							borderColor: 'grey',
							padding: '0 16px',
							'margin-top': '0px',
							'margin-bottom': '0px',
						}"
					></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</van-pull-refresh>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import type { SearchInfo } from './shopFinanceTs';
import { pagination, fromSourceTransferList } from './shopFinanceTs';
import { getShopFinancePage, deleteShopFinance } from '@/api/finance/shopFinance/shopFinanceTs';
import type { PageInfo } from '@/views/common/config/index';

const router = useRouter();
const route = useRoute();
const info = ref<any>({
	title: route?.meta?.title || '店财务管理',
	rightButton: '新增',
	leftPath: '/',
});

const loading = ref<boolean>(false);
const dataSource = ref<any[]>([]);
const searchInfo = ref<SearchInfo>({});

const finished = ref<boolean>(false); //加载是否已经没有更多数据
const isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onRefresh();
};

const onCancel = () => {
	searchInfo.value.shopName = '';
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

async function query(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	const { code, data, message } = await getShopFinancePage(
		param,
		cur?.current ? cur.current : 1,
		cur?.pageSize || 10,
	).finally(() => {
		isRefresh.value = false;
		loading.value = false;
	});

	if (code == '200') {
		dataSource.value = [...dataSource.value, ...data.records];
		pagination.value.current = data.current + 1;
		pagination.value.pageSize = data.size;
		pagination.value.total = data.total;
	} else {
		showFailToast(message || '查询列表失败！');
	}
}

const addShopFinance = () => {
	router.push({ path: '/finance/shopFinance/shopFinanceDetail' });
};

const refresh = () => {
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const onRefresh = () => {
	query(searchInfo.value, pagination.value);
};

const beforeClose = (e: any) => {
	console.log(e);
};

const delShopFinance = (id: number) => {
	deleteShopFinance(`${id}`).then((res: any) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast(res?.message || '删除成功！');
		} else {
			showFailToast(res?.message || '删除失败，请联系管理员！');
		}
	});
};

function init() {
	dataSource.value = [];
	pagination.value.current = 0;
	query(searchInfo.value, pagination.value);
}

init();
</script>

<style lang="scss" scoped>
.right_info {
	height: 100%;
}

.svgInfo {
	margin-top: 10px;
	display: flex;

	.svgDiv {
		height: 30px;

		.svgClass {
			height: 100%;
		}

		.svg {
			width: 1.5em;
			height: 1.5em;
			font-size: 18px;
			cursor: pointer;
			vertical-align: middle;
		}
	}
}

.van-ellipsis {
	width: 130px;
	text-align: right;
}

.rightDiv {
	margin-top: 10px;
	text-align: right;
}

.rightGreenDiv {
	margin-top: 10px;
	text-align: right;
	color: green;
}

.rightRedDiv {
	margin-top: 10px;
	text-align: right;
	color: red;
}

.iconClass {
	margin-top: 10px;
	display: flex;
}

.van-ellipsis {
	width: 130px;
	text-align: right;
}

.dividerClass {
	color: #1989fa;
	border-color: grey;
	padding: 0 16px;
	margin-top: 1px;
	margin-bottom: 1px;
}
</style>
