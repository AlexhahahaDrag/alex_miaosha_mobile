<template>
	<div class="redeem-page">
		<!-- 消费券信息卡片 -->
		<van-cell-group
			v-if="couponInfo"
			inset
			class="coupon-card"
		>
			<div class="coupon-header">
				<h3>消费券信息</h3>
			</div>
			<van-cell
				title="消费券名称"
				:value="couponInfo.couponName || '未命名消费券'"
			/>
			<van-cell
				title="面值"
				:value="couponInfo.unitValue ? '￥' + couponInfo.unitValue : '--'"
			/>
			<van-cell
				title="剩余数量"
				:value="couponInfo.remainingQuantity ?? 0"
			/>
			<van-cell
				title="总数量"
				:value="couponInfo.totalQuantity ?? 0"
			/>
		</van-cell-group>

		<!-- 核销表单 -->
		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			required="auto"
		>
			<van-cell-group inset>
				<van-field
					v-model="userName"
					name="userId"
					label="核销用户："
					placeholder="请选择核销用户"
					:rules="rulesRef.userId"
					@click="chooseUser"
					readonly
				/>
				<van-field
					v-model="redeemForm.redemptionQuantity"
					type="number"
					name="redemptionQuantity"
					label="核销数量："
					placeholder="请输入核销数量"
					:rules="rulesRef.redemptionQuantity"
				/>
				<van-field
					v-model="redeemForm.remarks"
					name="remarks"
					label="备注："
					placeholder="请输入备注（可选）"
					type="textarea"
					rows="3"
					autosize
				/>
				<select-pop
					:info="userInfo"
					@select-info="selectUser"
					@cancel-info="cancelUser"
				>
				</select-pop>
			</van-cell-group>
			<div style="margin: 16px">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					:loading="submitLoading"
				>
					确认核销
				</van-button>
			</div>
		</van-form>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { getCpnCouponInfoDetail } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { redeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import { getUserManagerList } from '@/api/user/userManager';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';

const route = useRoute();
const router = useRouter();

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnCouponInfo', '/selfFinance/cpnCouponInfo');
});

// 使用新的NavBar系统
useNavBar({
	title: '核销消费券',
	leftPath: getLeftPath.value,
	visible: true,
});

// 消费券信息
const couponInfo = ref<CpnCouponInfoData | null>(null);

// 核销表单数据
const redeemForm = ref<{
	userId?: number;
	couponId?: number;
	redemptionQuantity?: number;
	remarks?: string;
}>({
	redemptionQuantity: 1,
	remarks: '',
});

// 提交加载状态
const submitLoading = ref<boolean>(false);

// 表单验证规则
const rulesRef = reactive({
	userId: [
		{
			required: true,
			message: '请选择核销用户',
		},
	],
	redemptionQuantity: [
		{
			required: true,
			message: '请输入核销数量',
		},
		{
			validator: (value: number) => {
				if (!value || value <= 0) {
					return '核销数量必须大于0';
				}
				if (couponInfo.value && value > (couponInfo.value.remainingQuantity || 0)) {
					return '核销数量不能大于剩余数量';
				}
				return true;
			},
		},
	],
});

// 用户选择相关
const userName = ref<string>('');
const userInfo = ref<Info>({
	label: 'userId',
	labelName: '核销用户',
	rule: rulesRef.userId,
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	selectValue: redeemForm.value.userId,
	showFlag: false,
	list: [],
});

// 选择用户
const chooseUser = () => {
	userInfo.value.showFlag = true;
};

// 选择用户信息
const selectUser = (type: string, value: string, name: string) => {
	userInfo.value.showFlag = false;
	if (type === 'userId') {
		redeemForm.value.userId = Number(value);
		userName.value = name;
	}
};

// 取消选择用户
const cancelUser = () => {
	userInfo.value.showFlag = false;
};

// 提交核销
const onSubmit = async () => {
	if (!redeemForm.value.userId || !redeemForm.value.couponId) {
		showFailToast('请选择核销用户');
		return;
	}
	if (!redeemForm.value.redemptionQuantity || redeemForm.value.redemptionQuantity <= 0) {
		showFailToast('请输入有效的核销数量');
		return;
	}
	if (couponInfo.value && redeemForm.value.redemptionQuantity > (couponInfo.value.remainingQuantity || 0)) {
		showFailToast('核销数量不能大于剩余数量');
		return;
	}
	submitLoading.value = true;
	try {
		const { code, message } = await redeemCpnUserCouponInfo({
			userId: redeemForm.value.userId,
			couponId: redeemForm.value.couponId,
			redemptionQuantity: redeemForm.value.redemptionQuantity,
			remarks: redeemForm.value.remarks || '核销消费券',
		});
		if (code === '200') {
			showSuccessToast(message || '核销成功！');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '核销失败，请联系管理员！');
		}
	} catch (error) {
		showFailToast('核销失败，请稍后重试！');
	} finally {
		submitLoading.value = false;
	}
};

// 初始化用户列表
const initUserList = async () => {
	try {
		const { code, data } = await getUserManagerList({});
		if (code === '200') {
			userInfo.value.list = data || [];
		}
	} catch (error) {
		showFailToast('获取用户列表失败！');
	}
};

// 初始化消费券信息
const initCouponInfo = async () => {
	const couponId = route?.query?.couponId as string;
	if (!couponId) {
		showFailToast('缺少消费券ID');
		router.push({ path: getLeftPath.value });
		return;
	}
	try {
		const { code, data, message } = await getCpnCouponInfoDetail(couponId);
		if (code === '200') {
			couponInfo.value = data || null;
			redeemForm.value.couponId = Number(couponId);
			if (couponInfo.value && (!couponInfo.value.remainingQuantity || couponInfo.value.remainingQuantity <= 0)) {
				showFailToast('该消费券已无剩余数量，无法核销！');
				router.push({ path: getLeftPath.value });
			}
		} else {
			showFailToast(message || '获取消费券信息失败！');
			router.push({ path: getLeftPath.value });
		}
	} catch (error) {
		showFailToast('获取消费券信息失败！');
		router.push({ path: getLeftPath.value });
	}
};

// 初始化
onMounted(async () => {
	await Promise.all([initCouponInfo(), initUserList()]);
});
</script>

<style lang="less" scoped>
.redeem-page {
	padding: 16px;
}

.coupon-card {
	margin-bottom: 16px;

	.coupon-header {
		padding: 12px 16px;
		background-color: #f7f8fa;
		border-bottom: 1px solid #ebedf0;

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 500;
			color: #323233;
		}
	}
}
</style>
