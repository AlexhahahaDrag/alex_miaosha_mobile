<template>
	<div class="gift-analysis">
		<section class="report-card">
			<div>
				<span>收礼总额</span>
				<strong>{{ formatMoney(report.receive) }}</strong>
			</div>
			<div>
				<span>随礼/回礼</span>
				<strong>{{ formatMoney(report.give) }}</strong>
			</div>
			<div>
				<span>人情净值</span>
				<strong>{{ formatMoney(report.net) }}</strong>
			</div>
		</section>
		<section class="rank-card">
			<h3>方向统计</h3>
			<div
				v-for="item in rows"
				:key="item.label"
				class="rank-row"
			>
				<span>{{ item.label }}</span>
				<strong>{{ item.count }} 笔 · {{ formatMoney(item.amount) }}</strong>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getGiftAnalysisOverview } from '@/views/finance/gift/analysis/api';
import { GIFT_TAB_BAR, directionText, formatMoney } from '@/views/finance/gift/config';

useNavBar({ title: '统计报表', visible: true });

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const report = reactive({ receive: 0, give: 0, net: 0 });
const rows = ref<{ label: string; count: number; amount: number }[]>([]);

// 统计口径改为后端 /gift-analysis/overview 全量聚合，
// 替代旧实现"拉取前 200 条记录本地计算"（数据多时会截断失真）
const load = async () => {
	const { code, data, message } = await getGiftAnalysisOverview();
	if (code !== '200' || !data) {
		showFailToast(message || '统计加载失败');
		return;
	}
	report.receive = Number(data.receiveAmount || 0);
	// 随礼/回礼支出 = 送礼 + 回礼
	report.give = Number(data.giveAmount || 0) + Number(data.returnAmount || 0);
	report.net = Number(data.netAmount ?? report.receive - report.give);
	rows.value = [
		{
			label: directionText('RECEIVE'),
			count: Number(data.receiveCount || 0),
			amount: Number(data.receiveAmount || 0),
		},
		{
			label: directionText('GIVE'),
			count: Number(data.giveCount || 0),
			amount: Number(data.giveAmount || 0),
		},
		{
			label: directionText('RETURN'),
			count: Number(data.returnCount || 0),
			amount: Number(data.returnAmount || 0),
		},
	];
};

void load();
</script>

<style scoped lang="less">
.gift-analysis {
	box-sizing: border-box;
	min-height: 100%;
	padding: 14px;
	background: #f8fbff;
}

.report-card,
.rank-card {
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
	padding: 16px;
	margin-bottom: 14px;
}

.report-card {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.report-card span,
.rank-row span {
	color: #8a94a6;
	font-size: 12px;
}

.report-card strong,
.rank-row strong {
	display: block;
	margin-top: 8px;
	color: #1f2937;
}

.rank-card h3 {
	margin: 0 0 12px;
	font-size: 16px;
}

.rank-row {
	display: flex;
	justify-content: space-between;
	padding: 12px 0;
	border-top: 1px solid #f1f5f9;
}
</style>
