<template>
	<div class="all-content" :style="{ background: info?.color || '#1c54aa' }">
		<div class="info">
			<div class="content-title">
				<SvgIcon :name="info?.icon || ''" class="content-svg"></SvgIcon>
				<div class="content-title-desc">
					<span>{{ info?.title || '' }}</span>
				</div>
			</div>
			<div class="content-value">
				<div>
					<span>
						{{ info?.value || '--' }}
					</span>
				</div>
				<div>{{ info?.unit }}</div>
			</div>
			<div class="content-percent">
				<div v-if="info?.showYear">
					<span>同比：</span>
					<span class="chain-svg">{{ info?.year || '--' }}%</span>
					<SvgIcon
						name="up"
						v-if="info?.year && info?.year > 0"
						style="width: 10px; height: 10px"
					></SvgIcon>
					<SvgIcon
						name="down"
						v-if="info?.year && info?.year < 0"
						style="width: 10px; height: 10px"
					></SvgIcon>
				</div>
				<div v-if="info?.showChain">
					<span>环比：</span>
					<span class="chain-svg">{{ info?.chain || '--' }}%</span>
					<SvgIcon
						name="up"
						v-if="info?.chain && info.chain > 0"
						style="width: 10px; height: 10px"
					></SvgIcon>
					<SvgIcon
						name="down"
						v-if="info?.chain && info.chain < 0"
						style="width: 10px; height: 10px"
					></SvgIcon>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { Info } from '@/views/common/boardData/config';

interface Props {
	info: Info;
}

const props = defineProps<Props>();

const info = ref<Info>(props.info);

watch(
	() => props.info,
	() => {
		info.value = props.info;
	},
);
</script>
<style lang="scss" scoped>
.all-content {
	width: 100%;
	border-radius: 5%;
	.info {
		margin: 10px 10px 10px 10px;
		.content-title {
			display: flex;
			align-items: center;
			.content-svg {
				width: 1.5em;
				height: 1.5em;
				font-size: 16px;
				cursor: pointer;
			}

			.content-title-desc {
				margin-left: 5px;
				vertical-align: bottom;
				span {
					font-size: 13px;
					font-weight: 400;
					color: #ffffff;
					bottom: 0;
				}
			}
		}

		.content-value {
			margin-top: 10px;
			color: #ffffff;
			text-align: right;
			display: flex;
			justify-content: space-between;
			align-items: end;
			padding-left: 15px;
			span {
				font-size: 25px;
			}
		}

		.content-percent {
			color: #ffffff;
			align-items: end;
			margin-top: 10px;
			div {
				width: 100%;
			}
			.chain-svg {
				margin-right: 10px;
			}
			span {
				font-size: 10px;
			}
		}
	}
}
</style>
