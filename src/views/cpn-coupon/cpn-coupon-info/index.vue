<template>
	<form action="/">
		<van-search
			v-model="searchInfo.couponName"
			show-action
			placeholder="请输入消费券名称"
			@search="onSearch"
			@cancel="onCancel"
			action-text="清空"
		/>
	</form>
	<van-divider :style="{ color: '#1989fa', borderColor: 'grey', margin: '0 0 10px 0' }" />
	<van-pull-refresh
		pulling-text="加载中。。。"
		:style="{}"
		class="refresh-info"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
		immediate-check="false"
	>
		<div style="height: 100%; overflow-y: auto">
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
							:title-class="item.remainingQuantity && item.remainingQuantity > 0 ? 'validClass' : 'notValidClass'"
							:title="item.couponName || '未命名消费券'"
							:key="index"
							is-link
							:to="{
								path: '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail',
								query: { id: item.id },
							}"
						>
							<template #label>
								<div class="coupon-info">
									<div class="info-item">
										<span class="label">面值：</span>
										<span class="value">{{ item.unitValue ? '￥' + item.unitValue : '--' }}</span>
									</div>
									<div class="info-item">
										<span class="label">剩余数量：</span>
										<span class="value">{{ item.remainingQuantity ?? 0 }}</span>
									</div>
									<div
										class="info-item"
										v-if="item.expireStatus"
									>
										<span class="label">过期状态：</span>
										<span
											class="value"
											:style="{
												color: getExpireStatusColor(item.expireRangeStatus),
											}"
										>
											{{ item.expireStatus }}
										</span>
									</div>
									<div class="info-item">
										<span class="label">支付状态：</span>
										<span class="value">{{ item.paymentStatus === 1 ? '已支付' : '未支付' }}</span>
									</div>
								</div>
							</template>
							<template #right-icon>
								<div class="text-right">
									<div style="display: flex">
										<div class="van-ellipsis">
											{{ item?.endDate ? String(item.endDate).substring(0, 16) : '--' }}
										</div>
									</div>
									<div class="rightDiv">
										<span>总数量：{{ item.totalQuantity ?? 0 }}</span>
									</div>
								</div>
							</template>
						</van-cell>
						<template #right>
							<van-button
								class="right_info"
								@click="delCpnCouponInfo(item.id)"
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
		</div>
	</van-pull-refresh>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import type { SearchInfo, PageInfo } from './config';
import { pagination } from './config';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from '@/api/finance/cpnCouponInfo';
import { useNavBar } from '@/composables/useNavBar';

const router = useRouter();
const route = useRoute();

// 定义addCpnCouponInfo函数
const addCpnCouponInfo = () => {
	router.push({ path: '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail' });
};

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '消费券管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: addCpnCouponInfo,
});

const loading = ref<boolean>(false);
const dataSource = ref<any[]>([]);
// AI Agent：默认查询有效的数据
const searchInfo = ref<SearchInfo>({
	onlyValidAndNotFullyRedeemed: true,
});

const finished = ref<boolean>(false); //加载是否已经没有更多数据
const isRefresh = ref<boolean>(false); //是否下拉刷新

// AI Agent：获取过期状态颜色
const getExpireStatusColor = (status: number | undefined): string => {
	if (status === undefined) return '#333';
	switch (status) {
		case 0:
			return 'red';
		case 1:
			return 'green';
		case 2:
			return 'orange';
		default:
			return '#333';
	}
};

const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onRefresh();
};

const onCancel = () => {
	searchInfo.value.couponName = '';
	searchInfo.value.onlyValidAndNotFullyRedeemed = true; // AI Agent：清空后恢复默认查询有效数据
	pagination.value.current = 0;
	dataSource.value = [];
	getCpnCouponInfoPage(searchInfo.value, pagination.value);
};

function getCpnCouponInfoListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getCpnCouponInfoPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
		.then((res) => {
			if (res?.code == '200') {
				dataSource.value = [...dataSource.value, ...res.data.records];
				pagination.value.current = res.data.current + 1;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
				if ((pagination.value.total || 0) < (pagination.value.current || 1) * (pagination.value.pageSize || 10)) {
					finished.value = true;
				}
			} else {
				showFailToast((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			isRefresh.value = false;
			loading.value = false;
		});
}

const refresh = () => {
	pagination.value.current = 0;
	dataSource.value = [];
	getCpnCouponInfoListPage(searchInfo.value, pagination.value);
};

const onRefresh = () => {
	getCpnCouponInfoListPage(searchInfo.value, pagination.value);
};

const beforeClose = (_e: unknown) => {
	// AI Agent：滑动关闭前的回调
};

const delCpnCouponInfo = (id: number) => {
	deleteCpnCouponInfo(String(id)).then((res: any) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast((res && res.message) || '删除成功！');
		} else {
			showFailToast((res && res.message) || '删除失败，请联系管理员！');
		}
	});
};

function init() {
	dataSource.value = [];
	pagination.value.current = 0;
	//获取消费券管理页面数据
	getCpnCouponInfoListPage(searchInfo.value, pagination.value);
}

init();
</script>

<style lang="less" scoped>
.refresh-info {
	height: calc(100% - 64px);
}
.right_info {
	height: 100%;
}

.coupon-info {
	margin-top: 10px;
	.info-item {
		margin-bottom: 4px;
		.label {
			color: #666;
			font-size: 12px;
		}
		.value {
			color: #333;
			font-size: 12px;
			font-weight: 500;
		}
	}
}

.van-ellipsis {
	width: 130px;
	text-align: right;
	font-size: 12px;
	color: #666;
}

.rightDiv {
	margin-top: 10px;
	text-align: right;
	font-size: 12px;
	color: #333;
}

.validClass {
	font-weight: bolder;
}

.notValidClass {
	color: gray;
}
</style>
