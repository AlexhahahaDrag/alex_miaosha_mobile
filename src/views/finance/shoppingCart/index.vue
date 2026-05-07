<template>
	<div class="container">
		<div class="content">
			<van-cell-group>
				<template v-if="shopCartList?.length">
					<van-swipe-cell
						:key="index"
						v-for="(item, index) in shopCartList"
					>
						<div class="cell-info">
							<van-tag
								style="width: 10px"
								v-if="(item?.stockNum || 0) === 0"
								color="grey"
								text-color="#ffffff"
							>
								无货
							</van-tag>
							<van-checkbox
								v-if="item?.stockNum || 0 > 0"
								v-model="item.checked"
								icon-size="18px"
								@change="changeCheck"
							></van-checkbox>
							<van-cell
								center
								:key="item?.id"
								@click="selectProduct(item)"
							>
								<template #title>
									<div class="text-left">
										<span :class="item?.stockNum || 0 > 0 ? '' : 'font-grey'">{{ item.shopName }}</span>
										<van-tag type="primary">{{ item.oldShopCode }}</van-tag>
									</div>
								</template>
								<template #right-icon>
									<div class="text-right">
										<div
											class="rightRedDiv"
											@click.stop
										>
											<van-stepper
												v-model="item.saleNum"
												@change="changeCount(item)"
												min="1"
												theme="round"
												button-size="20px"
												:disabled="(item?.stockNum || 0) === 0"
											></van-stepper>
										</div>
									</div>
								</template>
								<template #label>
									<div class="amountInfo">￥{{ commonUtils.formatAmount(item.saleAmount || 0, 2, '') }}</div>
								</template>
							</van-cell>
						</div>
						<template #right>
							<van-button
								class="right_info"
								@click="delShopCartInfo(item?.id || null)"
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
						>
						</van-divider>
					</van-swipe-cell>
				</template>
			</van-cell-group>
		</div>
		<div class="footer-container">
			<div class="footer">
				<div class="amount-info">￥{{ commonUtils.formatAmount(sumAmount || 0, 2, '') }}</div>
				<div class="checkout-button">
					<van-button
						@click="settlementAmount"
						style="width: 100%"
						:loading="submitLoading"
						round
						type="danger"
						loading-text="结算中..."
					>
						结算
					</van-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import commonUtils from '@/utils/common/index';
import type { ShopCartInfo } from '@/views/finance/shoppingCart/shoppingCartTs';
import type { ShopCartData } from '@/views/finance/shopCart/config';
import { getShopCartList, updateShopCart, deleteShopCart } from '@/views/finance/shopCart/api';

const route = useRoute();
const router = useRouter();

useNavBar({
	title: (route?.meta?.title as string) || '购物车',
	leftPath: '/',
	visible: true,
});

const sumAmount = ref<number>(0);
const submitLoading = ref<boolean>(false);
const shopCartList = ref<ShopCartInfo[]>([]);
const settlementAmount = () => {
	const ids = shopCartList.value.filter((item: ShopCartInfo) => item.checked).map((item: ShopCartInfo) => item.id);
	router.push({ name: 'saleTicket', query: { type: 'shopCart', ids } });
};

const getSumAmount = (): void => {
	if (!shopCartList.value?.length) {
		sumAmount.value = 0;
		return;
	}
	sumAmount.value = 0;
	shopCartList.value.forEach((item: ShopCartInfo) => {
		if (item?.checked) {
			sumAmount.value = commonUtils.plus(sumAmount.value, commonUtils.multiply(item.saleAmount || 0, item.saleNum || 0));
		}
	});
};

const changeCount = async (item: ShopCartInfo): Promise<void> => {
	// 保存购物车信息
	await updateShopCart({
		id: item.id,
		saleNum: item.saleNum || 1,
	} as unknown as ShopCartData);
	// 计算选中商品总金额
	getSumAmount();
};

const getShopCartListInfo = async () => {
	try {
		const { code, data, message } = await getShopCartList();
		if (code === '200') {
			shopCartList.value = data || [];
		} else {
			showFailToast(message || '获取购物车失败，请联系管理员！');
		}
	} catch (err: unknown) {
		showFailToast((err as Error)?.message || '获取购物车失败，请联系管理员！');
	}
};

const selectProduct = (info: ShopCartInfo) => {
	shopCartList.value.forEach((item: ShopCartInfo) => {
		if (item.id === info.id) {
			item.checked = !info.checked;
		}
	});
	getSumAmount();
};

const changeCheck = (): void => {
	getSumAmount();
};

const delShopCartInfo = (id: string | null): void => {
	if (!id) {
		return;
	}
	deleteShopCart(`${id}`)
		.then((res) => {
			if (res?.code === '200') {
				showSuccessToast('删除成功！');
				void init();
			} else {
				showFailToast(res?.message || '删除失败，请联系管理员！');
			}
		})
		.catch((err) => {
			showFailToast(err?.message || '删除失败，请联系管理员！');
		});
};

const init = async () => {
	await getShopCartListInfo();
	getSumAmount();
};

onMounted(async () => {
	await init();
});
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	.content {
		.text-left {
			font-size: 17px;
			width: 100%;
			padding-bottom: 15px;
		}

		.amountInfo {
			font-size: 15px;
			color: red;
		}

		.cell-info {
			display: flex;
			justify-content: space-between;
			/* 浣垮瓙鍏冪礌鍒嗗埆瀵归綈鍒板鍣ㄧ殑涓ょ */
			align-items: center;
			/* 绾靛悜灞呬腑瀵归綈 */
			left: 0;
			width: 100%;
			padding: 10px;
			/* 鏍规嵁闇€瑕佽皟鏁?*/
			box-sizing: border-box;
		}

		.right_info {
			height: 100%;
		}
	}
}

.footer {
	display: flex;
	justify-content: space-between;
	/* 浣垮瓙鍏冪礌鍒嗗埆瀵归綈鍒板鍣ㄧ殑涓ょ */
	align-items: center;
	/* 绾靛悜灞呬腑瀵归綈 */
	position: fixed;
	/* 鎴栦娇鐢?absolute锛屾牴鎹渶瑕?*/
	left: 0;
	bottom: 0;
	width: 100%;
	padding: 10px;
	/* 鏍规嵁闇€瑕佽皟鏁?*/
	box-sizing: border-box;
	/* 纭繚鍐呰竟璺濅笉浼氬奖鍝嶅埌鍏冪礌鐨勬€诲搴?*/
	background-color: #f8f8f8;
	/* 鏍规嵁闇€瑕佽皟鏁?*/
}

.amount-info {
	padding-left: 15px;
	display: flex;
	align-items: center;
	color: red;
	font-size: 28px;

	.old-info {
		font-size: 15px;
		color: gray;
		text-decoration: line-through;
	}
}

.checkout-button {
	width: 25%;
}

.font-grey {
	color: gray;
}
</style>
